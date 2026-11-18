"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import {
  availabilityLabels,
  contactUrl,
  type Shop,
  type Listing,
} from "@/lib/marketplace-model";

export function HomePartnerSelection({
  items,
}: {
  items: { listing: Listing; shop: Shop }[];
}) {
  const [index, setIndex] = useState(0);
  if (!items.length) return null;
  const position = index % items.length;
  const { listing, shop } = items[position];
  const p = listing.details;
  const href = `/boutiques/${shop.id}#produit-${listing.id}`;
  return (
    <section
      aria-label="La sélection des boutiques partenaires"
      className="min-w-0 overflow-hidden rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          La sélection des partenaires
        </p>
        <span className="shrink-0 text-sm text-slate-500">
          {position + 1} sur {items.length}
        </span>
      </div>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="mt-3"
        key={listing.id}
      >
        <Link
          href={href}
          className="block rounded-2xl bg-slate-50 p-3"
          aria-label={`Découvrir ${p.title} chez ${shop.profile.name}`}
        >
          {p.image ? (
            <img
              src={p.image}
              alt={p.title}
              width={400}
              height={220}
              className="h-44 w-full object-contain sm:h-48"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-44 items-center justify-center">
              <ImageIcon
                aria-label="Photo à venir"
                className="h-12 w-12 text-emerald-200"
              />
            </div>
          )}
        </Link>
        <p className="mt-4 text-xs font-semibold text-emerald-700">
          {availabilityLabels[p.availability]} · {shop.profile.city}
        </p>
        <h2 className="mt-2 line-clamp-2 min-h-14 text-xl font-bold leading-7">
          <Link href={href}>{p.title}</Link>
        </h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <Link
            className="min-w-0 break-words text-sm font-medium text-slate-600 underline"
            href={`/boutiques/${shop.id}`}
          >
            {shop.profile.name}
          </Link>
          <strong className="text-xl text-emerald-800">
            {p.price.toLocaleString("fr-FR")} FCFA
          </strong>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={href}
            className="inline-flex min-h-11 items-center rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white"
          >
            Découvrir le produit
          </Link>
          <a
            href={contactUrl(shop, listing)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-xl border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-900"
          >
            Contacter le vendeur
          </a>
        </div>
      </div>
      {items.length > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-emerald-100 pt-3">
          <button
            type="button"
            onClick={() =>
              setIndex((position + items.length - 1) % items.length)
            }
            aria-label="Produit partenaire précédent"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-emerald-200 text-emerald-800"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <p className="text-center text-xs text-slate-500">
            Découvrez aussi les autres boutiques
          </p>
          <button
            type="button"
            onClick={() => setIndex((position + 1) % items.length)}
            aria-label="Produit partenaire suivant"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-emerald-200 text-emerald-800"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
