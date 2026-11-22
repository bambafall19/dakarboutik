"use client";

import { useState } from "react";
import styles from "./admin-inventory.module.css";

export function AdminProductThumbnail({ image, title }: { image: string; title: string }) {
  const [failed, setFailed] = useState(false);
  if (!image || failed) {
    return <span className={styles.thumbnailPlaceholder} aria-label={`Photo indisponible : ${title}`}>Sans photo</span>;
  }
  return (
    <a className={styles.thumbnail} href={image} target="_blank" rel="noopener noreferrer" aria-label={`Agrandir la photo : ${title}`}>
      <img src={image} alt={title} width={64} height={64} loading="lazy" decoding="async" onError={() => setFailed(true)} />
    </a>
  );
}
