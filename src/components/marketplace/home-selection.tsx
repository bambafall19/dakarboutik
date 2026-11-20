"use client";
import { scentOptions } from "@/lib/partner-options";
import { partnerProductUrl } from "@/lib/partner-products";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Pause,
  Play,
} from "lucide-react";
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
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    change();
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver((entries) =>
      setOnScreen(entries[0]?.isIntersecting ?? false),
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [items.length]);
  useEffect(() => {
    if (
      items.length < 2 ||
      paused ||
      hovered ||
      focused ||
      reduced ||
      !onScreen
    )
      return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length, paused, hovered, focused, reduced, onScreen]);
  if (!items.length) return null;
  const position = index % items.length;
  const { listing, shop } = items[position];
  const p = listing.details;
  const href = partnerProductUrl(listing);
  return (
    <section
      ref={root}
      aria-roledescription="carrousel"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={(e) =>
        setFocused((e.target as HTMLElement).matches(":focus-visible"))
      }
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      aria-label="La sélection des boutiques partenaires"
      className="min-w-0 overflow-hidden rounded-3xl border border-emerald-100 bg-white p-3 shadow-sm sm:p-4"
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
        aria-live={paused || focused ? "polite" : "off"}
        aria-atomic="true"
        className="mt-2 grid items-center gap-3 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] md:gap-5"
        key={listing.id}
      >
        <Link
          href={href}
          className="block rounded-xl bg-slate-50 p-2"
          aria-label={`Découvrir ${p.title} chez ${shop.profile.name}`}
        >
          {p.image ? (
            <img
              src={p.image}
              alt={p.title}
              width={400}
              height={220}
              className="h-32 w-full object-contain sm:h-40 md:h-44"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-32 items-center justify-center">
              <ImageIcon
                aria-label="Photo à venir"
                className="h-12 w-12 text-emerald-200"
              />
            </div>
          )}
        </Link>
        <div className="min-w-0">
          <p className="mt-1 text-xs font-semibold text-emerald-700">
            {availabilityLabels[p.availability]} · {shop.profile.city}
          </p>
          <h2 className="mt-1 line-clamp-2 text-lg font-bold leading-6">
            <Link href={href}>{p.title}</Link>
          </h2>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
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
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={href}
              className="inline-flex min-h-11 items-center rounded-xl bg-emerald-800 px-3 py-2 text-sm font-semibold text-white"
            >
              Découvrir le produit
            </Link>
            <a
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
              className="inline-flex min-h-11 items-center rounded-xl border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-900"
            >
              {scentOptions(listing).length
                ? "Choisir ma senteur"
                : "Contacter le vendeur"}
            </a>
          </div>
        </div>
      </div>
      {items.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 border-t border-emerald-100 pt-2">
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
          {!reduced && (
            <button
              type="button"
              aria-label={
                paused
                  ? "Reprendre le défilement de la sélection"
                  : "Mettre en pause la sélection"
              }
              aria-pressed={paused}
              onClick={() => setPaused((p) => !p)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-200 px-4 text-sm font-semibold text-emerald-800"
            >
              {paused ? (
                <Play size={16} aria-hidden="true" />
              ) : (
                <Pause size={16} aria-hidden="true" />
              )}
              {paused ? "Reprendre" : "Mettre en pause"}
            </button>
          )}
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
