"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  internalTestEnabled,
  setInternalTestEnabled,
} from "@/lib/engagement-client";
import {
  engagementTimeline,
  type EngagementStats,
} from "@/lib/partner-statistics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function StatistiquesPage() {
  const [days, setDays] = useState("30");
  const [data, setData] = useState<EngagementStats>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);
  const [internalTest, setInternalTest] = useState(false);
  const [testModeError, setTestModeError] = useState(false);
  useEffect(() => {
    const sync = () => setInternalTest(internalTestEnabled());
    sync();
    window.addEventListener("pageshow", sync);
    return () => window.removeEventListener("pageshow", sync);
  }, []);
  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/engagement/stats?days=" + days, {
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Chargement impossible.");
      if (id === requestId.current) setData(body);
    } catch (e) {
      if (id === requestId.current)
        setError(e instanceof Error ? e.message : "Chargement impossible.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [days]);
  useEffect(() => {
    void refresh();
    return () => {
      requestId.current++;
    };
  }, [refresh]);
  const toggleInternalTest = () => {
    try {
      setInternalTestEnabled(!internalTest);
      setInternalTest(internalTestEnabled());
      setTestModeError(false);
    } catch {
      setTestModeError(true);
    }
  };
  const chart = engagementTimeline(
    [
      ...(data?.partnerDaily ?? []),
      ...(data?.daily.filter((r) => r.kind.startsWith("ad_")) ?? []),
    ],
    Number(days),
  );
  const partnerTotal = (kind: string) =>
    !data?.attributionReady
      ? "—"
      : (
          data?.partnerTotals?.find((r) => r.kind === kind)?.total ?? 0
        ).toLocaleString("fr-FR");
  const source = (audience: string) =>
    data?.contactSources?.find((r) => r.audience === audience);
  const [activating, setActivating] = useState(false);
  const activate = async () => {
    setActivating(true);
    try {
      const r = await fetch("/api/engagement/setup", { method: "POST" });
      const b = await r.json();
      if (!r.ok) throw Error(b.error);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Activation impossible.");
    } finally {
      setActivating(false);
    }
  };
  const total = (kind: string) =>
    (data?.totals.find((r) => r.kind === kind)?.total ?? 0).toLocaleString(
      "fr-FR",
    );
  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6">
      <header>
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          Statistiques des boutiques partenaires
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Suivez la visibilité des boutiques et les prises de contact sur le
          site. Les ventes réalisées directement avec les commerçants ne sont
          pas connues de DakarBoutik.
        </p>
      </header>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Période des statistiques
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="rounded-xl border bg-background p-3"
          >
            <option value="7">7 jours</option>
            <option value="30">30 jours</option>
            <option value="90">90 jours</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={refresh}
            disabled={loading}
            className="rounded-xl border px-4 py-3 disabled:opacity-50"
          >
            {loading ? "Chargement…" : "Actualiser"}
          </button>
          <Link
            href="/admin/boutiques"
            className="rounded-xl border px-4 py-3 font-semibold"
          >
            Gérer les boutiques →
          </Link>
        </div>
      </div>
      {loading && (
        <p role="status">Chargement des résultats sur {days} jours…</p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}
      {data && !error && !loading && (
        <>
          <section
            aria-labelledby="partner-contacts-title"
            className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 text-slate-900 sm:p-6"
          >
            <h2 id="partner-contacts-title" className="text-xl font-bold">
              Consultations et contacts · {days} jours
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border bg-white p-5">
                <h3 className="text-sm font-semibold text-emerald-900">
                  Consultations de boutiques
                </h3>
                <p className="mt-3 text-4xl font-extrabold text-emerald-800">
                  {partnerTotal("shop_view")}
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  Ouvertures des pages boutiques partenaires ; une personne peut
                  consulter plusieurs fois.
                </p>
              </div>
              <div className="rounded-xl border bg-white p-5">
                <h3 className="text-sm font-semibold text-emerald-900">
                  Clics WhatsApp vers les partenaires
                </h3>
                <p className="mt-3 text-4xl font-extrabold text-emerald-800">
                  {partnerTotal("whatsapp_click")}
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  Intentions de contact, sans confirmation d’envoi du message ni
                  de vente.
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              Seules les interactions attribuées aux boutiques sont comptées
              ici. Le suivi détaillé commence après son activation ; les
              anciennes interactions ne sont pas réattribuées.
            </p>
          </section>
          {!data.attributionReady && (
            <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-slate-900">
              <h2 className="font-bold">
                Activer les statistiques par boutique
              </h2>
              <p className="mt-2 text-sm">
                Le suivi détaillé n’est pas encore actif. L’historique global
                est conservé ; les nouveaux contacts pourront être attribués
                après activation.
              </p>
              <button
                disabled={activating}
                onClick={activate}
                className="mt-4 rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white disabled:opacity-50"
              >
                {activating ? "Activation…" : "Activer le suivi par boutique"}
              </button>
            </section>
          )}
          <section
            aria-labelledby="per-shop-title"
            className="rounded-2xl border bg-card p-5"
          >
            <h2 id="per-shop-title" className="text-lg font-bold">
              Consultations et contacts par boutique · {days} jours
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Contacts depuis l’accueil, la recherche, les fiches produits et la
              page boutique. Un clic n’est pas une vente.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.shops?.map((shop) => (
                <article
                  key={shop.id}
                  className="min-w-0 rounded-xl border p-4"
                >
                  <h3 className="break-words font-bold">{shop.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {shop.status === "approved"
                      ? "Publiée"
                      : shop.status === "suspended"
                        ? "Suspendue"
                        : shop.status === "removed"
                          ? "Retirée"
                          : "En attente"}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt>Consultations</dt>
                      <dd className="mt-1 text-2xl font-bold">
                        {shop.views.toLocaleString("fr-FR")}
                      </dd>
                    </div>
                    <div>
                      <dt>Clics WhatsApp</dt>
                      <dd className="mt-1 text-2xl font-bold">
                        {shop.clicks.toLocaleString("fr-FR")}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
            {data.attributionReady && !data.shops?.length && (
              <p className="mt-3 text-sm">
                Aucune boutique ni interaction sur cette période.
              </p>
            )}
          </section>
          <details className="rounded-2xl border border-dashed bg-card p-5">
            <summary className="cursor-pointer font-bold">
              Autres contacts et historique non attribué
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                ["support", "Assistance DakarBoutik"],
                ["legacy", "Ancien catalogue DakarBoutik"],
                ["unattributed", "Historique non attribué"],
              ].map(([key, label]) => (
                <div key={key}>
                  <h3 className="text-sm font-semibold">{label}</h3>
                  <p className="mt-2 text-2xl font-bold">
                    {(
                      source(key)?.clicks ??
                      (key === "unattributed" && !data.attributionReady
                        ? Number(
                            data.totals.find((r) => r.kind === "whatsapp_click")
                              ?.total || 0,
                          )
                        : 0)
                    ).toLocaleString("fr-FR")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    clics WhatsApp
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {(
                source("unattributed")?.views ??
                (!data.attributionReady
                  ? Number(
                      data.totals.find((r) => r.kind === "shop_view")?.total ||
                        0,
                    )
                  : 0)
              ).toLocaleString("fr-FR")}{" "}
              consultations historiques sans attribution. Les anciennes données
              ne permettent pas de distinguer précisément les vendeurs et
              l’assistance. Elles restent séparées des nouveaux compteurs
              partenaires.
            </p>
          </details>
          <section
            aria-labelledby="contact-chart-title"
            className="min-w-0 rounded-2xl border bg-card p-5"
          >
            <h2 id="contact-chart-title" className="mb-4 text-lg font-bold">
              Évolution des consultations et contacts
            </h2>
            <div
              role="img"
              aria-label="Évolution quotidienne des consultations de boutiques et clics WhatsApp"
              className="h-72 min-w-0"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} width={32} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="shops"
                    name="Consultations boutiques"
                    fill="#0b8060"
                  />
                  <Bar
                    dataKey="whatsapp"
                    name="Clics WhatsApp"
                    fill="#b7791f"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Journées à l’heure de Dakar. Il s’agit d’interactions, pas de
              visiteurs uniques ou de ventes confirmées.
            </p>
          </section>
          <section
            aria-labelledby="ads-title"
            className="space-y-4 rounded-2xl border bg-card p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="ads-title" className="text-lg font-bold">
                Résultats publicitaires
              </h2>
              <Link
                href="/admin/publicites"
                className="text-sm font-semibold text-primary underline"
              >
                Gérer les publicités →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">
                  Affichages publicitaires
                </p>
                <p className="mt-1 text-2xl font-bold">{total("ad_view")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Clics publicitaires
                </p>
                <p className="mt-1 text-2xl font-bold">{total("ad_click")}</p>
              </div>
            </div>
            <details>
              <summary className="cursor-pointer py-2 font-semibold">
                Évolution quotidienne des publicités
              </summary>
              <div
                role="img"
                aria-label="Évolution quotidienne des affichages et clics publicitaires"
                className="mt-3 h-72"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} width={32} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" name="Affichages" fill="#0b8060" />
                    <Bar dataKey="clicks" name="Clics" fill="#b7791f" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </details>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="py-3 text-left font-semibold">
                  Résultats par campagne · {days} jours
                </caption>
                <thead>
                  <tr>
                    <th className="p-2">Publicité</th>
                    <th className="p-2">Affichages</th>
                    <th className="p-2">Clics</th>
                    <th className="p-2">Taux de clic</th>
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="min-w-40 p-2">{c.title}</td>
                      <td className="p-2">{c.views}</td>
                      <td className="p-2">{c.clicks}</td>
                      <td className="p-2">
                        {c.views
                          ? ((c.clicks / c.views) * 100).toFixed(1) + " %"
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data.campaigns.length && (
              <p className="text-sm text-muted-foreground">
                Aucune campagne mesurée sur cette période.
              </p>
            )}
          </section>
          <details className="rounded-2xl border border-dashed bg-card p-5">
            <summary className="cursor-pointer font-bold">
              Anciennes commandes DakarBoutik · historique séparé
            </summary>
            <p className="mt-4 text-sm text-muted-foreground">
              Ces chiffres concernent l’ancien panier DakarBoutik. Ils ne
              représentent pas les commandes ou ventes des boutiques
              partenaires.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium">Anciens accès au panier</h3>
                <p className="mt-2 text-2xl font-bold">
                  {total("checkout_open")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">
                  Anciennes commandes enregistrées hors tests
                </h3>
                <p className="mt-2 text-2xl font-bold">
                  {data.orderCount?.toLocaleString("fr-FR") ?? "—"}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Période sélectionnée : {days} jours. Tous les statuts, commandes
              annulées et archives comprises ; ce total n’est pas un nombre de
              ventes finalisées. Les commandes identifiées comme tests internes
              sont exclues.
            </p>
            <Link
              href={"/admin/orders?statsDays=" + days}
              className="mt-4 inline-block font-semibold text-primary underline"
            >
              Voir les anciennes commandes →
            </Link>
          </details>
        </>
      )}
      <details className="rounded-2xl border bg-card p-5">
        <summary className="cursor-pointer font-semibold">
          Visiteurs, pays et provenances · Vercel Analytics
        </summary>
        <p className="my-3 text-sm">
          Les visiteurs, pages vues, pays, provenances et appareils sont
          disponibles dans Vercel Analytics après activation. Les anciennes
          visites ne peuvent pas être reconstituées.
        </p>
        <a
          className="inline-block rounded-xl border px-4 py-3 text-sm font-semibold"
          href="https://vercel.com/dakarboutikks-projects/dakarboutik/analytics"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ouvrir les visites dans Vercel ↗
        </a>
        <p className="mt-3 text-xs text-muted-foreground">
          Compte Vercel requis. Historique inclus : 30 jours, indépendant du
          sélecteur ci-dessus.
        </p>
      </details>
      <section
        className="rounded-2xl border bg-card p-5"
        aria-labelledby="internal-test-title"
      >
        <h2 id="internal-test-title" className="font-semibold">
          Tests du panier historique
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ce mode exclut uniquement les accès au panier effectués dans cet
          onglet. Il ne filtre pas les consultations de boutiques ni les clics
          WhatsApp.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button
            type="button"
            role="switch"
            aria-checked={internalTest}
            onClick={toggleInternalTest}
            className="rounded-xl border px-4 py-2"
          >
            Mode test interne
          </button>
          <span role="status">{internalTest ? "Activé" : "Désactivé"}</span>
          {internalTest && (
            <Link href="/" className="font-semibold underline">
              Ouvrir le site pour tester →
            </Link>
          )}
        </div>
        {testModeError && (
          <p role="alert" className="mt-2 text-sm">
            Impossible de modifier le mode test. Vérifiez le stockage de session
            du navigateur.
          </p>
        )}
      </section>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Un affichage publicitaire correspond à une annonce visible à au moins 50
        % pendant une seconde, une fois par chargement de page. Les bloqueurs,
        les préférences de confidentialité et les tests peuvent affecter les
        compteurs. Conservation des événements : 90 jours, sans nom, téléphone,
        e-mail ni identifiant de visiteur. Aucune estimation des ventes
        partenaires n’est calculée à partir des clics.
      </p>
    </div>
  );
}
