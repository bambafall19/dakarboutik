import "server-only";
import { query } from "@/lib/db";
import type { Shop, Listing } from "./marketplace-model";

export async function publicMarketplace() {
  const shops = await query<Shop>(
    `select id,profile,status,sponsored_until,updated_at from marketplace_shops where status='approved' order by (sponsored_until > now()) desc nulls last, created_at desc`,
  );
  const listings = await query<Listing>(
    `select l.* from marketplace_listings l join marketplace_shops s on s.id=l.shop_id where l.status='approved' and s.status='approved' order by l.created_at desc`,
  );
  return { shops, listings };
}
