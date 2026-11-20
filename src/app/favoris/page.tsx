import { MarketplaceNav } from "@/components/marketplace/catalog";
import { PartnerFavorites } from "@/components/marketplace/favorites";
import { publicMarketplace } from "@/lib/marketplace-server";
export const dynamic = "force-dynamic";
export default async function FavoritesPage() {
  const data = await publicMarketplace();
  return (
    <>
      <MarketplaceNav compact />
      <main className="container space-y-6 py-6 text-slate-900">
        <h1 className="text-3xl font-bold">Mes produits favoris</h1>
        <PartnerFavorites {...data} />
      </main>
    </>
  );
}
