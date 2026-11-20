import { MarketplaceDashboard } from "@/components/marketplace/dashboard";
export default async function AdminBoutiquesPage({searchParams}: {searchParams: Promise<{shop?: string}>}) {
  const params = await searchParams;
  const shopId = typeof params.shop === "string" && /^[0-9a-f-]{36}$/i.test(params.shop) ? params.shop : "";
  return <MarketplaceDashboard key={shopId} admin initialShopId={shopId} />;
}
