import type { Campaign } from "@/lib/advertising";
import styles from "./advertising-slot.module.css";
/** Shared visual only: no navigation and no engagement tracking in an admin preview. */
export function AdCreative({
  campaign: c,
}: {
  campaign: Pick<Campaign, "title" | "imageUrl" | "placement"> & {
    targetUrl?: string;
  };
}) {
  return (
    <div className={styles.surface}>
      <div className={c.placement === "home" ? styles.banner : styles.compact}>
        <img
          src={c.imageUrl}
          alt=""
          width={160}
          height={120}
          loading="lazy"
          className={
            c.placement === "home" ? styles.photo : styles.compactPhoto
          }
        />
        <div
          className={c.placement === "home" ? styles.copy : styles.compactCopy}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Sponsorisé
          </span>
          <h3
            className={
              c.placement === "home" ? styles.title : styles.compactTitle
            }
          >
            {c.title}
          </h3>
          <span
            className={c.placement === "home" ? styles.cta : styles.compactCta}
          >
            {c.placement === "home"
              ? c.targetUrl?.includes("/produits/")
                ? "Découvrir le produit →"
                : "Découvrir la boutique →"
              : "Découvrir →"}
          </span>
        </div>
      </div>
    </div>
  );
}
