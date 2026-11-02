"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Shirt, Smartphone, Sparkles, House, ShoppingBasket, Sun, Store } from "lucide-react";

const featuredCategories = [
  { name: "Mode", icon: Shirt },
  { name: "Téléphones", icon: Smartphone },
  { name: "Beauté", icon: Sparkles },
  { name: "Maison", icon: House },
  { name: "Alimentation", icon: ShoppingBasket },
  { name: "Solaire", icon: Sun },
];
import {
  availabilityLabels,
  contactUrl,
  isSponsored,
  isProductUrl,
  type Shop,
  type Listing,
} from "@/lib/marketplace-model";

export function MarketplaceNav() {
  return (
    <header className="border-b-4 border-yellow-400 bg-white text-slate-900">
      <nav
        className="container flex flex-wrap items-center justify-between gap-4 py-2"
        aria-label="Navigation DakarBoutik"
      >
        <Link className="inline-flex items-center" href="/boutiques" aria-label="DakarBoutik — accueil">
          <img src="/dakarboutik-logo-tricolore.png" alt="DakarBoutik" width={96} height={96} className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
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
        {isProductUrl(p.productUrl) && (
          <a href={p.productUrl} target="_blank" rel="noopener noreferrer nofollow ugc" className="block text-sm underline">
            Voir la fiche produit sur le site externe ↗
          </a>
        )}
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
            Demander la disponibilité sur WhatsApp
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
  const categories = Array.from(new Set([...featuredCategories.map((c) => c.name), ...shops.map((s) => s.profile.category), ...listings.map((l) => l.details.category)])).sort();
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
        <section className="border-b-8 border-yellow-400 bg-gradient-to-br from-emerald-700 to-green-700 text-white">
          <div className="container py-7 md:py-10">
            <p className="mb-3 text-xs uppercase tracking-widest text-emerald-200">
              Les boutiques physiques prennent leur place en ligne
            </p>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
              Vos boutiques à Dakar,
              <br />
              <span className="text-yellow-300">leurs nouveautés à portée de main.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-emerald-100">
              Nouveautés, produits disponibles et bonnes adresses. Contactez
              directement la boutique par WhatsApp ou rendez-vous sur place.
            </p>
            <Link
              href="/commercant"
              className="mt-4 inline-block rounded-full bg-yellow-300 px-6 py-3 font-semibold text-emerald-950 transition-colors hover:bg-yellow-200"
            >
              Présenter ma boutique
            </Link>
          </div>
        </section>
        <div className="container space-y-8 py-6">
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
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          </form>
          <section aria-label="Parcourir par catégorie">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Qu’est-ce qui vous intéresse ?</h2>
              {(category || search || city) && <button type="button" onClick={() => { setCategory(""); setSearch(""); setCity(""); }} className="rounded-full border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-800">Effacer les filtres</button>}
            </div>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {featuredCategories.map(({ name, icon: Icon }) => (
                <button key={name} type="button" aria-pressed={category === name} onClick={() => setCategory(category === name ? "" : name)} className={`flex min-w-0 flex-col items-center gap-2 rounded-2xl border p-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 ${category === name ? "border-emerald-700 bg-emerald-700 text-white" : "border-yellow-200 bg-white text-emerald-900 hover:bg-yellow-100"}`}>
                  <Icon aria-hidden="true" className="h-7 w-7" /><span className="break-words">{name}</span>
                </button>
              ))}
            </div>
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
              <div className="rounded-2xl border border-yellow-300 bg-white p-6" role="status">
                <Store aria-hidden="true" className="mb-3 h-8 w-8 text-emerald-700" />
                <h3 className="text-lg font-semibold">{listings.length ? "Aucun produit pour ces critères" : "Les premières nouveautés arrivent bientôt"}</h3>
                <p className="mt-2 text-sm text-slate-600">{listings.length ? "Essayez une autre catégorie ou effacez vos filtres." : "Les produits des boutiques seront présentés ici après validation. Vous êtes commerçant ? Faites découvrir votre sélection."}</p>
                {!listings.length && <Link href="/commercant" className="mt-4 inline-flex rounded-full bg-yellow-300 px-5 py-3 text-sm font-semibold text-emerald-950">Inscrire ma boutique →</Link>}
              </div>
            )}
          </section>
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
          {spotlight}
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
