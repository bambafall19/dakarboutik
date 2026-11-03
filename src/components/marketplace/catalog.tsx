"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useProducts } from "@/hooks/use-site-data";
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
  normalizeMarketplaceText,
  matchesMarketplaceCategory,
  type Shop,
  type Listing,
} from "@/lib/marketplace-model";

export function MarketplaceNav({ compact = false }: { compact?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="border-b-4 border-yellow-400 bg-white text-slate-900">
      <nav
        className="container flex flex-wrap items-center justify-between gap-4 py-2"
        aria-label="Navigation DakarBoutik"
      >
        <Link className="inline-flex items-center" href="/boutiques" aria-label="DakarBoutik — accueil">
          <img src="/dakarboutik-logo-tricolore.png" alt="DakarBoutik" width={96} height={96} className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
        </Link>
        {compact && <button type="button" aria-expanded={menuOpen} aria-controls="marketplace-menu" onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold md:hidden">{menuOpen ? "Fermer" : "Menu"}</button>}
        <div id="marketplace-menu" className={`${compact && !menuOpen ? "hidden md:flex" : "flex"} flex-wrap gap-5 text-sm`}>
          <Link href="/boutiques">Boutiques partenaires</Link>
          <Link href="/products" className="font-bold text-emerald-800">Acheter chez DakarBoutik</Link>
          <Link href="/checkout">Mon panier</Link>
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
        <Link
          className="flex items-center justify-center gap-2 rounded-xl border border-emerald-700 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          href={`/boutiques/${shop.id}`}
        >
          <Store className="h-5 w-5 shrink-0" aria-hidden="true" />
          Voir tous les produits de cette boutique
        </Link>
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
function OfficialStore({ category, search }: { category: string; search: string }) {
  const { products, loading } = useProducts();
  const term = normalizeMarketplaceText(search);
  const matches = products.filter(p => p.status === "active" && matchesMarketplaceCategory(p, category) &&
    (!term || normalizeMarketplaceText(`${p.title} ${p.description} ${p.category}`).includes(term)));
  const selection = category || term ? matches : matches.slice(0, 4);
  return <section aria-labelledby="official-store-title" className="rounded-3xl border border-yellow-300 bg-white p-5 md:p-7">
    <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Vente directe · Vendu par DakarBoutik</p>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
      <h2 id="official-store-title" tabIndex={-1} className="scroll-mt-6 text-2xl font-bold focus:outline-none">{category ? `${category} · Produits DakarBoutik` : "Boutique officielle DakarBoutik"}</h2>
      <Link href="/products" className="rounded-full bg-yellow-300 px-5 py-3 font-semibold text-emerald-950">Tous nos produits →</Link>
    </div>
    <p className="mt-3 text-sm text-slate-600">Électronique, maison, mode et bien plus. Choisissez votre produit, puis commandez avec le panier ou par WhatsApp.</p>
    {!loading && <p role="status" className="mt-4 text-sm text-slate-600">{matches.length ? `${matches.length} produit(s) DakarBoutik correspondant(s).` : "Aucun produit DakarBoutik ne correspond à ces critères. Retrouvez les partenaires ci-dessous."}</p>}
    {loading ? <p className="mt-5" role="status">Chargement du catalogue…</p> : <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {selection.map(p => <Link key={p.id} href={`/products/${p.slug}`} className="min-w-0 rounded-2xl border p-4 transition-colors hover:border-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700">
        {p.images?.[0]?.imageUrl && <img src={p.images[0].imageUrl} alt={p.title} loading="lazy" className="h-40 w-full object-contain" />}
        <h3 className="mt-3 line-clamp-2 font-semibold">{p.title}</h3>
        <p className="mt-2 font-bold text-emerald-800">{(p.salePrice && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price).toLocaleString("fr-FR")} FCFA</p>
        <p className="mt-1 text-xs text-slate-600">{p.stock > 0 ? "En stock" : "Indisponible"}</p>
        <span className="mt-3 block text-sm font-semibold">Voir le produit et commander →</span>
      </Link>)}
    </div>}
  </section>;
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
  const categoryLabels = new Map<string, string>();
  for (const name of [...featuredCategories.map(c => c.name), ...shops.map(s => s.profile.category), ...listings.map(l => l.details.category)]) {
    const key = normalizeMarketplaceText(name);
    if (key && !categoryLabels.has(key)) categoryLabels.set(key, name.trim());
  }
  const categories = Array.from(categoryLabels.values()).sort((a, b) => a.localeCompare(b, "fr"));
  const categoryKey = normalizeMarketplaceText(category);
  const term = normalizeMarketplaceText(search);
  const matchingShops = shops.filter(
    (s) =>
      (!city || s.profile.city === city) &&
      (!category || normalizeMarketplaceText(s.profile.category) === categoryKey ||
        listings.some(l => l.shop_id === s.id && normalizeMarketplaceText(l.details.category) === categoryKey)) &&
      (!term ||
        normalizeMarketplaceText(`${s.profile.name} ${s.profile.description} ${s.profile.district} ${s.profile.city} ${s.profile.category}`)
          .includes(term) || listings.some(l => l.shop_id === s.id &&
            (!category || normalizeMarketplaceText(s.profile.category) === categoryKey || normalizeMarketplaceText(l.details.category) === categoryKey) &&
            normalizeMarketplaceText(`${l.details.title} ${l.details.description} ${l.details.category}`).includes(term))),
  );
  const matchingListings = listings.filter((l) => {
    const s = shops.find((s) => s.id === l.shop_id);
    return (
      s &&
      (!city || s.profile.city === city) &&
      (!category ||
        normalizeMarketplaceText(l.details.category) === categoryKey ||
        normalizeMarketplaceText(s.profile.category) === categoryKey) &&
      (!term ||
        normalizeMarketplaceText(`${l.details.title} ${l.details.description} ${l.details.category} ${s.profile.name} ${s.profile.category} ${s.profile.city} ${s.profile.district}`)
          .includes(term))
    );
  });
  function browseCategory(name: string) {
    setCategory(name);
    setSearch("");
    requestAnimationFrame(() => {
      const heading = document.getElementById("official-store-title");
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }
  return (
    <>
      <MarketplaceNav />
      <main className="marketplace-lively min-h-screen bg-yellow-50/40 text-slate-900">
        <section className="marketplace-welcome relative isolate overflow-hidden border-b-8 border-yellow-400 bg-gradient-to-br from-emerald-700 to-green-700 text-white">
          <div aria-hidden="true" className="marketplace-orb pointer-events-none absolute -right-16 -top-20 -z-10 h-72 w-72 rounded-full border-[28px] border-yellow-300/25 bg-yellow-300/10" />
          <div aria-hidden="true" className="marketplace-orb pointer-events-none absolute -bottom-20 right-1/3 -z-10 h-44 w-44 rounded-full bg-emerald-300/15" />
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
            <a href="#nouveautes" className="ml-0 mt-3 inline-flex rounded-full border border-white/60 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/15 sm:ml-3">Découvrir les nouveautés ↓</a>
          </div>
        </section>
        <div className="container space-y-8 py-6">
          <form
            onSubmit={(e) => e.preventDefault()}
            role="search"
            aria-label="Rechercher une boutique ou un produit"
            className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-3"
          >
            <label className="text-sm">
              Rechercher
              <input
                className="mt-2 w-full rounded-lg border p-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="search"
                placeholder="Produit, boutique, quartier…"
              />
            </label>
            <label className="text-sm">
              Ville des boutiques partenaires
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
                <button key={name} type="button" aria-pressed={categoryKey === normalizeMarketplaceText(name)} onClick={() => browseCategory(name)} className={`flex min-w-0 flex-col items-center gap-2 rounded-2xl border p-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 ${category === name ? "border-emerald-700 bg-emerald-700 text-white" : "border-yellow-200 bg-white text-emerald-900 hover:bg-yellow-100"}`}>
                  <Icon aria-hidden="true" className="h-7 w-7" /><span className="break-words">{name}</span>
                </button>
              ))}
            </div>
          </section>
          <OfficialStore category={category} search={search} />
          <section id="nouveautes" className="scroll-mt-6">
            <h2 className="mb-2 text-2xl font-bold">
              Produits des boutiques partenaires
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
            <h2 id="boutiques-resultats" tabIndex={-1} className="mb-3 scroll-mt-6 text-2xl font-bold focus:outline-none">
              {category ? `Les boutiques · ${category}` : "Les boutiques à découvrir"}
            </h2>
            <p className="mb-6 text-sm text-slate-600" role="status">
              {matchingShops.length} boutique{matchingShops.length > 1 ? "s" : ""} trouvée{matchingShops.length > 1 ? "s" : ""}. {matchingShops.length > 0 ? "Ouvrez une boutique pour découvrir ses produits." : "Essayez une autre catégorie ou une autre recherche."}
            </p>
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
                      className="mb-4 h-40 w-full rounded-xl bg-slate-50 p-3 object-contain"
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
              <div className="space-y-4 rounded-xl border bg-white p-6">
                <p>{shops.length
                  ? "Aucune boutique ne correspond à ces critères."
                  : "Les premières boutiques seront affichées après validation."}</p>
                {(category || search || city) && <button type="button" onClick={() => { setCategory(""); setSearch(""); setCity(""); }} className="rounded-full bg-emerald-800 px-5 py-3 font-semibold text-white">Voir toutes les boutiques</button>}
              </div>
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
      <style jsx global>{`
        .marketplace-lively { background: linear-gradient(135deg, #f0fdf4, #fffbeb 55%, #fff1f2); }
        .marketplace-welcome .container { animation: marketplace-enter 650ms ease-out both; }
        .marketplace-lively form { box-shadow: 0 12px 30px -20px #065f4660; }
        .marketplace-lively article,
        .marketplace-lively section > .grid > a,
        .marketplace-lively section[aria-label="Parcourir par catégorie"] button {
          transition: transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease;
        }
        .marketplace-lively article { border-top: 4px solid #34d399; }
        .marketplace-lively article:nth-child(3n + 2) { border-top-color: #facc15; }
        .marketplace-lively article:nth-child(3n + 3) { border-top-color: #fb7185; }
        .marketplace-lively article:focus-within { box-shadow: 0 12px 28px -16px #065f4680; }
        .marketplace-orb { animation: marketplace-float 4s ease-in-out 1; }
        @media (hover: hover) {
          .marketplace-lively article:hover,
          .marketplace-lively section > .grid > a:hover,
          .marketplace-lively section[aria-label="Parcourir par catégorie"] button:hover {
            transform: translateY(-4px);
            box-shadow: 0 14px 30px -18px #065f4680;
          }
        }
        @keyframes marketplace-enter {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marketplace-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(18px) rotate(8deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marketplace-lively *, .marketplace-lively *::before, .marketplace-lively *::after {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}
