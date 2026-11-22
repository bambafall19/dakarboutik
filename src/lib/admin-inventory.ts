import type { Listing, Shop } from "./marketplace-model";
import { canonicalCategory } from "./marketplace-discovery";

export function adminInventoryCategories(listings: Listing[]) {
  const names = new Map<string,string>();
  for (const item of listings) {
    const name = canonicalCategory(item.details.category);
    const key = normalize(name);
    if (key && !names.has(key)) names.set(key,name);
  }
  return [...names.values()].sort((a,b) => a.localeCompare(b,"fr"));
}

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").trim();

export function filterAdminInventory(listings: Listing[], shops: Shop[], filters: {shopId?: string; search?: string; category?: string; status?: string; archive?: boolean; availability?: string}) {
  const names = new Map(shops.map(shop => [shop.id, shop.profile.name]));
  const words = normalize(filters.search || "").split(/\s+/).filter(Boolean);
  return listings.filter(listing => {
    if (filters.shopId && listing.shop_id !== filters.shopId) return false;
    if ((listing.status === "suspended") !== !!filters.archive) return false;
    if (!filters.archive && filters.status && listing.status !== filters.status) return false;
    if (filters.category && normalize(canonicalCategory(listing.details.category)) !== normalize(canonicalCategory(filters.category))) return false;
    if (filters.availability && listing.details.availability !== filters.availability) return false;
    const text = normalize(`${listing.details.title} ${listing.details.description} ${names.get(listing.shop_id) || ""}`);
    return words.every(word => text.includes(word));
  });
}
