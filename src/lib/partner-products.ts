import type { Listing } from "./marketplace-model";

export function partnerProductUrl(listing: Pick<Listing, "id" | "shop_id">) {
  return `/boutiques/${encodeURIComponent(listing.shop_id)}/produits/${encodeURIComponent(listing.id)}`;
}

export type ProductSort = "newest" | "price-asc" | "price-desc";
export function priceBounds(min: string, max: string) {
  const parse = (value: string) =>
    value.trim() === ""
      ? undefined
      : /^\d+$/.test(value.trim())
        ? Number(value)
        : NaN;
  const lower = parse(min),
    upper = parse(max);
  const valid =
    [lower, upper].every(
      (n) => n === undefined || (Number.isSafeInteger(n) && n >= 0),
    ) && !(lower !== undefined && upper !== undefined && lower > upper);
  return { lower, upper, valid };
}

export function priceAndSort(
  listings: Listing[],
  min: string,
  max: string,
  sort: ProductSort,
) {
  const { lower, upper, valid } = priceBounds(min, max);
  if (!valid) return [];
  return listings
    .filter(
      (l) =>
        (lower === undefined || l.details.price >= lower) &&
        (upper === undefined || l.details.price <= upper),
    )
    .sort((a, b) => {
      const price =
        sort === "price-asc"
          ? a.details.price - b.details.price
          : sort === "price-desc"
            ? b.details.price - a.details.price
            : 0;
      return (
        price ||
        Date.parse(b.created_at) - Date.parse(a.created_at) ||
        a.id.localeCompare(b.id)
      );
    });
}
