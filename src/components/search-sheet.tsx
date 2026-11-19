"use client";
import { partnerProductUrl } from "@/lib/partner-products";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import {
  MARKETPLACE_CATEGORIES,
  matchesPartnerSearch,
  partnerSearchUrl,
} from "@/lib/marketplace-discovery";
import {
  availabilityLabels,
  type Shop,
  type Listing,
} from "@/lib/marketplace-model";

type SearchSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
export function SearchSheet({ open, onOpenChange }: SearchSheetProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<{ shops: Shop[]; listings: Listing[] }>({
    shops: [],
    listings: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch("/api/marketplace/catalog", { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((value) => {
        if (!Array.isArray(value.shops) || !Array.isArray(value.listings))
          throw Error();
        setData(value);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [open]);
  const shopMap = new Map(data.shops.map((shop) => [shop.id, shop]));
  const results =
    query.trim().length < 2
      ? []
      : data.listings
          .filter((listing) => {
            const shop = shopMap.get(listing.shop_id);
            return shop && matchesPartnerSearch(listing, shop, query);
          })
          .slice(0, 6);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto p-5 sm:max-w-2xl">
        <DialogTitle>Rechercher chez les partenaires</DialogTitle>
        <DialogDescription>
          Un produit, une boutique ou une ville. Les vendeurs vous répondent
          directement.
        </DialogDescription>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(partnerSearchUrl(query));
            onOpenChange(false);
          }}
        >
          <label htmlFor="partner-quick-search" className="sr-only">
            Produit ou boutique
          </label>
          <input
            id="partner-quick-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={150}
            placeholder="Téléphone, parfum, ordinateur…"
            autoFocus
            className="min-w-0 flex-1 rounded-xl border p-3 text-base"
          />
          <button
            aria-label="Rechercher les produits"
            className="rounded-xl bg-primary px-4 text-primary-foreground"
          >
            <Search aria-hidden="true" size={20} />
          </button>
        </form>
        {query.trim().length < 2 ? (
          <div className="flex flex-wrap gap-2">
            {MARKETPLACE_CATEGORIES.map((name) => (
              <Link
                key={name}
                href={partnerSearchUrl("", name)}
                onClick={() => onOpenChange(false)}
                className="rounded-full border px-4 py-3 text-sm font-semibold"
              >
                {name}
              </Link>
            ))}
          </div>
        ) : (
          <div aria-live="polite" className="space-y-3">
            {loading ? (
              <p>Chargement des produits…</p>
            ) : error ? (
              <p>
                Les suggestions sont indisponibles. Lancez la recherche pour
                ouvrir le catalogue.
              </p>
            ) : results.length ? (
              results.map((listing) => {
                const shop = shopMap.get(listing.shop_id)!;
                return (
                  <Link
                    key={listing.id}
                    href={partnerProductUrl(listing)}
                    onClick={() => onOpenChange(false)}
                    className="flex min-w-0 items-center gap-3 rounded-xl border p-3"
                  >
                    {listing.details.image && (
                      <img
                        src={listing.details.image}
                        alt=""
                        width={60}
                        height={60}
                        className="h-16 w-16 shrink-0 object-contain"
                      />
                    )}
                    <span className="min-w-0">
                      <strong className="block break-words">
                        {listing.details.title}
                      </strong>
                      <span className="block text-sm">
                        {shop.profile.name} · {shop.profile.city}
                      </span>
                      <span className="block text-sm font-semibold text-primary">
                        {listing.details.price.toLocaleString("fr-FR")} FCFA ·{" "}
                        {availabilityLabels[listing.details.availability]}
                      </span>
                    </span>
                  </Link>
                );
              })
            ) : (
              <p>
                Aucun produit pour ces mots. Essayez une recherche plus simple.
              </p>
            )}
          </div>
        )}
        <Link
          href={partnerSearchUrl(query)}
          onClick={() => onOpenChange(false)}
          className="rounded-xl bg-primary px-4 py-3 text-center font-semibold text-primary-foreground"
        >
          Voir tous les résultats
        </Link>
      </DialogContent>
    </Dialog>
  );
}
