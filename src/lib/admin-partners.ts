import type { Shop, Listing } from "./marketplace-model";
import type { Order } from "./types";

// Explicit test names also cover older manual tests created before DKB-TEST IDs.
export function isInternalOrder(
  order: Pick<Order, "orderId" | "customerInfo">,
) {
  return (
    order.orderId.startsWith("DKB-TEST-") ||
    /^TEST\s+INTERNE\b/i.test(order.customerInfo?.name?.trim() || "")
  );
}
export function partnerOverview(
  shops: Shop[],
  listings: Listing[],
  publicShops: Shop[],
  publicListings: Listing[],
) {
  const publicIds = new Set(publicShops.map((s) => s.id));
  const visible = publicListings.filter((l) => publicIds.has(l.shop_id));
  return {
    publishedShops: publicShops.length,
    visibleProducts: visible.length,
    pendingShops: shops.filter((s) => s.status === "pending"),
    pendingProducts: listings.filter((l) => l.status === "pending"),
    suspendedShops: shops.filter((s) => s.status === "suspended").length,
    shops: shops
      .map((shop) => ({
        shop,
        visible: visible.filter((l) => l.shop_id === shop.id).length,
        total: listings.filter((l) => l.shop_id === shop.id).length,
      }))
      .sort(
        (a, b) =>
          b.visible - a.visible ||
          a.shop.profile.name.localeCompare(b.shop.profile.name, "fr"),
      ),
  };
}
