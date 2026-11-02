"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { authClient } from "@/lib/auth/client";
import { MarketplaceNav } from "./catalog";
import { PhotoField } from "./photo-field";
import {
  availabilityLabels,
  statusLabels,
  type Shop,
  type Listing,
} from "@/lib/marketplace-model";

const field =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900";
function Input({
  name,
  label,
  value = "",
  required = false,
  type = "text",
}: {
  name: string;
  label: string;
  value?: string | number;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        className={field}
        name={name}
        defaultValue={value}
        required={required}
        type={type}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? "any" : undefined}
      />
    </label>
  );
}
function AuthForm() {
  const [register, setRegister] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const { refresh } = useAuth();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const email = String(data.get("email"));
      const password = String(data.get("password"));
      const result = register
        ? await authClient.signUp.email({
            email,
            password,
            name: String(data.get("name")),
          })
        : await authClient.signIn.email({ email, password });
      if (result.error)
        throw Error(result.error.message || "Connexion impossible.");
      await refresh();
      setMessage(
        register
          ? "Compte créé. Si un e-mail de vérification est demandé, ouvrez-le pour confirmer votre inscription."
          : "Connexion effectuée.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-md space-y-5 rounded-2xl border bg-white p-6"
    >
      <h2 className="text-xl font-bold">
        {register ? "Créer mon compte commerçant" : "Connexion commerçant"}
      </h2>
      {register && <Input name="name" label="Votre nom" required />}
      <Input name="email" label="E-mail" type="email" required />
      <Input name="password" label="Mot de passe" type="password" required />
      <button
        disabled={busy}
        className="rounded-full bg-emerald-800 px-6 py-3 text-white"
      >
        {busy
          ? "Veuillez patienter…"
          : register
            ? "Créer mon compte"
            : "Se connecter"}
      </button>
      <button
        type="button"
        className="block text-sm underline"
        onClick={() => setRegister(!register)}
      >
        {register ? "J’ai déjà un compte" : "Créer un compte commerçant"}
      </button>
      <p role="status">{message}</p>
    </form>
  );
}
export function MarketplaceDashboard({ admin = false }: { admin?: boolean }) {
  const { user, loading, refresh } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const busy = saving || photoBusy;
  const [editing, setEditing] = useState<Listing | null>(null);
  const [formKey, setFormKey] = useState(0);
  const reload = useCallback(async () => {
    const r = await fetch(`/api/marketplace${admin ? "?admin=1" : ""}`, {
      cache: "no-store",
    });
    const data = await r.json();
    if (!r.ok) throw Error(data.error || "Chargement impossible.");
    setShops(data.shops);
    setListings(data.listings);
    setReady(true);
  }, [admin]);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch(`/api/marketplace${admin ? "?admin=1" : ""}`, { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw Error(data.error || "Chargement impossible.");
        return data;
      })
      .then((data) => {
        if (!cancelled) {
          setShops(data.shops);
          setListings(data.listings);
          setReady(true);
        }
      })
      .catch((e) => {
        if (!cancelled) setMessage(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [user, admin]);
  async function save(body: object) {
    if (photoBusy) return false;
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await r.json();
      if (!r.ok) throw Error(result.error || "Enregistrement impossible.");
      await reload();
      setMessage("Modification enregistrée.");
      return true;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  const shop = shops[0];
  async function logout() {
    setBusy(true);
    try {
      await authClient.signOut();
      setShops([]);
      setListings([]);
      setEditing(null);
      setReady(false);
      setMessage("");
      await refresh();
    } catch {
      setMessage("Déconnexion impossible. Réessayez.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <MarketplaceNav />
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="container space-y-8 py-10">
          <h1 className="text-3xl font-bold">
            {admin ? "Validation et publicités" : "Mon espace boutique"}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            {user && (
              <>
                <span className="text-sm">{user.email}</span>
                <button className="underline" disabled={busy} onClick={logout}>
                  Se déconnecter
                </button>
              </>
            )}
          </div>
          <p role="status" className="whitespace-pre-line">
            {message}
          </p>
          {loading ? (
            <p>Chargement…</p>
          ) : !user ? (
            <AuthForm />
          ) : admin && !user.isAdmin ? (
            <p>Accès réservé à l’administrateur.</p>
          ) : !ready ? (
            <p>
              Le tableau de bord n’est pas disponible.{" "}
              <button
                className="underline"
                onClick={() => reload().catch((e) => setMessage(e.message))}
              >
                Réessayer
              </button>
            </p>
          ) : admin ? (
            <>
              <h2 className="text-2xl font-bold">Boutiques</h2>
              {shops.length === 0 && <p>Aucune boutique inscrite.</p>}
              {shops.map((s) => (
                <form
                  key={`${s.id}-${s.updated_at}`}
                  className="space-y-4 rounded-xl border bg-white p-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const d = new FormData(e.currentTarget);
                    const until = String(d.get("until"));
                    void save({
                      action: "moderate",
                      kind: "shop",
                      id: s.id,
                      status: d.get("status"),
                      sponsoredUntil: until
                        ? new Date(`${until}T23:59:59Z`).toISOString()
                        : null,
                    });
                  }}
                >
                  <h3 className="text-xl font-bold">{s.profile.name}</h3>
                  <p>{s.profile.description}</p>
                  <p>
                    {s.profile.category} · {s.profile.address}, {s.profile.city}{" "}
                    · WhatsApp {s.profile.whatsapp}
                  </p>
                  <p>Horaires : {s.profile.hours}</p>
                  {s.profile.image && (
                    <a
                      className="underline"
                      href={s.profile.image}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir l’image soumise
                    </a>
                  )}
                  <label className="block">
                    Publication
                    <select
                      name="status"
                      className={field}
                      defaultValue={s.status}
                    >
                      {Object.entries(statusLabels).map(([v, label]) => (
                        <option key={v} value={v}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Input
                    name="until"
                    type="date"
                    label="Sponsorisé jusqu’au (laisser vide pour désactiver)"
                    value={
                      s.sponsored_until
                        ? new Date(s.sponsored_until).toISOString().slice(0, 10)
                        : ""
                    }
                  />
                  <button
                    disabled={busy}
                    className="rounded-full bg-emerald-800 px-5 py-3 text-white"
                  >
                    Appliquer
                  </button>
                </form>
              ))}
              <h2 className="text-2xl font-bold">Annonces</h2>
              {listings.map((l) => (
                <article
                  key={l.id}
                  className="space-y-3 rounded-xl border bg-white p-5"
                >
                  <h3 className="text-lg font-bold">
                    {l.details.title} —{" "}
                    {shops.find((s) => s.id === l.shop_id)?.profile.name}
                  </h3>
                  <p>{l.details.description}</p>
                  <p>
                    {l.details.price} FCFA ·{" "}
                    {availabilityLabels[l.details.availability]} ·{" "}
                    {statusLabels[l.status]}
                  </p>
                  {l.details.image && (
                    <a
                      className="underline"
                      href={l.details.image}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir la photo
                    </a>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {(["approved", "suspended", "pending"] as const).map(
                      (status) => (
                        <button
                          key={status}
                          disabled={busy}
                          className="rounded-lg border px-4 py-2"
                          onClick={() =>
                            save({
                              action: "moderate",
                              kind: "listing",
                              id: l.id,
                              status,
                            })
                          }
                        >
                          {status === "approved"
                            ? "Publier"
                            : status === "suspended"
                              ? "Suspendre"
                              : "Remettre en attente"}
                        </button>
                      ),
                    )}
                  </div>
                </article>
              ))}
            </>
          ) : (
            <>
              <p>
                Vous gérez uniquement votre boutique. Les créations et
                modifications de contenu sont soumises à validation. Les
                disponibilités peuvent être actualisées immédiatement.
              </p>
              {shop && (
                <p className="rounded-xl bg-emerald-50 p-4">
                  Votre boutique : {statusLabels[shop.status]}
                </p>
              )}
              <form
                key={shop?.updated_at || "new"}
                className="space-y-5 rounded-2xl border bg-white p-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  void save({
                    action: "shop",
                    profile: Object.fromEntries(new FormData(e.currentTarget)),
                  });
                }}
              >
                <h2 className="text-2xl font-bold">
                  Présentation de ma boutique
                </h2>
                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    name="name"
                    label="Nom de la boutique"
                    value={shop?.profile.name}
                    required
                  />
                  <Input
                    name="category"
                    label="Catégorie"
                    value={shop?.profile.category}
                    required
                  />
                  <Input
                    name="city"
                    label="Ville"
                    value={shop?.profile.city || "Dakar"}
                    required
                  />
                  <Input
                    name="district"
                    label="Quartier"
                    value={shop?.profile.district}
                  />
                  <Input
                    name="address"
                    label="Adresse physique"
                    value={shop?.profile.address}
                    required
                  />
                  <Input
                    name="whatsapp"
                    label="WhatsApp international sans + (ex. 221771234567)"
                    value={shop?.profile.whatsapp}
                    required
                  />
                  <Input
                    name="hours"
                    label="Horaires d’ouverture"
                    value={shop?.profile.hours}
                  />
                  <PhotoField label="Logo ou photo de la boutique (facultatif)" value={shop?.profile.image} disabled={busy} onBusy={setPhotoBusy} />
                </div>
                <label className="block">
                  Présentation
                  <textarea
                    name="description"
                    className={field}
                    defaultValue={shop?.profile.description}
                    maxLength={1500}
                  />
                </label>
                <button
                  disabled={busy}
                  className="rounded-full bg-emerald-800 px-5 py-3 text-white"
                >
                  Soumettre ma boutique
                </button>
              </form>
              {shop && shop.status !== "suspended" && (
                <form
                  key={`${editing?.id || "new"}-${formKey}`}
                  className="space-y-5 rounded-2xl border bg-white p-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const details = Object.fromEntries(
                      new FormData(e.currentTarget),
                    );
                    if (
                      await save({
                        action: "listing",
                        id: editing?.id,
                        details,
                      })
                    ) {
                      setEditing(null);
                      setFormKey((k) => k + 1);
                    }
                  }}
                >
                  <h2 className="text-2xl font-bold">
                    {editing ? "Modifier le produit" : "Ajouter un produit"}
                  </h2>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Input
                      name="title"
                      label="Nom du produit"
                      value={editing?.details.title}
                      required
                    />
                    <Input
                      name="price"
                      type="number"
                      label="Prix en FCFA"
                      value={editing?.details.price}
                      required
                    />
                    <Input
                      name="category"
                      label="Catégorie"
                      value={editing?.details.category || shop.profile.category}
                      required
                    />
                    <PhotoField label="Photo du produit" value={editing?.details.image} disabled={busy} onBusy={setPhotoBusy} />
                  </div>
                  <label className="block">
                    Description
                    <textarea
                      name="description"
                      className={field}
                      defaultValue={editing?.details.description}
                      required
                      minLength={10}
                      maxLength={2500}
                    />
                  </label>
                  <label className="block">
                    Disponibilité
                    <select
                      name="availability"
                      className={field}
                      defaultValue={
                        editing?.details.availability || "available"
                      }
                    >
                      {Object.entries(availabilityLabels).map(([v, label]) => (
                        <option key={v} value={v}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    disabled={busy}
                    className="rounded-full bg-emerald-800 px-5 py-3 text-white"
                  >
                    Soumettre le produit
                  </button>
                  {editing && (
                    <button
                      type="button"
                      disabled={busy}
                      className="ml-4 underline"
                      onClick={() => setEditing(null)}
                    >
                      Annuler
                    </button>
                  )}
                </form>
              )}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Mes produits</h2>
                {listings.map((l) => (
                  <article
                    key={l.id}
                    className="flex flex-wrap items-center gap-4 rounded-xl border bg-white p-5"
                  >
                    <div className="mr-auto">
                      <h3 className="font-bold">{l.details.title}</h3>
                      <p className="text-sm">
                        {statusLabels[l.status]} · {l.details.price} FCFA
                      </p>
                    </div>
                    <label>
                      Disponibilité
                      <select
                        aria-label={`Disponibilité de ${l.details.title}`}
                        className={field}
                        value={l.details.availability}
                        disabled={busy || shop?.status === "suspended"}
                        onChange={(e) =>
                          save({
                            action: "availability",
                            id: l.id,
                            availability: e.target.value,
                          })
                        }
                      >
                        {Object.entries(availabilityLabels).map(
                          ([v, label]) => (
                            <option key={v} value={v}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                    <button disabled={busy} className="underline" onClick={() => setEditing(l)}>
                      Modifier
                    </button>
                  </article>
                ))}
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
