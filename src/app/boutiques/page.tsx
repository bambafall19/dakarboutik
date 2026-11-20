import { AdvertisingSlot } from "@/components/advertising-slot";
import { MarketplaceCatalog } from "@/components/marketplace/catalog";
import { publicMarketplace } from "@/lib/marketplace-server";
import { MarketplaceSpotlight } from "@/components/marketplace/spotlight";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; maxPrice?: string }>;
}) {
  const params = await searchParams;
  const maxPrice =
    typeof params.maxPrice === "string" && /^\d{1,12}$/.test(params.maxPrice)
      ? params.maxPrice
      : "";
  const data = await publicMarketplace();
  return (
    <MarketplaceCatalog
      key={`${params.q || ""}:${params.category || ""}:${maxPrice}`}
      initialMaxPrice={maxPrice}
      initialSearch={params.q || ""}
      initialCategory={params.category || ""}
      {...data}
      spotlight={
        <>
          <AdvertisingSlot placement="shops" />
          <MarketplaceSpotlight shops={data.shops} now={Date.now()} />
        </>
      }
    />
  );
}
