"use client";
import { scentOptions } from "@/lib/partner-options";
import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import {
  catalogueCategories,
  canonicalCategory,
  matchesPartnerSearch,
  partnerCategoryMatches,
  rankActiveShops,
} from "@/lib/marketplace-discovery";
import {
  partnerProductUrl,
  priceBounds,
  priceAndSort,
  type ProductSort,
} from "@/lib/partner-products";
import { ProductTools } from "./product-actions";
import { Store } from "lucide-react";

import {
  availabilityLabels,
  contactUrl,
  isProductUrl,
  normalizeMarketplaceText,
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
        <Logo />
        <Link
          href="/commercant?inscription=1"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Inscrire ma boutique
        </Link>
        {compact && (
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="marketplace-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold md:hidden"
          >
            {menuOpen ? "Fermer" : "Menu"}
          </button>
        )}
        <div
          id="marketplace-menu"
          className={`${compact && !menuOpen ? "hidden md:flex" : "flex"} flex-wrap gap-5 text-sm`}
        >
          <Link href="/">Accueil</Link>
          <Link href="/boutiques#recherche">Rechercher un produit</Link>
          <Link href="/boutiques" className="font-bold text-emerald-800">
            Boutiques partenaires
          </Link>
          <Link href="/boutiques#publicite">À la une</Link>
          <Link href="/favoris">Mes favoris</Link>
          <Link href="/suivi">Anciennes commandes</Link>
          <Link href="/forfaits">Forfaits et publicité</Link>
          <Link href="/commercant">Espace commerçant</Link>
        </div>
      </nav>
    </header>
  );
}
export function ListingCard({
  listing,
  shop,
  compact = false,
  idPrefix = "produit",
}: {
  listing: Listing;
  shop: Shop;
  compact?: boolean;
  idPrefix?: string;
}) {
  const p = listing.details;
  return (
    <article
      id={`${idPrefix}-${listing.id}`}
      className="scroll-mt-6 min-w-0 break-words overflow-hidden rounded-2xl border bg-white text-slate-900"
    >
      <Link
        href={partnerProductUrl(listing)}
        aria-label={`Voir la fiche de ${p.title}`}
        className="block"
      >
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
      </Link>
      <div className="space-y-3 p-5">
        <span className="text-sm font-semibold text-emerald-800">
          {availabilityLabels[p.availability]}
        </span>
        <h3
          className={`${compact ? "line-clamp-2 min-h-14" : ""} text-lg font-bold`}
        >
          <Link href={partnerProductUrl(listing)} className="hover:underline">
            {p.title}
          </Link>
        </h3>
        <ProductTools listing={listing} />
        <p className="text-xl font-bold text-emerald-800">
          {p.price.toLocaleString("fr-FR")} FCFA
        </p>
        <p
          className={`${compact ? "line-clamp-2" : "whitespace-pre-line"} text-sm text-slate-600`}
        >
          {p.description}
        </p>
        {isProductUrl(p.productUrl) && (
          <a
            href={p.productUrl}
            target="_blank"
            rel="noopener noreferrer nofollow ugc"
            className="block text-sm underline"
          >
            Voir la fiche produit sur le site externe ↗
          </a>
        )}
        <Link
          className="block text-sm underline"
          href={`/boutiques/${shop.id}`}
        >
          Proposé par {shop.profile.name} · {shop.profile.city}
        </Link>
        <p className="text-xs text-slate-500">
          Disponibilité actualisée le{" "}
          {new Date(listing.updated_at).toLocaleDateString("fr-FR", {
            timeZone: "Africa/Dakar",
          })}
        </p>
        <Link
          href={partnerProductUrl(listing)}
          className="flex min-h-11 items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold text-emerald-800"
        >
          Voir la fiche produit
        </Link>
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
            href={
              scentOptions(listing).length
                ? `${partnerProductUrl(listing)}#choix-senteur`
                : contactUrl(shop, listing)
            }
            data-engagement-audience={
              scentOptions(listing).length ? undefined : "partner"
            }
            data-shop-id={scentOptions(listing).length ? undefined : shop.id}
            target="_blank"
            rel="noopener noreferrer"
          >
            {scentOptions(listing).length
              ? "Choisir ma senteur"
              : "Contacter le vendeur"}
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
  initialSearch = "",
  initialCategory = "",
  initialMaxPrice = "",
}: {
  shops: Shop[];
  listings: Listing[];
  spotlight?: ReactNode;
  initialSearch?: string;
  initialCategory?: string;
  initialMaxPrice?: string;
}) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState(canonicalCategory(initialCategory));
  const [availableOnly, setAvailableOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [sort, setSort] = useState<ProductSort>("newest");
  const bounds = priceBounds(minPrice, maxPrice);
  const categories = catalogueCategories(
    listings.map((l) => l.details.category),
  );
  const quickCategories = categories
    .map((name) => ({
      name,
      count: listings.filter((l) => partnerCategoryMatches(l, name)).length,
    }))
    .filter((item) => item.count > 0);
  const shopMap = new Map(shops.map((shop) => [shop.id, shop]));
  const matchingListings = priceAndSort(
    listings.filter((listing) => {
      const shop = shopMap.get(listing.shop_id);
      return (
        shop &&
        (!city ||
          normalizeMarketplaceText(shop.profile.city) ===
            normalizeMarketplaceText(city)) &&
        partnerCategoryMatches(listing, category) &&
        matchesPartnerSearch(listing, shop, search) &&
        (!availableOnly || listing.details.availability === "available")
      );
    }),
    minPrice,
    maxPrice,
    sort,
  );
  const matchingShopIds = new Set(matchingListings.map((l) => l.shop_id));
  const hasFilters = !!(
    search.trim() ||
    city ||
    category ||
    availableOnly ||
    minPrice ||
    maxPrice
  );
  const matchingShops = rankActiveShops(shops, listings).filter(
    ({ shop }) => !hasFilters || matchingShopIds.has(shop.id),
  );
  const clear = () => {
    setSearch("");
    setCity("");
    setCategory("");
    setAvailableOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };
  return (
    <>
      <MarketplaceNav compact />
      <main className="min-h-screen bg-emerald-50/40 pb-12 text-slate-900">
        <section className="border-b border-emerald-100 bg-gradient-to-br from-emerald-50 to-yellow-50">
          <div className="container space-y-3 py-6">
            <h1 className="text-3xl font-bold">
              Les produits des boutiques partenaires
            </h1>
            <p>
              Trouvez un produit, comparez les offres et contactez directement
              le commerçant.
            </p>
          </div>
        </section>
        <div className="container space-y-8 py-6">
          <nav
            aria-label="Rayons des boutiques partenaires"
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              aria-pressed={!category}
              onClick={() => setCategory("")}
              className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold ${!category ? "border-emerald-800 bg-emerald-800 text-white" : "border-emerald-200 bg-white text-emerald-900"}`}
            >
              Tous les rayons
            </button>
            {quickCategories.map((item) => (
              <button
                key={item.name}
                type="button"
                aria-pressed={
                  normalizeMarketplaceText(category) ===
                  normalizeMarketplaceText(item.name)
                }
                onClick={() => setCategory(item.name)}
                className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold ${normalizeMarketplaceText(category) === normalizeMarketplaceText(item.name) ? "border-emerald-800 bg-emerald-800 text-white" : "border-emerald-200 bg-white text-emerald-900"}`}
              >
                {item.name} <span className="ml-1 text-xs">({item.count})</span>
              </button>
            ))}
          </nav>
          <form
            id="recherche"
            role="search"
            aria-label="Rechercher un produit partenaire"
            onSubmit={(e) => e.preventDefault()}
            className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-3"
          >
            <label className="font-semibold">
              Quel produit cherchez-vous ?
              <input
                type="search"
                maxLength={150}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Téléphone, parfum, boutique…"
                className="mt-2 w-full rounded-xl border p-3 font-normal"
              />
            </label>
            <label className="font-semibold">
              Ville
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"
              >
                <option value="">Toutes les villes</option>
                {Array.from(new Set(shops.map((s) => s.profile.city)))
                  .sort()
                  .map((name) => (
                    <option key={name}>{name}</option>
                  ))}
              </select>
            </label>
            <label className="font-semibold">
              Catégorie
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            <label className="font-semibold">
              Prix minimum (FCFA)
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Sans minimum"
                className="mt-2 w-full rounded-xl border p-3 text-base font-normal"
              />
            </label>
            <label className="font-semibold">
              Prix maximum (FCFA)
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Sans maximum"
                className="mt-2 w-full rounded-xl border p-3 text-base font-normal"
              />
            </label>
            <label className="font-semibold">
              Trier par
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ProductSort)}
                className="mt-2 w-full rounded-xl border bg-white p-3 text-base font-normal"
              >
                <option value="newest">Les plus récents</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </label>
            {!bounds.valid && (
              <p role="alert" className="text-red-700 md:col-span-3">
                Saisissez des prix entiers positifs ou nuls, avec un maximum
                supérieur ou égal au minimum.
              </p>
            )}
            <label className="flex min-h-11 items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="h-5 w-5"
              />
              Disponibles maintenant uniquement
            </label>
            {(hasFilters || sort !== "newest") && (
              <button
                type="button"
                onClick={clear}
                className="min-h-11 rounded-xl border px-4 py-2 font-semibold text-emerald-800"
              >
                Effacer les filtres
              </button>
            )}
            <a
              href="#produits-resultats"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white md:col-span-3"
            >
              Voir les {matchingListings.length} produit
              {matchingListings.length > 1 ? "s" : ""}
            </a>
          </form>
          {hasFilters && (
            <div aria-label="Filtres actifs" className="flex flex-wrap gap-2">
              {[
                search.trim()
                  ? {
                      label: "Recherche : " + search.trim(),
                      clear: () => setSearch(""),
                    }
                  : null,
                city
                  ? { label: "Ville : " + city, clear: () => setCity("") }
                  : null,
                category
                  ? {
                      label: "Catégorie : " + category,
                      clear: () => setCategory(""),
                    }
                  : null,
                minPrice
                  ? {
                      label: "Minimum : " + minPrice + " FCFA",
                      clear: () => setMinPrice(""),
                    }
                  : null,
                maxPrice
                  ? {
                      label: "Maximum : " + maxPrice + " FCFA",
                      clear: () => setMaxPrice(""),
                    }
                  : null,
                availableOnly
                  ? {
                      label: "Disponibles maintenant",
                      clear: () => setAvailableOnly(false),
                    }
                  : null,
              ]
                .filter((item) => item !== null)
                .map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.clear}
                    aria-label={"Retirer le filtre " + item.label}
                    className="min-h-11 max-w-full break-words rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-left text-sm text-emerald-900"
                  >
                    {item.label} <span aria-hidden="true">×</span>
                  </button>
                ))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p role="status">
              {matchingListings.length} produit
              {matchingListings.length > 1 ? "s" : ""} · {matchingShops.length}{" "}
              boutique{matchingShops.length > 1 ? "s" : ""}
            </p>
            <button
              type="button"
              onClick={() => startRefresh(() => router.refresh())}
              disabled={refreshing}
              className="min-h-11 rounded-full border border-emerald-700 px-4 py-2 font-semibold text-emerald-800"
            >
              {refreshing ? "Actualisation…" : "Actualiser les disponibilités"}
            </button>
          </div>
          <section id="produits-resultats" aria-labelledby="products-title">
            <h2 id="products-title" className="mb-4 text-2xl font-bold">
              {search.trim()
                ? `Produits pour « ${search.trim()} »`
                : "À découvrir chez les commerçants"}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {matchingListings.map((listing) => (
                <ListingCard
                  compact
                  key={listing.id}
                  listing={listing}
                  shop={shopMap.get(listing.shop_id)!}
                />
              ))}
            </div>
            {!matchingListings.length && (
              <div className="space-y-4 rounded-2xl border bg-white p-6">
                <h3 className="text-xl font-semibold">
                  Aucun produit pour ces critères
                </h3>
                <p>
                  Essayez un mot plus simple, une autre catégorie ou une autre
                  ville.
                </p>
                <button
                  type="button"
                  onClick={clear}
                  className="rounded-full bg-emerald-800 px-5 py-3 font-semibold text-white"
                >
                  Voir tous les produits
                </button>
              </div>
            )}
          </section>
          <section
            id="boutiques-resultats"
            className="scroll-mt-6"
            aria-labelledby="shops-title"
          >
            <h2 id="shops-title" className="mb-4 text-2xl font-bold">
              {hasFilters
                ? "Les boutiques correspondantes"
                : "Les boutiques actives"}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {matchingShops.map(({ shop, count }) => (
                <Link
                  key={shop.id}
                  href={`/boutiques/${shop.id}`}
                  className="min-w-0 space-y-3 rounded-2xl border bg-white p-5"
                >
                  {shop.profile.image && (
                    <img
                      src={shop.profile.image}
                      alt=""
                      loading="lazy"
                      className="h-36 w-full object-contain"
                    />
                  )}
                  <h3 className="break-words text-xl font-bold">
                    {shop.profile.name}
                  </h3>
                  <p>
                    {shop.profile.category} · {shop.profile.city}
                  </p>
                  <p className="font-semibold text-emerald-800">
                    {count} produit{count > 1 ? "s" : ""} publié
                    {count > 1 ? "s" : ""}
                  </p>
                  <p className="line-clamp-2 text-slate-600">
                    {shop.profile.description}
                  </p>
                  <span className="block font-semibold text-emerald-800">
                    Voir la boutique
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Les boutiques sont classées par nombre de produits publiés. Les
              espaces sponsorisés sont présentés séparément.
            </p>
          </section>
          {spotlight}
          <footer className="space-y-4 border-t py-6 text-sm text-slate-600">
            <p>
              DakarBoutik met en relation clients et boutiques. Le prix, le
              paiement, la livraison et les conditions de vente se confirment
              directement avec le vendeur.
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                ["/commercant?inscription=1", "Inscrire ma boutique"],
                ["/contact", "Contact"],
                ["/suivi", "Suivi des anciennes commandes"],
                ["/mentions-legales", "Mentions légales"],
                ["/conditions-generales", "Conditions générales"],
                ["/politique-de-confidentialite", "Confidentialité"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="underline">
                  {label}
                </Link>
              ))}
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
