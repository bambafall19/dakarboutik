import { MarketplaceCatalog } from "@/components/marketplace/catalog";
import { publicMarketplace } from "@/lib/marketplace-server";
import { MarketplaceSpotlight } from "@/components/marketplace/spotlight";
export const dynamic = "force-dynamic";
export default async function Page() {
  const data = await publicMarketplace();
  // Server-only, force-dynamic page: evaluate campaign dates once per request.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  return <MarketplaceCatalog {...data} spotlight={<MarketplaceSpotlight shops={data.shops} now={now} />} />;
}
