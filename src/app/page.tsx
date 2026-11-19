import Link from "next/link";
import {
  Search,
  Store,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { AdvertisingSlot } from "@/components/advertising-slot";
import { ListingCard } from "@/components/marketplace/catalog";
import { MarketplaceSpotlight } from "@/components/marketplace/spotlight";
import { publicMarketplace } from "@/lib/marketplace-server";
import {
  MARKETPLACE_CATEGORIES,
  partnerSearchUrl,
  rankActiveShops,
} from "@/lib/marketplace-discovery";
import styles from "./home.module.css";
import { HomePartnerSelection } from "@/components/marketplace/home-selection";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const { shops, listings } = await publicMarketplace();
  const shopMap = new Map(shops.map((shop) => [shop.id, shop]));
  const activeShops = rankActiveShops(shops, listings).slice(0, 6);
  const latest = listings
    .filter((listing) => listing.details.availability !== "sold_out")
    .slice(0, 8);
  const now = Date.now();
  return (
    <div className={styles.home}>
      <section
        className={`${styles.hero} ${latest.length ? styles.heroWithProducts : ""}`}
        aria-labelledby="home-title"
      >
        <div>
          <span className={styles.eyebrow}>
            ✨ Les meilleures trouvailles du Sénégal, à portée de clic.
          </span>
          <h1 id="home-title">
            Vos envies.
            <br />
            <span>Nos boutiques.</span>
          </h1>
          <p>
            Découvrez les produits des commerçants près de chez vous. Comparez
            les offres et contactez directement votre boutique.
          </p>
          <form
            action="/boutiques#recherche"
            className={styles.search}
            role="search"
          >
            <label htmlFor="home-search" className="sr-only">
              Quel produit cherchez-vous ?
            </label>
            <Search size={22} aria-hidden="true" />
            <input
              id="home-search"
              name="q"
              placeholder="Un téléphone, du riz, des chaussures…"
              type="search"
              maxLength={150}
            />
            <button
              type="submit"
              aria-label="Rechercher les produits des boutiques"
            >
              <Search size={22} />
            </button>
          </form>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/boutiques">
              Explorer les produits
            </Link>
            <Link
              className={styles.secondary}
              href="/boutiques#boutiques-resultats"
            >
              Trouver une boutique
            </Link>
          </div>
          <p className={styles.note}>
            {shops.length} boutiques partenaires · {listings.length} produits
            publiés
          </p>
        </div>
        <HomePartnerSelection
          items={latest.flatMap((listing) => {
            const shop = shopMap.get(listing.shop_id);
            return shop ? [{ listing, shop }] : [];
          })}
        />
      </section>
      <div className={styles.section}>
        <AdvertisingSlot placement="home" />
      </div>
      <section
        className={`${styles.section} ${styles.poster}`}
        aria-labelledby="discover-poster-title"
      >
        <Link
          href="/boutiques"
          className={styles.posterImageLink}
          aria-label="Découvrir les produits des boutiques partenaires"
        >
          <img
            src="/images/dakarboutik-partenaires-affiche.png"
            alt="DakarBoutik — Vos produits. Vos boutiques. À portée de clic. Découvrez les produits et contactez directement les boutiques partenaires."
            width={1024}
            height={1024}
            loading="lazy"
          />
        </Link>
        <div>
          <h2 id="discover-poster-title">Vos boutiques, à portée de clic</h2>
          <p>
            Découvrez les produits des commerçants partenaires et échangez
            directement avec la boutique qui vous intéresse.
          </p>
          <Link className={styles.primary} href="/boutiques">
            Explorer les produits partenaires
          </Link>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="categories-title">
        <div className={styles.heading}>
          <h2 id="categories-title">Qu’est-ce qui vous ferait plaisir ?</h2>
        </div>
        <div className={styles.marketCategories}>
          {MARKETPLACE_CATEGORIES.map((name) => (
            <Link key={name} href={partnerSearchUrl("", name)}>
              {name}
            </Link>
          ))}
        </div>
      </section>
      <section className={styles.section} aria-labelledby="latest-title">
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              Les nouveautés des commerçants
            </span>
            <h2 id="latest-title">À découvrir dans les boutiques</h2>
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
                compact
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
