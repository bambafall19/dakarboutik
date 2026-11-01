import { MarketplaceCatalog } from "@/components/marketplace/catalog";
import { publicMarketplace } from "@/lib/marketplace-server";
export const dynamic = "force-dynamic";
export default async function Page() {
  const data = await publicMarketplace();
  return <MarketplaceCatalog {...data} />;
}
