import { MarketplaceDashboard } from "@/components/marketplace/dashboard";
export default async function Page({ searchParams }: { searchParams: Promise<{ inscription?: string; forfait?: string; publicite?: string }> }) {
  const params = await searchParams;
  return <MarketplaceDashboard inscription={params.inscription === "1"} initialPlan={params.forfait} initialVisibility={params.publicite} />;
}
