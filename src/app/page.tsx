import Link from "next/link";
import {
  Search,
  Store,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ArrowUpRight,
  Tags,
  ShoppingBasket,
  Gamepad2,
} from "lucide-react";
import { AdvertisingSlot } from "@/components/advertising-slot";
import { HomeProductCard as ListingCard } from "@/components/marketplace/home-product-card";
import { MarketplaceSpotlight } from "@/components/marketplace/spotlight";
import { publicMarketplace } from "@/lib/marketplace-server";
import {
  MARKETPLACE_CATEGORIES,
  partnerCategoryMatches,
  partnerSearchUrl,
  rankActiveShops,
} from "@/lib/marketplace-discovery";
import styles from "./home.module.css";
import { ReferenceArtwork } from "@/components/marketplace/reference-artwork";
import { MarjiHelp } from "@/components/marketplace/marji-help";
import { MARJI_SHOP_ID } from "@/lib/marji-assistant";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const { shops, listings } = await publicMarketplace();
  const shopMap = new Map(shops.map((shop) => [shop.id, shop]));
  const activeShops = rankActiveShops(shops, listings).slice(0, 6);
  const now = Date.now();
  const affordable = listings
    .filter(
      (l) =>
        l.details.availability !== "sold_out" &&
        l.details.price > 0 &&
        l.details.price <= 5000,
    )
    .slice(0, 4);
  const affordableIds = new Set(affordable.map((listing) => listing.id));
  const latest = listings
    .filter(
      (listing) =>
        listing.details.availability !== "sold_out" &&
        !affordableIds.has(listing.id),
    )
    .slice(0, 8);
  const categoryArt: Record<string, string> = {
    "Mode & Beauté": "40 680 112 110",
    Téléphones: "204 680 112 110",
    Informatique: "370 680 112 110",
    Parfumerie: "540 680 112 110",
    Maison: "710 680 112 110",
    "Auto et moto": "870 680 112 110",
    Solaire: "16 945 328 190",
  };
  const rays = [
    {
      name: "Solaire",
      caption: "De l’énergie pour vos projets",
      tone: styles.sunny,
      viewBox: "16 945 328 190",
    },
    {
      name: "Informatique",
      caption: "Équipez vos bonnes idées",
      tone: styles.tech,
      viewBox: "360 945 304 190",
    },
    {
      name: "Parfumerie",
      caption: "Trouvez votre nouvelle senteur",
      tone: styles.scent,
      viewBox: "678 945 330 190",
    },
  ];
  const priorityCategories = rays.map(({ name }) => name);
  const homeCategories = [
    ...priorityCategories,
    ...MARKETPLACE_CATEGORIES.filter((name) => !priorityCategories.includes(name)),
  ];
  return (
    <div className={styles.home}>
      <form
        action="/boutiques#recherche"
        role="search"
        aria-label="Rechercher un produit"
        className={styles.brandSearch}
      >
        <Search size={22} aria-hidden="true" />
        <input
          name="q"
          type="search"
          maxLength={150}
          placeholder="Rechercher un produit…"
          aria-label="Produit ou boutique"
        />
        <button type="submit" aria-label="Lancer la recherche">
          <Search size={22} />
        </button>
      </form>
      {shops.some(shop => shop.id === MARJI_SHOP_ID && shop.status === "approved") && (
        <aside aria-label="Conseils parfumerie MARJI" className="mx-auto flex w-full max-w-6xl flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-emerald-950">🌸 Un parfum en tête ? MARJI vous guide</p>
            <p className="mt-1 text-sm text-slate-700">Produits, prix, senteurs et contact vendeur, sans chercher dans les boutiques.</p>
          </div>
          <MarjiHelp inline />
        </aside>
      )}
      <section className={styles.brandHero} aria-labelledby="welcome-title">
        <div className={styles.heroSparkles} aria-hidden="true">
          <span>✦</span>
          <span>✧</span>
          <span>✦</span>
        </div>
        <div className={styles.brandHeroCopy}>
          <span className={styles.brandEyebrow}>
            ✨ DakarBoutik · Vos commerçants, près de vous
          </span>
          <h1 id="welcome-title">
            Vos envies.
            <br />
            <span>Nos boutiques.</span>
          </h1>
          <p>
            Solaire, informatique, parfumerie… Découvrez les offres et contactez
            votre vendeur.
          </p>
          <Link href="/boutiques" className={styles.goldButton}>
            Explorer les produits <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <span className={styles.heroActivity}>
            {shops.length} boutiques · {listings.length} produits à découvrir
          </span>
        </div>
        <ReferenceArtwork
          rect="620 300 404 350"
          id="brand-hero-art"
          fill
          className={styles.brandHeroArt}
        />
      </section>
      <nav className={styles.rayonBar} aria-label="Tous les rayons">
        <span className={styles.rayonLabel}>
          Explorez les rayons <span>Glissez pour découvrir →</span>
        </span>
        <div className={styles.marketCategories}>
          {homeCategories.map((name) => (
            <Link key={name} href={partnerSearchUrl("", name)}>
              <span className={styles.roundCategory}>
                {categoryArt[name] ? (
                  <ReferenceArtwork
                    rect={categoryArt[name]}
                    id={`round-${name.replace(/[^a-zA-Z]/g, "")}`}
                  />
                ) : name === "Alimentation" ? (
                  <ShoppingBasket size={32} aria-hidden="true" />
                ) : (
                  <Gamepad2 size={32} aria-hidden="true" />
                )}
              </span>
              <span>{name}</span>
            </Link>
          ))}
        </div>
      </nav>
      <section
        className={`${styles.section} ${styles.topCategories}`}
        aria-labelledby="categories-title"
      >
        <div className={styles.heading}>
          <h2 id="categories-title">Nos catégories</h2>
          <Link href="/boutiques#recherche">Voir tout →</Link>
        </div>
        <div className={styles.discoveryGrid}>
          {rays.map(({ name, caption, tone, viewBox }) => {
            const count = listings.filter((l) =>
              partnerCategoryMatches(l, name),
            ).length;
            return (
              <Link
                key={name}
                className={`${styles.discoveryCard} ${tone}`}
                href={partnerSearchUrl("", name)}
              >
                <span className={styles.discoveryPhoto}>
                  <ReferenceArtwork
                    rect={viewBox}
                    id={`feature-${name}`}
                    className={styles.rayonArtwork}
                  />
                </span>
                <strong>
                  {name}
                  <ArrowUpRight size={20} aria-hidden="true" />
                </strong>
                <span>{caption}</span>
                <small>
                  {count} produit{count > 1 ? "s" : ""} à découvrir
                </small>
              </Link>
            );
          })}
        </div>
      </section>

      <div className={styles.section}>
        <AdvertisingSlot placement="home" />
      </div>
      <section className={styles.section} aria-labelledby="latest-title">
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              Les nouveautés des commerçants
            </span>
            <h2 id="latest-title">Produits à découvrir</h2>
          </div>
          <Link href="/boutiques">Tous les produits</Link>
        </div>
        {latest.length ? (
          <div className={styles.partnerProducts}>
            {latest.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                shop={shopMap.get(listing.shop_id)!}
              />
            ))}
          </div>
        ) : (
          <div className={styles.invitation}>
            <Store size={36} />
            <h3>Les premiers produits arrivent bientôt</h3>
            <p>
              Les annonces seront visibles après validation. Découvrez les
              boutiques ou présentez la vôtre.
            </p>
            <Link className={styles.primary} href="/commercant?inscription=1">
              Inscrire ma boutique
            </Link>
          </div>
        )}
      </section>
      {affordable.length > 0 && (
        <section
          className={`${styles.section} ${styles.affordable}`}
          aria-labelledby="affordable-title"
        >
          <div className={styles.heading}>
            <div>
              <span className={styles.eyebrow}>
                <Tags size={16} aria-hidden="true" /> Des envies, des petits
                prix
              </span>
              <h2 id="affordable-title">À découvrir à 5 000 FCFA ou moins</h2>
            </div>
            <Link href="/boutiques?maxPrice=5000#recherche">
              Tous les petits prix →
            </Link>
          </div>
          <div className={styles.partnerProducts}>
            {affordable.map((listing) => (
              <ListingCard
                idPrefix="petit-prix"
                key={listing.id}
                listing={listing}
                shop={shopMap.get(listing.shop_id)!}
              />
            ))}
          </div>
        </section>
      )}
      <section className={styles.section} aria-labelledby="partners-title">
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Des commerces à rencontrer</span>
            <h2 id="partners-title">Les boutiques actives</h2>
          </div>
          <Link href="/boutiques#boutiques-resultats">
            Toutes les boutiques
          </Link>
        </div>
        <p className={styles.note}>
          Découvrez les boutiques qui publient le plus de produits. Cette
          sélection présente leur activité sur DakarBoutik, pas une note de
          qualité.
        </p>
        <div className={styles.shops}>
          {activeShops.map(({ shop, count }) => (
            <article className={styles.shop} key={shop.id}>
              <div className={styles.shopIdentity}>
                {shop.profile.image ? (
                  <img
                    src={shop.profile.image}
                    alt=""
                    width={56}
                    height={56}
                    loading="lazy"
                  />
                ) : (
                  <Store size={40} aria-hidden="true" />
                )}
                <div>
                  <h3>{shop.profile.name}</h3>
                  <p>
                    {shop.profile.district ? `${shop.profile.district}, ` : ""}
                    {shop.profile.city}
                  </p>
                </div>
              </div>
              <strong className={styles.productCount}>
                {count} produit{count > 1 ? "s" : ""} publié
                {count > 1 ? "s" : ""}
              </strong>
              <p className="line-clamp-2">{shop.profile.description}</p>
              <Link className={styles.shopLink} href={`/boutiques/${shop.id}`}>
                Découvrir la boutique
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section
        className={styles.reassurance}
        aria-label="Comment acheter auprès des partenaires"
      >
        <div>
          <Search aria-hidden="true" />
          <div>
            <strong>Trouvez votre produit</strong>
            <span>Comparez les annonces et leurs disponibilités.</span>
          </div>
        </div>
        <div>
          <MessageCircle aria-hidden="true" />
          <div>
            <strong>Parlez au commerçant</strong>
            <span>
              Confirmez le prix, la livraison et le paiement avec la boutique.
            </span>
          </div>
        </div>
        <div>
          <MapPin aria-hidden="true" />
          <div>
            <strong>Achetez près de chez vous</strong>
            <span>
              Filtrez par ville et retrouvez les coordonnées du vendeur.
            </span>
          </div>
        </div>
      </section>
      <div className={styles.section}>
        <MarketplaceSpotlight shops={shops} now={now} />
      </div>
      <section
        className={`${styles.section} ${styles.merchant}`}
        aria-labelledby="merchant-title"
      >
        <div>
          <span className={styles.eyebrow}>Vous êtes commerçant ?</span>
          <h2 id="merchant-title">Donnez une vitrine à votre boutique</h2>
          <p>
            Présentez votre commerce, ajoutez vos produits et leurs
            disponibilités. Les fiches sont publiées après validation.
          </p>
        </div>
        <Link className={styles.primary} href="/commercant?inscription=1">
          <ShieldCheck size={18} aria-hidden="true" />
          Inscrire ma boutique
        </Link>
      </section>
    </div>
  );
}
