"use client";
import { useState } from "react";
import { adminImageUrl } from "@/lib/admin-image-url";
import { ProductImageInput } from "@/components/admin/product-image-input";
import {
  availabilityLabels,
  type Listing,
  type Shop,
  type ListingDetails,
} from "@/lib/marketplace-model";
const input = "mt-1 w-full min-w-0 rounded-xl border bg-white p-3 text-base";
export function AdminProductEditor({
  shop,
  listing,
  duplicate,
  busy,
  onBusy,
  onSave,
  onCancel,
}: {
  shop: Shop;
  listing: Listing | null;
  duplicate: boolean;
  busy: boolean;
  onBusy: (busy: boolean) => void;
  onSave: (
    details: ListingDetails,
    status?: "pending" | "approved",
  ) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [image, setImage] = useState(listing?.details.image || "");
  return (
    <form
      id="admin-listing-editor"
      className="scroll-mt-6 space-y-4 rounded-xl border bg-slate-50 p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        const form = new FormData(event.currentTarget);
        const intent = (
          event.nativeEvent as SubmitEvent
        ).submitter?.getAttribute("value");
        const details = {
          title: String(form.get("title") || ""),
          price: Number(form.get("price")),
          category: String(form.get("category") || ""),
          description: String(form.get("description") || ""),
          image: adminImageUrl(image, window.location.origin),
          productUrl: String(form.get("productUrl") || ""),
          availability: String(
            form.get("availability"),
          ) as ListingDetails["availability"],
        };
        await onSave(
          details,
          intent === "approved"
            ? "approved"
            : intent === "pending"
              ? "pending"
              : undefined,
        );
      }}
    >
      <h3 className="font-bold">
        {duplicate
          ? "Dupliquer le produit"
          : listing
            ? "Modifier le produit"
            : "Nouveau produit"}{" "}
        · {shop.profile.name}
      </h3>
      <p className="text-sm text-slate-600">
        {duplicate
          ? "La copie sera une nouvelle fiche. Vérifiez son nom et son prix avant de l’enregistrer."
          : "Un brouillon est conservé en attente et reste invisible sur le site."}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Nom du produit
          <input
            name="title"
            className={input}
            defaultValue={
              duplicate
                ? `${listing?.details.title || ""} (copie)`.slice(0, 150)
                : listing?.details.title
            }
            minLength={3}
            maxLength={150}
            required
          />
        </label>
        <label className="text-sm">
          Prix en FCFA
          <input
            name="price"
            type="number"
            className={input}
            defaultValue={listing?.details.price}
            min={0}
            max={1000000000}
            step="any"
            required
          />
        </label>
        <label className="text-sm">
          Catégorie
          <input
            name="category"
            className={input}
            defaultValue={listing?.details.category || shop.profile.category}
            minLength={2}
            maxLength={80}
            required
          />
        </label>
        <label className="text-sm">
          Disponibilité
          <select
            name="availability"
            className={input}
            defaultValue={listing?.details.availability || "available"}
          >
            {Object.entries(availabilityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ProductImageInput
        value={image}
        onChange={setImage}
        onBusyChange={onBusy}
      />
      <label className="block text-sm">
        Description
        <textarea
          name="description"
          className={input}
          rows={3}
          defaultValue={listing?.details.description}
          minLength={10}
          maxLength={2500}
          required
        />
      </label>
      <details>
        <summary className="min-h-11 cursor-pointer text-sm">
          Lien externe facultatif
        </summary>
        <label className="text-sm">
          Lien HTTPS du produit
          <input
            type="url"
            name="productUrl"
            className={input}
            defaultValue={listing?.details.productUrl}
          />
        </label>
      </details>
      <div className="flex flex-wrap gap-2">
        {listing && !duplicate && (
          <button
            disabled={busy}
            className="min-h-11 rounded-xl border bg-white px-4 py-2"
            value="keep"
          >
            Enregistrer les modifications
          </button>
        )}
        <button
          disabled={busy}
          className="min-h-11 rounded-xl border bg-white px-4 py-2"
          value="pending"
        >
          Enregistrer en brouillon
        </button>
        <button
          disabled={busy || shop.status !== "approved"}
          className="min-h-11 rounded-xl bg-emerald-800 px-4 py-2 text-white disabled:opacity-50"
          value="approved"
        >
          Enregistrer et publier
        </button>
        <button
          type="button"
          disabled={busy}
          className="min-h-11 px-4 underline"
          onClick={onCancel}
        >
          Annuler
        </button>
      </div>
      {shop.status !== "approved" && (
        <p className="text-sm">
          La boutique doit être publiée avant de mettre ses produits en ligne.
        </p>
      )}
    </form>
  );
}
