"use client";
import { useEffect, useState } from "react";
import { Heart, Share2 } from "lucide-react";
import type { Listing, Shop } from "@/lib/marketplace-model";
import {
  parseFavoriteIds,
  scentOptions,
  selectedContactUrl,
} from "@/lib/partner-options";

export const FAVORITES_KEY = "dakarboutik-partner-favorites";
export function ProductTools({ listing }: { listing: Listing }) {
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const sync = () => {
      try {
        setSaved(
          parseFavoriteIds(localStorage.getItem(FAVORITES_KEY)).includes(
            listing.id,
          ),
        );
      } catch {}
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("partner-favorites", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("partner-favorites", sync);
    };
  }, [listing.id]);
  function toggle() {
    try {
      const ids = parseFavoriteIds(localStorage.getItem(FAVORITES_KEY));
      if (!ids.includes(listing.id) && ids.length >= 200) {
        setMessage(
          "Vous avez atteint 200 favoris. Retirez-en un pour continuer.",
        );
        return;
      }
      const next = ids.includes(listing.id)
        ? ids.filter((id) => id !== listing.id)
        : [...ids, listing.id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("partner-favorites"));
      setMessage(
        next.includes(listing.id)
          ? "Produit enregistré sur cet appareil."
          : "Produit retiré des favoris.",
      );
    } catch {
      setMessage("Le stockage des favoris est indisponible sur cet appareil.");
    }
  }
  async function copy() {
    const url =
      location.origin +
      "/boutiques/" +
      listing.shop_id +
      "/produits/" +
      listing.id;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Lien copié. Vous pouvez le partager.");
    } catch {
      setMessage("Lien à partager : " + url);
    }
  }
  async function share() {
    const url = `${location.origin}/boutiques/${listing.shop_id}/produits/${listing.id}`;
    try {
      if (navigator.share)
        await navigator.share({ title: listing.details.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setMessage("Lien copié. Vous pouvez le partager.");
      }
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError"))
        setMessage(`Lien à partager : ${url}`);
    }
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={saved}
          onClick={toggle}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm"
        >
          <Heart
            size={18}
            fill={saved ? "currentColor" : "none"}
            aria-hidden="true"
          />
          {saved ? "Retirer des favoris" : "Ajouter aux favoris"}
        </button>
        <button
          type="button"
          onClick={() => void share()}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm"
        >
          <Share2 size={18} aria-hidden="true" />
          Partager
        </button>
        <button
          type="button"
          onClick={() => void copy()}
          className="min-h-11 rounded-xl border px-3 py-2 text-sm"
        >
          Copier le lien
        </button>
      </div>
      {message && (
        <p role="status" className="break-words text-sm text-emerald-800">
          {message}
        </p>
      )}
    </div>
  );
}

export function ProductContact({
  shop,
  listing,
}: {
  shop: Shop;
  listing: Listing;
}) {
  const options = scentOptions(listing);
  const [scent, setScent] = useState("");
  const ready = !options.length || options.includes(scent);
  return (
    <div id="choix-senteur" className="scroll-mt-6 space-y-3">
      {options.length > 0 && (
        <label className="block font-semibold">
          Choisissez votre senteur
          <select
            className="mt-2 w-full min-w-0 rounded-xl border bg-white p-3 text-base"
            value={scent}
            onChange={(e) => setScent(e.target.value)}
          >
            <option value="">Sélectionner une senteur</option>
            {options.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="mt-2 block text-sm font-normal text-slate-600">
            30 ml · {listing.details.price.toLocaleString("fr-FR")} FCFA
            l’unité. Votre choix sera ajouté au brouillon WhatsApp.
          </span>
        </label>
      )}
      {ready ? (
        <a
          href={selectedContactUrl(shop, listing, scent)}
          data-engagement-audience="partner"
          data-shop-id={shop.id}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 font-semibold text-white"
        >
          Contacter le vendeur
        </a>
      ) : (
        <button
          disabled
          className="min-h-12 rounded-full bg-slate-200 px-5 py-3 text-slate-600"
        >
          Choisissez une senteur pour contacter MARJI
        </button>
      )}
    </div>
  );
}

export function ShopShare({ shop }: { shop: Shop }) {
  const [message, setMessage] = useState("");
  async function share() {
    const url = location.origin + "/boutiques/" + shop.id;
    try {
      if (navigator.share)
        await navigator.share({ title: shop.profile.name, url });
      else {
        await navigator.clipboard.writeText(url);
        setMessage("Lien de la boutique copié.");
      }
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError"))
        setMessage("Lien à partager : " + url);
    }
  }
  return (
    <div className="mt-4 space-y-2">
      <button
        type="button"
        onClick={() => void share()}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2"
      >
        <Share2 size={18} aria-hidden="true" />
        Partager la boutique
      </button>
      {message && (
        <p role="status" className="break-words text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
