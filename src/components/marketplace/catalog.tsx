"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  availabilityLabels,
  contactUrl,
  isSponsored,
  type Shop,
  type Listing,
} from "@/lib/marketplace-model";

export function MarketplaceNav() {
  return (
    <header className="border-b-4 border-yellow-400 bg-white text-slate-900">
      <nav
        className="container flex flex-wrap items-center justify-between gap-4 py-5"
        aria-label="Navigation DakarBoutik"
      >
        <Link className="text-2xl font-bold text-emerald-800" href="/boutiques">
          DakarBoutik
        </Link>
        <div className="flex flex-wrap gap-5 text-sm">
          <Link href="/boutiques">Boutiques et produits</Link>
          <Link href="/boutiques#publicite">Publicité</Link>
          <Link href="/boutiques#actualites">Actualités JOJ</Link>
          <Link href="/commercant">Espace commerçant</Link>
        </div>
      </nav>
    </header>
  );
}
export function ListingCard({
  listing,
  shop,
}: {
  listing: Listing;
  shop: Shop;
}) {
  const p = listing.details;
  return (
    <article className="min-w-0 break-words overflow-hidden rounded-2xl border bg-white text-slate-900">
      {p.image ? (
        <img
          className="h-52 w-full object-contain bg-slate-50"
          src={p.image}
          alt={p.title}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-52 items-center justify-center bg-emerald-50 text-emerald-800">
          Photo à venir
        </div>
      )}
      <div className="space-y-3 p-5">
        <span className="text-xs font-semibold text-emerald-800">
          {availabilityLabels[p.availability]}
        </span>
        <h3 className="text-lg font-bold">{p.title}</h3>
        <p className="font-bold">{p.price.toLocaleString("fr-FR")} FCFA</p>
        <p className="whitespace-pre-line text-sm text-slate-600">
          {p.description}
        </p>
        <Link
          className="block text-sm underline"
          href={`/boutiques/${shop.id}`}
        >
          {shop.profile.name} · {shop.profile.city}
        </Link>
        <p className="text-xs text-slate-500">
          Disponibilité actualisée le{" "}
          {new Date(listing.updated_at).toLocaleDateString("fr-FR", {
            timeZone: "Africa/Dakar",
          })}
        </p>
        {p.availability !== "sold_out" && (
          <a
            className="inline-flex rounded-full bg-emerald-800 px-4 py-3 text-sm font-semibold text-white"
            href={contactUrl(shop, listing)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contacter le vendeur
          </a>
        )}
      </div>
    </article>
  );
}
export function MarketplaceCatalog({
  shops,
  listings,
  spotlight,
}: {
  shops: Shop[];
  listings: Listing[];
  spotlight?: ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const term = search.trim().toLocaleLowerCase("fr");
  const matchingShops = shops.filter(
    (s) =>
      (!city || s.profile.city === city) &&
      (!category || s.profile.category === category) &&
      (!term ||
        `${s.profile.name} ${s.profile.description} ${s.profile.district}`
          .toLocaleLowerCase("fr")
          .includes(term)),
  );
  const matchingListings = listings.filter((l) => {
    const s = shops.find((s) => s.id === l.shop_id);
    return (
      s &&
      (!city || s.profile.city === city) &&
      (!category ||
        l.details.category === category ||
        s.profile.category === category) &&
      (!term ||
        `${l.details.title} ${l.details.description} ${s.profile.name}`
          .toLocaleLowerCase("fr")
          .includes(term))
    );
  });
  return (
    <>
      <MarketplaceNav />
      <main className="min-h-screen bg-yellow-50/40 text-slate-900">
        <section className="border-b-8 border-yellow-400 bg-gradient-to-br from-emerald-950 to-emerald-800 text-white">
          <div className="container py-14 md:py-20">
            <p className="mb-4 text-sm uppercase tracking-widest text-emerald-200">
              Les boutiques physiques prennent leur place en ligne
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
              Découvrez près de vous.
              <br />
              <span className="text-yellow-300">Achetez auprès du vendeur.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-emerald-100">
              Nouveautés, produits disponibles et bonnes adresses. Contactez
              directement la boutique par WhatsApp ou rendez-vous sur place.
            </p>
            <Link
              href="/commercant"
              className="mt-7 inline-block rounded-full bg-yellow-300 px-6 py-3 font-semibold text-emerald-950 transition-colors hover:bg-yellow-200"
            >
              Présenter ma boutique
            </Link>
          </div>
        </section>
        <div className="container space-y-12 py-10">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-3"
          >
            <label className="text-sm">
              Rechercher
              <input
                className="mt-2 w-full rounded-lg border p-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Produit, boutique, quartier…"
              />
            </label>
            <label className="text-sm">
              Ville
              <select
                className="mt-2 w-full rounded-lg border p-3"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">Toutes les villes</option>
                {Array.from(new Set(shops.map((s) => s.profile.city)))
                  .sort()
                  .map((c) => (
                    <option key={c}>{c}</option>
                  ))}
              </select>
            </label>
            <label className="text-sm">
              Catégorie
              <select
                className="mt-2 w-full rounded-lg border p-3"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Toutes les catégories</option>
                {Array.from(
                  new Set([
                    ...shops.map((s) => s.profile.category),
                    ...listings.map((l) => l.details.category),
                  ]),
                )
                  .sort()
                  .map((c) => (
                    <option key={c}>{c}</option>
                  ))}
              </select>
            </label>
          </form>
          {spotlight}
          <section>
            <h2 className="mb-6 text-2xl font-bold">
              Les boutiques à découvrir
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {matchingShops.map((shop) => (
                <Link
                  href={`/boutiques/${shop.id}`}
                  key={shop.id}
                  className="rounded-2xl border bg-white p-6"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="text-sm text-emerald-800">
                      {shop.profile.category}
                    </span>
                    {isSponsored(shop) && (
                      <span className="rounded-full bg-yellow-200 px-3 py-1 text-xs text-emerald-950">
                        Sponsorisé
                      </span>
                    )}
                  </div>
                  {shop.profile.image && (
                    <img
                      className="mb-4 h-40 w-full rounded-xl object-cover"
                      src={shop.profile.image}
                      alt={shop.profile.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <h3 className="break-words text-xl font-bold">
                    {shop.profile.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {shop.profile.district} · {shop.profile.city}
                  </p>
                  <p className="mt-4 line-clamp-3 text-sm">
                    {shop.profile.description}
                  </p>
                  <span className="mt-5 block font-semibold text-emerald-800">
                    Voir la boutique →
                  </span>
                </Link>
              ))}
            </div>
            {!matchingShops.length && (
              <p className="rounded-xl border bg-white p-6">
                {shops.length
                  ? "Aucune boutique ne correspond à ces critères."
                  : "Les premières boutiques seront affichées après validation."}
              </p>
            )}
          </section>
          <section>
            <h2 className="mb-2 text-2xl font-bold">
              Nouveautés des boutiques
            </h2>
            <p className="mb-6 text-slate-600">
              Les annonces les plus récentes. Confirmez le prix et la
              disponibilité auprès du vendeur.
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {matchingListings.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  shop={shops.find((s) => s.id === l.shop_id)!}
                />
              ))}
            </div>
            {!matchingListings.length && (
              <p>Aucun produit publié ne correspond à votre recherche.</p>
            )}
          </section>
          <footer className="border-t py-6 text-sm text-slate-600">
            DakarBoutik met en relation clients et boutiques. Le paiement, la
            remise du produit et les conditions de vente se conviennent
            directement avec le vendeur.
          </footer>
        </div>
      </main>
    </>
  );
}
