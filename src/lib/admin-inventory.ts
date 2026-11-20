import type { Listing, Shop } from "./marketplace-model";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").trim();

export function filterAdminInventory(listings: Listing[], shops: Shop[], filters: {shopId?: string; search?: string; category?: string; status?: string; archive?: boolean}) {
  const names = new Map(shops.map(shop => [shop.id, shop.profile.name]));
  const words = normalize(filters.search || "").split(/\s+/).filter(Boolean);
  return listings.filter(listing => {
    if (filters.shopId && listing.shop_id !== filters.shopId) return false;
    if ((listing.status === "suspended") !== !!filters.archive) return false;
    if (!filters.archive && filters.status && listing.status !== filters.status) return false;
    if (filters.category && normalize(listing.details.category) !== normalize(filters.category)) return false;
    const text = normalize(`${listing.details.title} ${listing.details.description} ${names.get(listing.shop_id) || ""}`);
    return words.every(word => text.includes(word));
  });
}
