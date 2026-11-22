import {
  matchesMarketplaceCategory,
  normalizeMarketplaceText,
  type Listing,
  type Shop,
} from "./marketplace-model";

export const MARKETPLACE_CATEGORIES = [
  "Mode & Beauté",
  "Téléphones",
  "Informatique",
  "Parfumerie",
  "Maison",
  "Alimentation",
  "Solaire",
  "Auto et moto",
  "Loisirs",
] as const;

export function canonicalCategory(label: string) {
  const key = normalizeMarketplaceText(label);
  if (['mode', 'beaute', 'mode & beaute', 'mode et beaute'].includes(key)) return 'Mode & Beauté';
  if (['parfum', 'parfums', 'parfumerie'].includes(key)) return 'Parfumerie';
  return MARKETPLACE_CATEGORIES.find(name => normalizeMarketplaceText(name) === key) || label.trim();
}

export function catalogueCategories(labels: string[]) {
  const names = new Map<string, string>();
  for (const label of [...MARKETPLACE_CATEGORIES, ...labels]) {
    const name = canonicalCategory(label);
    const key = normalizeMarketplaceText(name);
    if (key && !names.has(key)) names.set(key, name);
  }
  return [...names.values()].sort((a, b) => a.localeCompare(b, "fr"));
}

export function matchesPartnerSearch(
  listing: Listing,
  shop: Shop,
  search: string,
) {
  const haystack = normalizeMarketplaceText(
    `${listing.details.title} ${listing.details.description} ${listing.details.category} ${shop.profile.name} ${shop.profile.city} ${shop.profile.district}`,
  );
  return normalizeMarketplaceText(search)
    .split(" ")
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function partnerCategoryMatches(listing: Listing, category: string) {
  return matchesMarketplaceCategory(listing.details, category);
}

export function rankActiveShops(shops: Shop[], listings: Listing[]) {
  const counts = new Map<string, number>();
  for (const listing of listings) {
    if (listing.status === "approved")
      counts.set(listing.shop_id, (counts.get(listing.shop_id) ?? 0) + 1);
  }
  return shops
    .filter((shop) => shop.status === "approved")
    .map((shop) => ({ shop, count: counts.get(shop.id) ?? 0 }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.shop.profile.name.localeCompare(b.shop.profile.name, "fr"),
    );
}

export function partnerSearchUrl(search = "", category = "") {
  const params = new URLSearchParams();
  if (search.trim()) params.set("q", search.trim());
  if (category) params.set("category", category);
  return `/boutiques${params.size ? `?${params}` : ""}#recherche`;
}
