import { MarketplaceDashboard } from "@/components/marketplace/dashboard";
export default async function AdminBoutiquesPage({searchParams}: {searchParams: Promise<{shop?: string;statut?:string;validation?:string}>}) {
  const params = await searchParams;
  const shopId = typeof params.shop === "string" && /^[0-9a-f-]{36}$/i.test(params.shop) ? params.shop : "";
  const status=params.statut==='pending'?'pending':'';
  const shopStatus=params.validation==='boutiques'?'pending':'';
  return <MarketplaceDashboard key={`${shopId}-${status}-${shopStatus}`} admin initialShopId={shopId} initialStatus={status} initialShopStatus={shopStatus} />;
}
