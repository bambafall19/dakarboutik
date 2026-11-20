import Link from "next/link";
import {
  type Listing,
  type Shop,
  availabilityLabels,
  contactUrl,
} from "@/lib/marketplace-model";
import { partnerProductUrl } from "@/lib/partner-products";
import { scentOptions } from "@/lib/partner-options";
import styles from "./home-product-card.module.css";

export function HomeProductCard({
  listing,
  shop,
  idPrefix = "produit",
}: {
  listing: Listing;
  shop: Shop;
  idPrefix?: string;
}) {
  const p = listing.details;
  const href = partnerProductUrl(listing);
  const scent = scentOptions(listing).length > 0;
  return (
    <article id={`${idPrefix}-${listing.id}`} className={styles.card}>
      <Link
        href={href}
        className={styles.photo}
        aria-label={`Voir la fiche de ${p.title}`}
      >
        {p.image ? (
          <img
            src={p.image}
            alt={p.title}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span>Photo à venir</span>
        )}
      </Link>
      <div className={styles.body}>
        <span className={styles.availability}>
          {availabilityLabels[p.availability]}
        </span>
        <h3>
          <Link href={href}>{p.title}</Link>
        </h3>
        <strong className={styles.price}>
          {p.price.toLocaleString("fr-FR")} FCFA
        </strong>
        <Link className={styles.shop} href={`/boutiques/${shop.id}`}>
          {shop.profile.name} · {shop.profile.city}
        </Link>
        <Link className={styles.details} href={href}>
          Voir le produit →
        </Link>
        {p.availability !== "sold_out" && (
          <a
            className={styles.contact}
            href={scent ? `${href}#choix-senteur` : contactUrl(shop, listing)}
            target="_blank"
            rel="noopener noreferrer"
            data-engagement-audience={scent ? undefined : "partner"}
            data-shop-id={scent ? undefined : shop.id}
          >
            {scent ? "Choisir ma senteur" : "Contacter le vendeur"}
          </a>
        )}
      </div>
    </article>
  );
}
