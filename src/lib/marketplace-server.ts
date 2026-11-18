import "server-only";
import { query } from "@/lib/db";
import type { Shop, Listing } from "./marketplace-model";
import { billingEnabled } from "./merchant-plans";

export async function publicMarketplace() {
  const entitled = billingEnabled() ? " and exists (select 1 from marketplace_memberships m where m.shop_id=marketplace_shops.id and (m.state='legacy' or (m.state='active' and m.valid_until>now())))" : "";
  const shops = await query<Shop>(
    `select id,profile,status,sponsored_until,updated_at from marketplace_shops where status='approved'${entitled} order by (sponsored_until > now()) desc nulls last, created_at desc`,
  );
  const listings = await query<Listing>(
    `select l.* from marketplace_listings l join marketplace_shops s on s.id=l.shop_id where l.status='approved' and s.status='approved'${billingEnabled()?" and exists (select 1 from marketplace_memberships m where m.shop_id=s.id and (m.state='legacy' or (m.state='active' and m.valid_until>now())))":""} order by l.created_at desc`,
  );
  return { shops, listings };
}
