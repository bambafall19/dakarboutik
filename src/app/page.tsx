import Link from "next/link";
import {
  Search,
  Store,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ArrowUpRight,
  Tags,
} from "lucide-react";
import { AdvertisingSlot } from "@/components/advertising-slot";
import { ListingCard } from "@/components/marketplace/catalog";
import { MarketplaceSpotlight } from "@/components/marketplace/spotlight";
import { publicMarketplace } from "@/lib/marketplace-server";
import {
  MARKETPLACE_CATEGORIES,
  partnerCategoryMatches,
  partnerSearchUrl,
  rankActiveShops,
} from "@/lib/marketplace-discovery";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const { shops, listings } = await publicMarketplace();
  const shopMap = new Map(shops.map((shop) => [shop.id, shop]));
  const activeShops = rankActiveShops(shops, listings).slice(0, 6);
  const latest = listings
    .filter((listing) => listing.details.availability !== "sold_out")
    .slice(0, 8);
  const now = Date.now();
  const affordable = listings
    .filter(
      (l) =>
        l.details.availability !== "sold_out" &&
        l.details.price > 0 &&
        l.details.price <= 5000,
    )
    .slice(0, 4);
  const rays = [
    {
      name: "Solaire",
      caption: "De l’énergie pour vos projets",
      tone: styles.sunny,
    },
    {
      name: "Informatique",
      caption: "Équipez vos bonnes idées",
      tone: styles.tech,
    },
    {
      name: "Parfumerie",
      caption: "Trouvez votre nouvelle senteur",
      tone: styles.scent,
    },
  ];
  return (
    <div className={styles.home}>
      <h1 className="sr-only">DakarBoutik — Vos envies. Nos boutiques.</h1>
      <nav className={styles.rayonBar} aria-label="Tous les rayons">
        <span className={styles.rayonLabel}>Tous les rayons</span>
        <div className={styles.marketCategories}>
          {MARKETPLACE_CATEGORIES.map((name) => (
            <Link key={name} href={partnerSearchUrl("", name)}>
              {name}
            </Link>
          ))}
        </div>
      </nav>
      <section
        className={`${styles.section} ${styles.topCategories}`}
        aria-labelledby="categories-title"
      >
        <div className={styles.heading}>
          <h2 id="categories-title">Qu’est-ce qui vous ferait plaisir ?</h2>
        </div>
        <div className={styles.discoveryGrid}>
          {rays.map(({ name, caption, tone }) => {
            const count = listings.filter((l) =>
              partnerCategoryMatches(l, name),
            ).length;
            const image =
              listings.find(
                (l) =>
                  partnerCategoryMatches(l, name) &&
                  l.details.image &&
                  (name !== "Solaire" || /kit/i.test(l.details.title)) &&
                  (name !== "Parfumerie" || /loris/i.test(l.details.title)),
              )?.details.image ||
              listings.find(
                (l) => partnerCategoryMatches(l, name) && l.details.image,
              )?.details.image;
            return (
              <Link
                key={name}
                className={`${styles.discoveryCard} ${tone}`}
                href={partnerSearchUrl("", name)}
              >
                <span className={styles.discoveryPhoto}>
                  {image && <img src={image} alt="" width={360} height={180} />}
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
            src="/images/dakarboutik-partenaires-parfumerie.png"
            alt="DakarBoutik — Vos produits. Vos boutiques. À portée de clic. Découvrez les produits et contactez directement les boutiques partenaires."
            width={1024}
            height={1024}
            loading="lazy"
          />
        </Link>
        <div>
          <span className={styles.posterBadge}>
            <span aria-hidden="true">✦</span> Faites le plein de trouvailles
          </span>
          <h2 id="discover-poster-title">Vos boutiques, à portée de clic</h2>
          <p>
            Une envie ? Trouvez votre produit et échangez directement avec votre
            boutique.
          </p>
          <div className={styles.posterTags} aria-label="Explorer un rayon">
            <Link href={partnerSearchUrl("", "Solaire")}>☀ Solaire</Link>
            <Link href={partnerSearchUrl("", "Informatique")}>
              Informatique
            </Link>
            <Link href={partnerSearchUrl("", "Parfumerie")}>Parfumerie ✧</Link>
          </div>
          <Link className={styles.primary} href="/boutiques">
            Explorer les produits partenaires
          </Link>
        </div>
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
                compact
              />
            ))}
          </div>
        </section>
      )}
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
