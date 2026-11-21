"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ProductImageInput } from "@/components/admin/product-image-input";
import { AdCreative } from "@/components/ad-creative";
import {
  campaignSchema,
  campaignStatus,
  campaignStatusLabels,
  placements,
  adCategories,
  safeAdUrl,
  type Campaign,
  type CampaignStatus,
} from "@/lib/advertising";
const empty = {
  title: "",
  imageUrl: "",
  targetUrl: "/boutiques",
  placement: "home" as const,
  category: "" as const,
  startsOn: "",
  endsOn: "",
  active: false,
  sortOrder: 1,
};
const control = "mt-1 w-full min-w-0 rounded-xl border bg-white p-3 text-base";
export default function PublicitesPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState<Partial<Campaign>>(empty);
  const [editorVersion, setEditorVersion] = useState(0);
  const [editor, setEditor] = useState(false),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState(""),
    [placementFilter, setPlacementFilter] = useState("");
  const previewViewport = useRef<HTMLDivElement>(null);
  const previewContent = useRef<HTMLDivElement>(null);
  const [previewSize, setPreviewSize] = useState({ width: 390, height: 280 });
  const [previewVisible, setPreviewVisible] = useState(true);
  const [preview, setPreview] = useState<"mobile" | "desktop">("mobile"),
    [previewCampaign, setPreviewCampaign] = useState<Partial<Campaign> | null>(
      null,
    );
  const [day, setDay] = useState(new Date().toISOString().slice(0, 10));
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/advertising?admin=1", { cache: "no-store" });
      const data = await r.json();
      if (!r.ok) throw Error(data.error || "Chargement impossible.");
      setCampaigns(data);
      setOrdering(r.headers.get("X-Advertising-Ordering") === "ready");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = setInterval(
      () => setDay(new Date().toISOString().slice(0, 10)),
      60000,
    );
    return () => clearInterval(timer);
  }, [refresh]);
  const field = (key: keyof Campaign, value: string | boolean | number) =>
    setForm((old) => ({ ...old, [key]: value }));
  const open = (campaign?: Campaign) => {
    setForm(
      campaign
        ? { ...campaign, sortOrder: campaign.sortOrder || 1 }
        : {
            ...empty,
            sortOrder: Math.min(
              9999,
              Math.max(0, ...campaigns.map((c) => c.sortOrder || 0)) + 1,
            ),
          },
    );
    setEditorVersion((v) => v + 1);
    setEditor(true);
    setPreviewVisible(true);
    setPreviewCampaign(null);
    setMessage("");
    setError("");
    requestAnimationFrame(() =>
      document
        .getElementById("campaign-editor")
        ?.scrollIntoView({ block: "start" }),
    );
  };
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || uploading) return;
    setError("");
    setMessage("");
    const intent = (event.nativeEvent as SubmitEvent).submitter?.getAttribute(
      "value",
    );
    const values = new FormData(event.currentTarget);
    const payload = {
      ...form,
      startsOn: String(values.get("startsOn") ?? ""),
      endsOn: String(values.get("endsOn") ?? ""),
      active:
        intent === "draft" ? false : intent === "activate" ? true : form.active,
    };
    if (!ordering) delete payload.sortOrder;
    const parsed = campaignSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/advertising", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error || "Enregistrement impossible.");
      setEditor(false);
      setPreviewCampaign(null);
      setMessage(
        "Publicité enregistrée · " +
          campaignStatusLabels[campaignStatus(data, day)] +
          ".",
      );
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }
  const filtered = campaigns.filter(
    (c) =>
      (!statusFilter || campaignStatus(c, day) === statusFilter) &&
      (!placementFilter || c.placement === placementFilter),
  );
  const creative = previewVisible
    ? previewCampaign || (editor ? form : null)
    : null;
  const hasCreative = !!creative;
  const previewWidth = preview === "mobile" ? 390 : 1000;
  const previewScale = Math.min(1, previewSize.width / previewWidth);
  useEffect(() => {
    if (!hasCreative || !previewViewport.current || !previewContent.current)
      return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === previewViewport.current)
          setPreviewSize((old) => ({ ...old, width: entry.contentRect.width }));
        else
          setPreviewSize((old) => ({
            ...old,
            height: entry.contentRect.height,
          }));
      }
    });
    observer.observe(previewViewport.current);
    observer.observe(previewContent.current);
    return () => observer.disconnect();
  }, [hasCreative]);
  return (
    <div className="mx-auto max-w-6xl min-w-0 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Publicités</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Préparez, programmez et organisez les annonces de vos partenaires.
          </p>
        </div>
        <button
          type="button"
          disabled={busy || uploading || loading}
          onClick={() => open()}
          className="min-h-11 rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white"
        >
          Nouvelle publicité
        </button>
      </div>
      <nav aria-label="Statuts des publicités" className="flex flex-wrap gap-2">
        {[["", "Toutes"], ...Object.entries(campaignStatusLabels)].map(
          ([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={statusFilter === key}
              onClick={() => setStatusFilter(key)}
              className={
                "min-h-11 rounded-full border px-4 py-2 text-sm " +
                (statusFilter === key
                  ? "bg-emerald-800 text-white"
                  : "bg-white")
              }
            >
              {label} (
              {
                campaigns.filter((c) => !key || campaignStatus(c, day) === key)
                  .length
              }
              )
            </button>
          ),
        )}
      </nav>
      {message && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 p-3 text-emerald-900"
        >
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">
          {error}
        </p>
      )}
      {!loading && !ordering && (
        <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm">
          L’ordre personnalisé sera disponible après la mise à jour de la base.
          La diffusion actuelle reste conservée.
        </p>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="text-sm">
          Emplacement
          <select
            className={control}
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value)}
          >
            <option value="">Tous les emplacements</option>
            {Object.entries(placements).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-4 text-sm">
          <button
            type="button"
            className="min-h-11 underline"
            disabled={busy || uploading}
            onClick={() => void refresh()}
          >
            Actualiser
          </button>
          <Link
            href="/admin/statistiques"
            className="inline-flex min-h-11 items-center underline"
          >
            Résultats publicitaires →
          </Link>
        </div>
      </div>
      {editor && (
        <form
          key={editorVersion}
          id="campaign-editor"
          onSubmit={save}
          className="scroll-mt-5 space-y-4 rounded-2xl border bg-white p-4 sm:p-6"
        >
          <h2 className="text-lg font-bold">
            {form.id ? "Modifier la publicité" : "Nouvelle publicité"}
          </h2>
          <fieldset
            disabled={busy || uploading}
            className="grid gap-4 sm:grid-cols-2"
          >
            <label className="text-sm">
              Titre
              <input
                required
                maxLength={120}
                className={control}
                value={form.title || ""}
                onChange={(e) => field("title", e.target.value)}
              />
            </label>
            <label className="text-sm">
              Lien de destination
              <input
                required
                className={control}
                placeholder="/boutiques/…"
                value={form.targetUrl || ""}
                onChange={(e) => field("targetUrl", e.target.value)}
              />
            </label>
            <label className="text-sm">
              Emplacement de diffusion
              <select
                className={control}
                value={form.placement}
                onChange={(e) => field("placement", e.target.value)}
              >
                {Object.entries(placements).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Ordre de défilement
              <input
                type="number"
                min={1}
                max={9999}
                step={1}
                disabled={!ordering}
                required={ordering}
                className={control}
                value={form.sortOrder ?? 1}
                onChange={(e) => field("sortOrder", Number(e.target.value))}
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                Le plus petit numéro passe en premier dans chaque emplacement. À
                égalité, la plus récente passe avant.
              </span>
            </label>
            {form.placement === "catalog" && (
              <label className="text-sm">
                Catégorie ciblée
                <select
                  className={control}
                  value={form.category}
                  onChange={(e) => field("category", e.target.value)}
                >
                  {Object.entries(adCategories).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="text-sm">
              Premier jour (facultatif)
              <input
                type="date"
                className={control}
                name="startsOn"
                defaultValue={form.startsOn || ""}
                onChange={(e) => field("startsOn", e.target.value)}
              />
            </label>
            <label className="text-sm">
              Dernier jour (facultatif)
              <input
                type="date"
                min={form.startsOn || undefined}
                className={control}
                name="endsOn"
                defaultValue={form.endsOn || ""}
                onChange={(e) => field("endsOn", e.target.value)}
              />
            </label>
          </fieldset>
          <ProductImageInput
            value={form.imageUrl || ""}
            onChange={(url) => field("imageUrl", url)}
            onBusyChange={setUploading}
          />
          <p className="text-sm text-muted-foreground">
            Dates inclusives à l’heure de Dakar. Un brouillon n’est pas diffusé.
            Une campagne activée passe automatiquement de « Programmée » à « En
            cours », puis « Terminée » selon ses dates.
          </p>
          <div className="flex flex-wrap gap-2">
            {form.id && (
              <button
                disabled={busy || uploading}
                value="keep"
                className="min-h-11 rounded-xl border px-4 py-2"
              >
                Enregistrer les modifications
              </button>
            )}
            <button
              disabled={busy || uploading}
              value="draft"
              className="min-h-11 rounded-xl border px-4 py-2"
            >
              Enregistrer en brouillon
            </button>
            <button
              disabled={busy || uploading}
              value="activate"
              className="min-h-11 rounded-xl bg-emerald-800 px-4 py-2 text-white"
            >
              Activer aux dates prévues
            </button>
            <button
              type="button"
              className="min-h-11 rounded-xl border px-4"
              onClick={() => setPreviewVisible(true)}
            >
              Afficher l’aperçu
            </button>
            <button
              type="button"
              disabled={busy || uploading}
              className="min-h-11 px-4 underline"
              onClick={() => {
                setEditor(false);
                setPreviewCampaign(null);
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
      {creative && (
        <section
          aria-label="Aperçu de la publicité"
          className="min-w-0 space-y-3 rounded-2xl border bg-white p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">Aperçu avant diffusion</h2>
            <div className="flex gap-2">
              {(
                [
                  ["mobile", "Mobile · 390 px"],
                  ["desktop", "Ordinateur · 1 000 px"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={preview === key}
                  className={
                    "min-h-11 rounded-xl border px-3 text-sm " +
                    (preview === key ? "bg-emerald-800 text-white" : "")
                  }
                  onClick={() => setPreview(key)}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                disabled={busy || uploading}
                className="min-h-11 px-2 underline"
                onClick={() => setPreviewVisible(false)}
              >
                Fermer l’aperçu
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Aperçu sans navigation ni compteur de consultation. Le visuel est
            réduit pour tenir dans cet espace.
          </p>
          <div
            ref={previewViewport}
            className="max-w-full overflow-hidden rounded-xl border bg-slate-50 p-2"
          >
            <div
              style={{
                width: previewWidth * previewScale,
                height: previewSize.height * previewScale,
              }}
            >
              <div
                ref={previewContent}
                style={{
                  width: previewWidth,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                }}
              >
                {creative.imageUrl && safeAdUrl(creative.imageUrl) ? (
                  <AdCreative
                    campaign={{
                      title: creative.title || "Titre de votre publicité",
                      imageUrl: creative.imageUrl,
                      placement: creative.placement || "home",
                    }}
                  />
                ) : (
                  <p className="p-6 text-sm">
                    Ajoutez une photo pour afficher l’aperçu.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
      <section aria-labelledby="campaign-list">
        <h2 id="campaign-list" className="mb-3 text-lg font-bold">
          Campagnes ({filtered.length})
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Ordre croissant de diffusion. Modifier une campagne conserve son
          historique de statistiques.
        </p>
        <div className="space-y-3">
          {filtered.map((c) => (
            <article
              key={c.id}
              className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border bg-white p-4"
            >
              <img
                src={c.imageUrl}
                alt=""
                className="h-16 w-16 shrink-0 rounded-lg bg-slate-50 object-contain"
              />
              <div className="min-w-0 flex-1 basis-44">
                <h3 className="break-words text-sm font-bold">{c.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {placements[c.placement]}
                  {c.category ? " · " + adCategories[c.category] : ""} · Ordre{" "}
                  {c.sortOrder ?? "actuel"}
                </p>
                <p className="mt-1 text-xs">
                  {c.startsOn || "Sans début"} → {c.endsOn || "Sans fin"}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold">
                {campaignStatusLabels[campaignStatus(c, day)]}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || uploading}
                  className="min-h-11 rounded-xl border px-3 text-sm"
                  onClick={() => open(c)}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  disabled={busy || uploading}
                  className="min-h-11 rounded-xl border px-3 text-sm"
                  onClick={() => {
                    setEditor(false);
                    setPreviewVisible(true);
                    setPreviewCampaign(c);
                    requestAnimationFrame(() =>
                      document
                        .querySelector('[aria-label="Aperçu de la publicité"]')
                        ?.scrollIntoView({ block: "start" }),
                    );
                  }}
                >
                  Aperçu
                </button>
              </div>
            </article>
          ))}
        </div>
        {loading ? (
          <p role="status">Chargement des campagnes…</p>
        ) : (
          !filtered.length && (
            <p className="rounded-xl border border-dashed p-5">
              Aucune campagne dans cette sélection.
            </p>
          )
        )}
      </section>
    </div>
  );
}
