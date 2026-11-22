"use client";
import { useEffect, useState } from "react";
import { adminImageUrl } from "@/lib/admin-image-url";
import { ProductImageInput } from "@/components/admin/product-image-input";
import {
  statusLabels,
  type Shop,
  type ShopProfile,
} from "@/lib/marketplace-model";
import { campaignLive, type Campaign } from "@/lib/advertising";
import { MerchantAccessAdmin } from './merchant-access-admin';
const input = "mt-1 w-full min-w-0 rounded-xl border bg-white p-3 text-base";
export function AdminShopProfile({
  shop,
  busy,
  onBusy,
  onSave,
}: {
  shop: Shop;
  busy: boolean;
  onBusy: (busy: boolean) => void;
  onSave: (profile: ShopProfile) => Promise<boolean>;
}) {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [campaignError, setCampaignError] = useState(false);
  const [billing, setBilling] = useState<{
    enabled: boolean;
    memberships: {
      shop_id: string;
      plan_id: string;
      state: string;
      product_limit: number;
    }[];
  } | null>(null);
  const [billingError, setBillingError] = useState(false);
  useEffect(() => {
    let live = true;
    setCampaigns(null);
    setCampaignError(false);
    setBilling(null);
    setBillingError(false);
    void fetch("/api/advertising?admin=1")
      .then(async (r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((data) => {
        if (live) setCampaigns(data);
      })
      .catch(() => {
        if (live) setCampaignError(true);
      });
    void fetch("/api/marketplace/billing?admin=1")
      .then(async (r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((data) => {
        if (live) setBilling(data);
      })
      .catch(() => {
        if (live) setBillingError(true);
      });
    return () => {
      live = false;
    };
  }, [shop.id]);
  const linkedCampaigns = (campaigns || []).filter((c) => {
    try {
      const url = new URL(c.targetUrl, window.location.origin);
      return (
        url.origin === window.location.origin &&
        (url.pathname === "/boutiques/" + shop.id ||
          url.pathname.startsWith("/boutiques/" + shop.id + "/"))
      );
    } catch {
      return false;
    }
  });
  const membership = billing?.memberships.find((m) => m.shop_id === shop.id);
  const [editing, setEditing] = useState(false);
  const [image, setImage] = useState(shop.profile.image);
  return (
    <section
      aria-label="Fiche de gestion de la boutique"
      className="space-y-3 rounded-xl border bg-white p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{shop.profile.name}</h2>
          <p className="text-sm text-slate-600">
            {statusLabels[shop.status]} · {shop.profile.category} ·{" "}
            {shop.profile.city}
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          className="min-h-11 rounded-xl border px-4 py-2"
          onClick={() => {
            setImage(shop.profile.image);
            setEditing(!editing);
          }}
        >
          {editing ? "Fermer les coordonnées" : "Modifier les coordonnées"}
        </button>
      </div>
      <p className="text-sm">
        {shop.profile.address} · WhatsApp {shop.profile.whatsapp}
      </p>
      <p className="text-sm text-slate-600">
        Horaires : {shop.profile.hours || "À compléter"}
      </p>
      <MerchantAccessAdmin key={`${shop.id}-${shop.profile.whatsapp}`} shop={shop} />
      <div className="flex flex-wrap gap-3 text-sm font-semibold text-emerald-800">
        <a href="#produits" className="underline">
          Produits
        </a>
        <a href="#boutiques" className="underline">
          Publication
        </a>
        <a href="#forfaits" className="underline">
          Forfaits et demandes
        </a>
        <a href="/admin/publicites" className="underline">
          Gérer les publicités
        </a>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3 text-sm">
          <h3 className="font-semibold">Publicités liées à cette boutique</h3>
          {campaignError ? (
            <p role="alert">
              Chargement impossible. Retrouvez les campagnes dans Publicité.
            </p>
          ) : campaigns === null ? (
            <p>Chargement…</p>
          ) : linkedCampaigns.length ? (
            <ul className="mt-2 space-y-1">
              {linkedCampaigns.map((c) => (
                <li key={c.id}>
                  {c.title} ·{" "}
                  {campaignLive(c, new Date().toISOString().slice(0, 10))
                    ? "En diffusion"
                    : c.active
                      ? "Hors période"
                      : "Inactive"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1">
              Aucune campagne ne cible une fiche de cette boutique.
            </p>
          )}
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-sm">
          <h3 className="font-semibold">Forfait</h3>
          <p className="mt-1">
            {billingError
              ? "Forfait indisponible. Consultez les demandes ci-dessous."
              : !billing
                ? "Chargement…"
                : !billing.enabled
                  ? "Paiements désactivés : aucune limite payante appliquée."
                  : membership
                    ? membership.plan_id +
                      " · " +
                      membership.state +
                      " · " +
                      membership.product_limit +
                      " produits"
                    : "Aucun forfait enregistré pour cette boutique."}
          </p>
        </div>
      </div>
      {editing && (
        <form
          className="space-y-4 border-t pt-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            const values = Object.fromEntries(
              new FormData(event.currentTarget),
            );
            const profile = {
              ...values,
              image: adminImageUrl(image, window.location.origin),
            } as ShopProfile;
            if (await onSave(profile)) setEditing(false);
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["name", "Nom de la boutique", 100, true],
                ["category", "Catégorie", 80, true],
                ["city", "Ville", 80, true],
                ["district", "Quartier", 100, false],
                ["address", "Adresse", 250, true],
                [
                  "whatsapp",
                  "WhatsApp international sans + ni espaces",
                  15,
                  true,
                ],
                ["hours", "Horaires", 250, false],
              ] as const
            ).map(([name, label, max, required]) => (
              <label key={name} className="text-sm">
                {label}
                <input
                  name={name}
                  className={input}
                  defaultValue={shop.profile[name]}
                  maxLength={max}
                  required={required}
                  pattern={name === "whatsapp" ? "[1-9][0-9]{7,14}" : undefined}
                />
              </label>
            ))}
          </div>
          <label className="block text-sm">
            Présentation
            <textarea
              name="description"
              className={input}
              rows={3}
              maxLength={1500}
              defaultValue={shop.profile.description}
            />
          </label>
          <ProductImageInput
            value={image}
            onChange={setImage}
            onBusyChange={onBusy}
          />
          <div className="flex gap-3">
            <button
              disabled={busy}
              className="min-h-11 rounded-xl bg-emerald-800 px-4 py-2 text-white"
            >
              Enregistrer les coordonnées
            </button>
            <button
              disabled={busy}
              type="button"
              className="underline"
              onClick={() => setEditing(false)}
            >
              Annuler
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Le statut de publication et les produits sont conservés.
          </p>
        </form>
      )}
    </section>
  );
}
