import { AdvertisingSlot } from '@/components/advertising-slot';
import { MarketplaceCatalog } from "@/components/marketplace/catalog";
import { publicMarketplace } from "@/lib/marketplace-server";
import { MarketplaceSpotlight } from "@/components/marketplace/spotlight";
import { ProductSpotlight } from "@/components/product-spotlight";
import { getProducts, getBanners } from "@/lib/data-firebase";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; source?: string }> }) {
  const params = await searchParams;
  const [data, products, banners] = await Promise.all([publicMarketplace(), getProducts(), getBanners()]);
  // Server-only dynamic page: evaluate campaign dates once per request.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  return <MarketplaceCatalog key={`${params.q || ""}:${params.source || ""}`} initialSearch={params.q || ""} initialSource={params.source || "partenaires"} {...data} products={products} promotion={<ProductSpotlight products={products} banners={banners} />} spotlight={<><AdvertisingSlot placement="shops" /><MarketplaceSpotlight shops={data.shops} now={now} /></>} />;
}
