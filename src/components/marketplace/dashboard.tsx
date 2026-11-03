"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { authClient } from "@/lib/auth/client";
import { MarketplaceNav } from "./catalog";
import { PhotoField } from "./photo-field";
import {
  availabilityLabels,
  isProductUrl,
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
  const [emailLogin, setEmailLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const { refresh } = useAuth();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const password = String(data.get("password") || "");
      if (!register && emailLogin) {
        const result = await authClient.signIn.email({ email: String(data.get("email") || "").trim(), password });
        if (result.error) throw Error("E-mail ou mot de passe incorrect, ou connexion indisponible. Réessayez.");
      } else {
        const response = await fetch("/api/auth/session", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: register ? "register-phone" : "login-phone", phone: data.get("phone"), password, name: data.get("name"), email: data.get("email") || "" }),
        });
        const result = await response.json();
        if (!response.ok) throw Error(result.error || "Connexion impossible.");
      }
      await refresh();
      setMessage(register ? "Compte créé. Présentez maintenant votre boutique." : "Connexion effectuée.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Connexion impossible.");
    } finally { setBusy(false); }
  }
  function changeMode(next: boolean) {
    setRegister(next); setMessage(""); setShowPassword(false);
  }
  return <section className="mx-auto max-w-md">
    <p className="mb-5 text-center text-slate-700">Présentez vos produits et recevez les demandes de vos clients.</p>
    <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-emerald-50 p-1" aria-label="Accès commerçant">
        <button type="button" disabled={busy} aria-pressed={!register} onClick={() => changeMode(false)} className={`rounded-lg px-2 py-3 text-sm font-semibold ${!register ? "bg-emerald-800 text-white" : "text-emerald-900"}`}>Se connecter</button>
        <button type="button" disabled={busy} aria-pressed={register} onClick={() => changeMode(true)} className={`rounded-lg px-2 py-3 text-sm font-semibold ${register ? "bg-emerald-800 text-white" : "text-emerald-900"}`}>Créer mon compte</button>
      </div>
      <h2 className="mb-5 text-xl font-bold">{register ? "Bienvenue chez DakarBoutik" : "Retrouvez votre boutique"}</h2>
      <form key={`${register}-${emailLogin}`} onSubmit={submit} className="space-y-4" aria-busy={busy}>
        <fieldset disabled={busy} className="space-y-4">
          {register && <label className="block text-sm">Votre nom<input className={field} name="name" autoComplete="name" required maxLength={100} /></label>}
          {(!emailLogin || register) && <label className="block text-sm">Numéro de téléphone<input className={field} name="phone" type="tel" autoComplete="username" inputMode="tel" placeholder="77 123 45 67" required maxLength={25} aria-describedby="phone-help" /><span id="phone-help" className="mt-1 block text-xs text-slate-500">Sénégal : 9 chiffres. Autre pays : ajoutez l’indicatif (+…).</span></label>}
          {(emailLogin && !register) && <label className="block text-sm">E-mail de votre compte<input className={field} name="email" type="email" autoComplete="username" required /></label>}
          <label className="block text-sm">Mot de passe
            <div className="relative"><input className={`${field} pr-24`} name="password" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} required minLength={register ? 6 : undefined} maxLength={72} aria-describedby={register ? "password-help" : undefined} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} className="absolute inset-y-0 right-2 px-2 text-sm font-medium text-emerald-800">{showPassword ? "Masquer" : "Afficher"}</button>
            </div>
            {register && <span id="password-help" className="mt-1 block text-xs text-slate-500">6 caractères minimum. Vous pouvez choisir un mot de passe plus long.</span>}
          </label>
          {register && <details className="text-sm"><summary className="cursor-pointer py-2 text-emerald-800">Ajouter un e-mail (facultatif)</summary><label className="block">E-mail de contact<input className={field} name="email" type="email" autoComplete="email" maxLength={254} /></label><p className="mt-1 text-xs text-slate-500">Pour vous contacter. Votre connexion reste par téléphone.</p></details>}
          <button disabled={busy} className="w-full rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white disabled:opacity-60">{busy ? "Veuillez patienter…" : register ? "Créer mon compte" : "Se connecter"}</button>
        </fieldset>
        {message && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-slate-800">{message}</p>}
      </form>
      {!register && <button disabled={busy} type="button" onClick={() => { setEmailLogin(!emailLogin); setMessage(""); setShowPassword(false); }} className="mt-4 w-full py-2 text-sm text-emerald-800 underline">{emailLogin ? "Me connecter avec mon téléphone" : "J’ai déjà un compte avec mon e-mail"}</button>}
      <div className="mt-5 border-t pt-4 text-sm">
        <a className="font-medium text-emerald-800 underline" href="https://wa.me/221776384676?text=Bonjour%20DakarBoutik%2C%20j%E2%80%99ai%20besoin%20d%E2%80%99aide%20pour%20acc%C3%A9der%20%C3%A0%20mon%20compte%20commer%C3%A7ant." target="_blank" rel="noopener noreferrer">Mot de passe oublié ? Aide WhatsApp ↗</a>
        <p className="mt-2 text-xs text-slate-500">Notre équipe vérifiera votre demande. Ne communiquez jamais votre mot de passe.</p>
      </div>
    </div>
    {register && <p className="mt-4 text-center text-sm text-slate-600">1. Créez votre compte · 2. Présentez votre boutique · 3. Attendez sa validation</p>}
  </section>;
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
  const [productMode, setProductMode] = useState<"new" | "stock">("new");
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
      const response = await fetch("/api/auth/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
      if (!response.ok) throw Error("Déconnexion impossible.");
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
      <MarketplaceNav compact />
      <main
        className="min-h-screen bg-amber-50 text-slate-900"
        style={{
          backgroundImage: "radial-gradient(ellipse at 0% 0%, #a7f3d0 0%, transparent 48%), radial-gradient(ellipse at 100% 12%, #fde68a 0%, transparent 42%), radial-gradient(ellipse at 95% 90%, #fecaca 0%, transparent 38%), linear-gradient(145deg, #f0fdf4, #fffbeb 55%, #fff1f2)",
          backgroundSize: "100% 100vh",
          backgroundRepeat: "repeat-y",
        }}
      >
        <div className="container space-y-5 py-6 sm:py-10">
          <h1 className="text-3xl font-bold">
            {admin ? "Validation et publicités" : "Mon espace boutique"}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            {user && (
              <>
                <span className="text-sm">{user.phone || user.email}</span>
                <button className="underline" disabled={busy} onClick={logout}>
                  Se déconnecter
                </button>
              </>
            )}
          </div>
          {user?.phone && <details className="max-w-md rounded-xl border bg-white p-4"><summary className="cursor-pointer text-sm font-medium">Modifier mon mot de passe</summary>
            <form className="mt-4 space-y-3" onSubmit={async e => {
              e.preventDefault(); const form = e.currentTarget; const data = new FormData(form); setBusy(true); setMessage("");
              try {
                const response = await fetch("/api/auth/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "change-phone-password", oldPassword: data.get("oldPassword"), newPassword: data.get("newPassword") }) });
                const result = await response.json(); if (!response.ok) throw Error(result.error || "Modification impossible.");
                form.reset(); setMessage("Mot de passe modifié. Les anciennes sessions ont été fermées.");
              } catch (error) { setMessage(error instanceof Error ? error.message : "Modification impossible."); }
              finally { setBusy(false); }
            }}>
              <label className="block text-sm">Mot de passe actuel<input className={field} type="password" name="oldPassword" autoComplete="current-password" required /></label>
              <label className="block text-sm">Nouveau mot de passe<input className={field} type="password" name="newPassword" autoComplete="new-password" minLength={6} maxLength={72} required /></label>
              <button disabled={busy} className="rounded-lg bg-emerald-800 px-4 py-3 text-sm text-white">Enregistrer le nouveau mot de passe</button>
            </form>
          </details>}
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
                  {isProductUrl(l.details.productUrl) && (
                    <a href={l.details.productUrl} target="_blank" rel="noopener noreferrer" className="block underline">Vérifier la fiche produit externe ↗</a>
                  )}
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
                <section className="space-y-3 rounded-2xl border bg-white p-6" aria-labelledby="product-menu-title">
                  <h2 id="product-menu-title" className="text-2xl font-bold">Gérer mes produits</h2>
                  <label className="block text-sm">Que souhaitez-vous faire ?
                    <select className={field} disabled={busy} value={editing?.id || productMode}
                      onChange={e => {
                        const value = e.target.value;
                        setEditing(listings.find(l => l.id === value) || null);
                        setProductMode(value === "stock" ? "stock" : "new");
                        setFormKey(k => k + 1);
                      }}>
                      <option value="new">Ajouter un produit</option>
                      <option value="stock">Actualiser les disponibilités</option>
                      {listings.length > 0 && <optgroup label="Modifier un produit existant">
                        {listings.map(l => <option key={l.id} value={l.id}>{l.details.title} — {l.details.price.toLocaleString("fr-FR")} FCFA</option>)}
                      </optgroup>}
                    </select>
                  </label>
                  <p className="text-sm text-slate-600">Choisissez un produit pour retrouver ses informations, son prix et sa photo. Un changement de sélection remplace le formulaire en cours.</p>
                </section>
              )}
              {shop && shop.status !== "suspended" && productMode !== "stock" && (
                <form
                  id="product-form"
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
                    <div className="space-y-2">
                      <Input name="productUrl" type="url" label="Lien de la fiche produit sur un autre site (facultatif)" value={editing?.details.productUrl} />
                      <p className="text-xs text-slate-600">Collez une adresse HTTPS. Ce lien ouvre la fiche externe ; renseignez ici le prix, la description et la photo.</p>
                    </div>
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
                <h2 className="text-2xl font-bold">{productMode === "stock" ? "Actualiser les disponibilités" : "Mes produits"}</h2>
                {listings.length === 0 && <p className="text-slate-600">Aucun produit pour le moment. Choisissez « Ajouter un produit » dans le menu pour commencer.</p>}
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
                    <button disabled={busy || shop?.status === "suspended"} className="underline" onClick={() => {
                      setProductMode("new"); setEditing(l); setFormKey(k => k + 1);
                      requestAnimationFrame(() => document.getElementById("product-form")?.scrollIntoView({ behavior: "smooth", block: "start" }));
                    }}>
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
