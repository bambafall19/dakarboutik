"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ListingCard } from "./catalog";
import { FAVORITES_KEY } from "./product-actions";
import { parseFavoriteIds } from "@/lib/partner-options";
import type { Listing, Shop } from "@/lib/marketplace-model";
export function PartnerFavorites({
  shops,
  listings,
}: {
  shops: Shop[];
  listings: Listing[];
}) {
  const [ids, setIds] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const sync = () => {
      try {
        setIds(parseFavoriteIds(localStorage.getItem(FAVORITES_KEY)));
      } catch {
        setFailed(true);
        setIds([]);
      }
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("partner-favorites", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("partner-favorites", sync);
    };
  }, []);
  const visible = listings.filter(
    (l) => ids?.includes(l.id) && shops.some((s) => s.id === l.shop_id),
  );
  return (
    <>
      <p className="text-slate-600">
        Vos favoris sont conservés sur cet appareil. Les prix et disponibilités
        sont ceux du catalogue actuel.
      </p>
      {ids === null ? (
        <p role="status">Chargement des favoris…</p>
      ) : (
        <>
          <p role="status">
            {visible.length} produit(s) disponible(s) dans vos favoris.
          </p>
          {failed && <p>Le stockage local n’est pas accessible.</p>}
          {ids.length > visible.length && (
            <p>
              Certains favoris ne sont plus publiés et ne sont pas affichés.
            </p>
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                shop={shops.find((s) => s.id === l.shop_id)!}
                compact
              />
            ))}
          </div>
          {!visible.length && (
            <Link
              className="inline-flex min-h-11 items-center font-semibold text-emerald-800 underline"
              href="/boutiques"
            >
              Découvrir les produits partenaires
            </Link>
          )}
        </>
      )}
    </>
  );
}
