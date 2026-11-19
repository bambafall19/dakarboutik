import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketplaceNav, ListingCard } from "@/components/marketplace/catalog";
import { publicMarketplace } from "@/lib/marketplace-server";
import {
  availabilityLabels,
  contactUrl,
  isProductUrl,
} from "@/lib/marketplace-model";

export const dynamic = "force-dynamic";
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string; productId: string }>;
}) {
  const { id, productId } = await params;
  const { shops, listings } = await publicMarketplace();
  const shop = shops.find((s) => s.id === id);
  const listing = listings.find((l) => l.id === productId && l.shop_id === id);
  if (!shop || !listing) notFound();
  const p = listing.details;
  const others = listings
    .filter((l) => l.shop_id === id && l.id !== productId)
    .slice(0, 3);
  return (
    <>
      <MarketplaceNav compact />
      <main className="container space-y-8 py-6 text-slate-900">
        <nav aria-label="Fil d’Ariane" className="flex flex-wrap gap-2 text-sm">
          <Link href="/boutiques" className="underline">
            Produits partenaires
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/boutiques/${shop.id}`} className="underline">
            {shop.profile.name}
          </Link>
        </nav>
        <article className="grid min-w-0 gap-6 rounded-2xl border bg-white p-4 md:grid-cols-2 md:p-8">
          <div className="min-w-0 rounded-xl bg-slate-50 p-3">
            {p.image ? (
              <a
                href={p.image}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Agrandir la photo du produit"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="max-h-[32rem] w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </a>
            ) : (
              <p className="p-12 text-center">Photo à venir</p>
            )}
          </div>
          <div className="min-w-0 space-y-5 break-words">
            <p className="font-semibold text-emerald-800">
              {p.category} · {availabilityLabels[p.availability]}
            </p>
            <h1 className="text-2xl font-bold md:text-3xl">{p.title}</h1>
            <p className="text-2xl font-bold text-emerald-800">
              {p.price.toLocaleString("fr-FR")} FCFA
            </p>
            <p>
              Proposé par{" "}
              <Link
                href={`/boutiques/${shop.id}`}
                className="font-semibold underline"
              >
                {shop.profile.name}
              </Link>{" "}
              · {shop.profile.city}
            </p>
            <p className="text-sm text-slate-600">
              Disponibilité actualisée le{" "}
              {new Date(listing.updated_at).toLocaleDateString("fr-FR", {
                timeZone: "Africa/Dakar",
              })}
            </p>
            {p.availability !== "sold_out" ? (
              <a
                href={contactUrl(shop, listing)}
            data-engagement-audience="partner" data-shop-id={shop.id}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 font-semibold text-white"
              >
                Contacter le vendeur
              </a>
            ) : (
              <p className="font-semibold">
                Ce produit est actuellement épuisé.
              </p>
            )}
            <p className="rounded-xl bg-emerald-50 p-4 text-sm leading-relaxed">
              Le prix, la disponibilité, la livraison, le paiement et la
              garantie sont à confirmer directement avec la boutique. Aucun
              paiement n’est encaissé ici.
            </p>
          </div>
          <section
            className="min-w-0 space-y-3 md:col-span-2"
            aria-labelledby="product-description"
          >
            <h2 id="product-description" className="text-xl font-bold">
              Description du produit
            </h2>
            <p className="whitespace-pre-line break-words leading-relaxed">
              {p.description}
            </p>
            {isProductUrl(p.productUrl) && (
              <a
                href={p.productUrl}
                target="_blank"
                rel="noopener noreferrer nofollow ugc"
                className="inline-flex min-h-11 items-center underline"
              >
                Fiche complémentaire sur le site du vendeur ↗
              </a>
            )}
          </section>
        </article>
        <section
          className="space-y-3 rounded-2xl border p-5"
          aria-labelledby="seller-title"
        >
          <h2 id="seller-title" className="text-xl font-bold">
            La boutique {shop.profile.name}
          </h2>
          <p>
            {shop.profile.address}, {shop.profile.district}, {shop.profile.city}
          </p>
          <p>
            Horaires :{" "}
            {shop.profile.hours || "À confirmer auprès de la boutique"}
          </p>
          <Link
            href={`/boutiques/${shop.id}`}
            className="inline-flex min-h-11 items-center font-semibold text-emerald-800 underline"
          >
            Voir tous les produits de cette boutique
          </Link>
        </section>
        {others.length > 0 && (
          <section aria-labelledby="other-products">
            <h2 id="other-products" className="mb-4 text-2xl font-bold">
              Dans la même boutique
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((l) => (
                <ListingCard key={l.id} listing={l} shop={shop} compact />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
