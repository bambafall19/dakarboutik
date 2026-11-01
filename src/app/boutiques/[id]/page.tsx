import { notFound } from "next/navigation";
import { MarketplaceNav, ListingCard } from "@/components/marketplace/catalog";
import { publicMarketplace } from "@/lib/marketplace-server";
import { contactUrl, isSponsored } from "@/lib/marketplace-model";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { shops, listings } = await publicMarketplace();
  const shop = shops.find((s) => s.id === id);
  if (!shop) notFound();
  const p = shop.profile;
  return (
    <>
      <MarketplaceNav />
      <main className="container space-y-8 py-10">
        <header className="rounded-2xl bg-emerald-950 p-8 text-white">
          {isSponsored(shop) && (
            <p className="mb-3 text-amber-200">Sponsorisé</p>
          )}
          {p.image && (
            <img
              src={p.image}
              alt={p.name}
              className="mb-5 max-h-64 w-full rounded-xl object-contain"
              referrerPolicy="no-referrer"
            />
          )}
          <p>{p.category}</p>
          <h1 className="my-4 text-4xl font-bold">{p.name}</h1>
          <p className="max-w-3xl whitespace-pre-line">{p.description}</p>
          <p className="mt-5">
            {p.address}, {p.district}, {p.city}
          </p>
          <p className="my-3">
            Horaires : {p.hours || "À confirmer auprès de la boutique"}
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              className="rounded-full bg-white px-5 py-3 font-semibold text-emerald-950"
              href={contactUrl(shop)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contacter sur WhatsApp
            </a>
            <a
              className="rounded-full border px-5 py-3"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.address}, ${p.district}, ${p.city}, Sénégal`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Trouver la boutique
            </a>
          </div>
        </header>
        <h2 className="text-2xl font-bold">Produits et disponibilités</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings
            .filter((l) => l.shop_id === id)
            .map((l) => (
              <ListingCard key={l.id} listing={l} shop={shop} />
            ))}
        </div>
        {!listings.some((l) => l.shop_id === id) && (
          <p>Cette boutique n’a pas encore de produits publiés.</p>
        )}
      </main>
    </>
  );
}
