import {
  matchesMarketplaceCategory,
  normalizeMarketplaceText,
  type Listing,
  type Shop,
} from "./marketplace-model";

export const MARKETPLACE_CATEGORIES = [
  "Mode",
  "Téléphones",
  "Informatique",
  "Beauté",
  "Maison",
  "Alimentation",
  "Solaire",
  "Auto et moto",
  "Loisirs",
] as const;

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
