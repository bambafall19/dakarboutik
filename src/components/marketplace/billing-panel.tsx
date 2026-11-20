"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  MERCHANT_PLANS,
  VISIBILITY_OPTIONS,
  formatFcfa,
  type Membership,
  type PlanRequest,
} from "@/lib/merchant-plans";
const control = "mt-2 w-full min-w-0 rounded-xl border bg-white p-3 text-base";
const date = (value: string) =>
  new Intl.DateTimeFormat("fr-SN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Dakar",
  }).format(new Date(value));
type Data = {
  enabled: boolean;
  memberships: (Membership & { shop_name?: string })[];
  requests: PlanRequest[];
};
export function BillingPanel({
  admin = false,
  shopExists = false,
  publishedCount = 0,
  usedCount = 0,
  initialPlan = "",
  initialVisibility = "",
}: {
  publishedCount?: number;
  usedCount?: number;
  admin?: boolean;
  shopExists?: boolean;
  initialPlan?: string;
  initialVisibility?: string;
}) {
  const [data, setData] = useState<Data | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [confirm, setConfirm] = useState<PlanRequest | null>(null);
  const [filter, setFilter] = useState("pending");
  const [planId, setPlanId] = useState(
    MERCHANT_PLANS.some((p) => p.id === initialPlan) ? initialPlan : "starter",
  );
  const [visibility, setVisibility] = useState(
    VISIBILITY_OPTIONS.some((p) => p.id === initialVisibility)
      ? initialVisibility
      : "none",
  );
  async function reload() {
    const r = await fetch(
      `/api/marketplace/billing${admin ? "?admin=1" : ""}`,
      { cache: "no-store" },
    );
    const body = await r.json();
    if (!r.ok) throw Error(body.error || "Chargement impossible.");
    setData(body);
    setFailed(false);
  }
  useEffect(() => {
    let canceled = false;
    void fetch(`/api/marketplace/billing${admin ? "?admin=1" : ""}`, {
      cache: "no-store",
    })
      .then(async (r) => {
        const b = await r.json();
        if (!r.ok) throw Error(b.error);
        if (!canceled) setData(b);
      })
      .catch(() => {
        if (!canceled) {
          setFailed(true);
          setMessage("Impossible de charger les forfaits.");
        }
      });
    return () => {
      canceled = true;
    };
  }, [admin]);
  async function save(body: object) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/marketplace/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const b = await r.json();
      if (!r.ok) throw Error(b.error || "Enregistrement impossible.");
      await reload();
      setConfirm(null);
      setMessage(
        "Demande enregistrée. La publicité éventuelle reste à traiter séparément.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  }
  async function request(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await save({
      action: "request",
      planId,
      visibility,
      note: String(form.get("note") || ""),
    });
  }
  const membership = data?.memberships[0];
  const pending = data?.requests.some((r) => r.status === "pending");
  const selected = MERCHANT_PLANS.find((p) => p.id === planId)!;
  const selectedVisibility = VISIBILITY_OPTIONS.find(
    (p) => p.id === visibility,
  )!;
  return (
    <section
      id="forfait"
      className="scroll-mt-8 space-y-5 rounded-3xl border border-emerald-200 bg-white p-5 sm:p-7"
      aria-labelledby="billing-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Forfaits et visibilité
          </p>
          <h2 id="billing-title" className="mt-2 text-2xl font-bold">
            {admin ? "Demandes de forfaits" : "Mon forfait boutique"}
          </h2>
        </div>
        <Link
          href="/forfaits"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-emerald-800 underline"
        >
          Voir les offres →
        </Link>
      </div>
      {message && (
        <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm">
          {message}
        </p>
      )}
      {!admin && shopExists && (
        <div className="space-y-3 rounded-2xl bg-emerald-50 p-4">
          <p className="font-bold">
            {publishedCount} produit(s) publié(s) · {usedCount} fiche(s)
            publiée(s) ou en validation
          </p>
          {!data?.enabled && (
            <>
              <label className="block text-sm">
                Simuler mon forfait
                <select
                  className={control}
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                >
                  {MERCHANT_PLANS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.limit} produits
                    </option>
                  ))}
                </select>
              </label>
              <p>
                {Math.max(0, selected.limit - usedCount)} place(s) restante(s)
                dans cette simulation
                {usedCount > selected.limit
                  ? " · catalogue au-dessus de cette capacité"
                  : ""}
                .
              </p>
              <p className="text-sm">
                Simulation uniquement : aucun forfait activé, aucune limite
                payante appliquée.
              </p>
            </>
          )}
        </div>
      )}
      {!data && !failed && <p>Chargement des forfaits…</p>}
      {failed && (
        <button
          className="rounded-lg border px-4 py-3"
          onClick={() =>
            void reload().catch(() =>
              setMessage("Les forfaits restent indisponibles."),
            )
          }
        >
          Réessayer
        </button>
      )}
      {data && !data.enabled && (
        <div className="space-y-4 rounded-2xl bg-amber-50 p-4">
          <p className="font-semibold">Préparation · facturation non activée</p>
          <p className="text-sm">
            Les tarifs sont préparés. Aucun paiement n’est demandé, aucune
            limite payante n’est encore appliquée. Les boutiques existantes
            conservent leur accès.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {MERCHANT_PLANS.map((p) => (
              <div key={p.id} className="rounded-xl border bg-white p-4">
                <h3 className="font-bold">{p.name}</h3>
                <p>{p.limit} produits</p>
                <p className="mt-2 font-semibold">
                  {formatFcfa(p.price)} / mois
                </p>
              </div>
            ))}
          </div>
          {admin && (
            <p className="text-sm">
              Avant l’ouverture : valider les modalités de règlement, appliquer
              la migration sur une base de prévisualisation et tester les
              demandes. Les publicités restent sur devis et ne s’activent pas
              automatiquement.
            </p>
          )}
        </div>
      )}
      {data?.enabled && !admin && (
        <>
          {membership && (
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="font-bold">
                {membership.state === "legacy"
                  ? "Accès existant conservé"
                  : MERCHANT_PLANS.find((p) => p.id === membership.plan_id)
                      ?.name || "Aucun forfait actif"}
              </p>
              <p className="mt-2 text-sm">
                {membership.used} fiche(s) en attente ou publiée(s)
                {membership.state !== "legacy"
                  ? ` sur ${membership.product_limit}`
                  : " · accès actuel conservé"}
              </p>
              {membership.state === "active" && (
                <p className="mt-2 text-sm">
                  {Math.max(0, membership.product_limit - membership.used)}{" "}
                  place(s) restante(s)
                  {membership.valid_until &&
                  new Date(membership.valid_until).getTime() <= Date.now()
                    ? " · forfait expiré"
                    : ""}
                  .
                </p>
              )}
              {membership.valid_until && (
                <p className="mt-2 text-sm">
                  {new Date(membership.valid_until).getTime() > Date.now()
                    ? "Valable jusqu’au"
                    : "Expiré le"}{" "}
                  {date(membership.valid_until)} (Dakar)
                </p>
              )}
            </div>
          )}
          {!shopExists ? (
            <p>
              Présentez votre boutique avant de demander son forfait. La
              création du compte n’entraîne aucun paiement.
            </p>
          ) : (
            <form onSubmit={request} className="space-y-4">
              <fieldset
                className="grid gap-4 sm:grid-cols-2"
                disabled={busy || pending}
              >
                <label className="text-sm font-medium">
                  Forfait
                  <select
                    className={control}
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                  >
                    {MERCHANT_PLANS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.limit} produits · {formatFcfa(p.price)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Publicité facultative
                  <select
                    className={control}
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                  >
                    {VISIBILITY_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                        {o.id !== "none" ? " · sur devis" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium sm:col-span-2">
                  Précisions (facultatif)
                  <textarea
                    className={control}
                    name="note"
                    rows={3}
                    maxLength={500}
                    placeholder="Par exemple : période souhaitée pour une publicité."
                  />
                </label>
                <div className="rounded-xl bg-slate-50 p-4 text-sm sm:col-span-2">
                  <p className="font-bold">
                    Forfait : {formatFcfa(selected.price)} pour un mois
                  </p>
                  <p className="mt-2">{selectedVisibility.description}</p>
                  <p className="mt-2">
                    Aucun débit à cette étape. L’équipe vous communiquera les
                    modalités de règlement et vérifiera le paiement avant
                    activation. Aucun renouvellement automatique.
                  </p>
                </div>
                <button
                  className="rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white disabled:opacity-50 sm:col-span-2"
                  disabled={busy || pending}
                >
                  {busy
                    ? "Enregistrement…"
                    : pending
                      ? "Une demande est déjà en attente"
                      : "Demander ce forfait"}
                </button>
              </fieldset>
            </form>
          )}
        </>
      )}
      {data?.enabled && admin && (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm">
              État des demandes
              <select
                className={control}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="pending">À vérifier</option>
                <option value="approved">Activées</option>
                <option value="rejected">Refusées</option>
                <option value="">Toutes</option>
              </select>
            </label>
            <Link
              className="text-sm font-semibold text-emerald-800 underline"
              href="/admin/publicites"
            >
              Gérer les bannières publicitaires →
            </Link>
          </div>
          <p className="text-sm text-slate-600">
            Vérifiez le règlement réel avant toute activation. L’option
            publicitaire ne fait pas partie du montant du forfait ; convenez du
            devis et des dates séparément.
          </p>
        </>
      )}
      {data?.enabled && (
        <div className="space-y-3">
          {data.requests
            .filter((r) => !admin || !filter || r.status === filter)
            .map((r) => (
              <article className="space-y-3 rounded-2xl border p-4" key={r.id}>
                <div className="flex flex-wrap justify-between gap-3">
                  <h3 className="font-bold">
                    {admin ? `${r.shop_name} · ` : ""}
                    {
                      MERCHANT_PLANS.find((p) => p.id === r.plan_id)?.name
                    } · {r.product_limit} produits
                  </h3>
                  <span className="text-sm font-semibold">
                    {r.status === "pending"
                      ? "Paiement à vérifier"
                      : r.status === "approved"
                        ? "Forfait activé"
                        : "Demande refusée"}
                  </span>
                </div>
                <p className="text-sm">
                  {formatFcfa(r.price_fcfa)} · demande du {date(r.created_at)}{" "}
                  (Dakar)
                </p>
                <p className="text-sm">
                  Publicité :{" "}
                  {VISIBILITY_OPTIONS.find((o) => o.id === r.visibility)?.name}
                  {r.visibility !== "none"
                    ? " · devis et activation séparés"
                    : ""}
                </p>
                {r.note && (
                  <p className="whitespace-pre-wrap text-sm">{r.note}</p>
                )}
                <p className="break-all font-mono text-xs text-slate-500">
                  Référence : {r.id}
                </p>
                {admin && r.status === "pending" && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      disabled={busy}
                      className="rounded-lg bg-emerald-800 px-4 py-3 text-sm font-semibold text-white"
                      onClick={() => setConfirm(r)}
                    >
                      Vérifier et activer
                    </button>
                    <button
                      disabled={busy}
                      className="rounded-lg border px-4 py-3 text-sm"
                      onClick={() => void save({ action: "reject", id: r.id })}
                    >
                      Refuser la demande
                    </button>
                  </div>
                )}
                {admin && confirm?.id === r.id && (
                  <form
                    className="space-y-4 rounded-xl bg-amber-50 p-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      void save({
                        action: "approve",
                        id: r.id,
                        paid: Number(f.get("paid")),
                        reference: String(f.get("reference") || ""),
                        confirmed: f.get("confirmed") === "on",
                      });
                    }}
                  >
                    <label className="block text-sm">
                      Montant reçu pour le forfait (FCFA)
                      <input
                        className={control}
                        name="paid"
                        type="number"
                        min={r.price_fcfa}
                        max={r.price_fcfa}
                        step="1"
                        required
                      />
                    </label>
                    <label className="block text-sm">
                      Référence du règlement
                      <input
                        className={control}
                        name="reference"
                        minLength={3}
                        maxLength={120}
                        required
                      />
                    </label>
                    <label className="flex items-start gap-3 text-sm">
                      <input
                        className="mt-1"
                        name="confirmed"
                        type="checkbox"
                        required
                      />
                      J’ai vérifié le paiement réel du forfait. Activer un mois
                      sans publicité automatique.
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <button
                        disabled={busy}
                        className="rounded-lg bg-emerald-800 px-4 py-3 text-sm font-semibold text-white"
                      >
                        Confirmer l’activation
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        className="rounded-lg border px-4 py-3 text-sm"
                        onClick={() => setConfirm(null)}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </article>
            ))}
          {data.requests.filter((r) => !admin || !filter || r.status === filter)
            .length === 0 && (
            <p className="text-sm text-slate-500">
              Aucune demande
              {admin ? " dans cette catégorie" : " pour le moment"}.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
