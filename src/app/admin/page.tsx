"use client";
import Link from "next/link";
import {
  Loader2,
  Store,
  Package,
  ClipboardCheck,
  MessageCircle,
} from "lucide-react";
import { useApiData } from "@/hooks/use-api-data";
import { AdminError } from "@/components/admin/admin-error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { partnerOverview, isInternalOrder } from "@/lib/admin-partners";
import { statusLabels, type Shop, type Listing } from "@/lib/marketplace-model";
import type { Order } from "@/lib/types";

type Catalogue = { shops: Shop[]; listings: Listing[] };
type Stats = { totals: { kind: string; total: number }[] };
const manage = "/admin/boutiques";
const linkClass = "font-semibold text-primary underline underline-offset-4";

export default function AdminDashboardPage() {
  const catalogue = useApiData<Catalogue>("/api/marketplace?admin=1");
  const visible = useApiData<Catalogue>("/api/marketplace/catalog");
  const stats = useApiData<Stats>("/api/engagement/stats?days=30");
  const orders = useApiData<Order[]>("/api/orders");
  const refresh = () => {
    void catalogue.refetch();
    void visible.refetch();
    void stats.refetch();
    void orders.refetch();
  };
  if (catalogue.loading || visible.loading)
    return (
      <p role="status" className="flex items-center gap-2 py-10">
        <Loader2 className="h-5 w-5 animate-spin" />
        Chargement du tableau de bord…
      </p>
    );
  if (catalogue.error || visible.error || !catalogue.data || !visible.data)
    return <AdminError onRetry={refresh} />;
  const overview = partnerOverview(
    catalogue.data.shops,
    catalogue.data.listings,
    visible.data.shops,
    visible.data.listings,
  );
  const pending =
    overview.pendingShops.length + overview.pendingProducts.length;
  const pendingOrders = orders.data?.filter(
    (o) => o.status === "pending" && !o.archivedAt && !isInternalOrder(o),
  ).length;
  const count = (kind: string) =>
    stats.data?.totals.find((r) => r.kind === kind)?.total ?? 0;
  const cards = [
    {
      label: "Boutiques publiées",
      value: overview.publishedShops,
      icon: Store,
      href: manage + "#boutiques",
      detail: `${overview.suspendedShops} suspendue(s)`,
    },
    {
      label: "Produits visibles",
      value: overview.visibleProducts,
      icon: Package,
      href: manage + "#produits",
      detail: "Visibles dans le catalogue public",
    },
    {
      label: "À valider",
      value: pending,
      icon: ClipboardCheck,
      href: "#validations",
      detail: `${overview.pendingShops.length} boutique(s) · ${overview.pendingProducts.length} produit(s)`,
    },
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-headline text-2xl font-extrabold">
            Tableau de bord partenaires
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivez vos boutiques, leurs produits et les demandes de contact.
          </p>
        </div>
        <Button variant="outline" onClick={refresh}>
          Actualiser
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-sm">{c.label}</CardTitle>
              <c.icon className="h-5 w-5 shrink-0 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold">{c.value}</p>
              <p className="mt-2 text-xs text-muted-foreground">{c.detail}</p>
              <Link
                className={"mt-4 inline-block text-sm " + linkClass}
                href={c.href}
              >
                {c.label === "À valider"
                  ? "Voir les validations"
                  : `Voir les ${c.label.toLocaleLowerCase("fr")}`}{" "}
                →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <section
        aria-labelledby="contacts-title"
        className="rounded-2xl border bg-card p-5"
      >
        <h2 id="contacts-title" className="text-lg font-bold">
          Visibilité et contacts · 30 derniers jours
        </h2>
        {stats.error ? (
          <p role="alert" className="mt-3">
            Les statistiques sont indisponibles.{" "}
            <button className={linkClass} onClick={() => void stats.refetch()}>
              Réessayer
            </button>
          </p>
        ) : stats.loading ? (
          <p role="status">Chargement des statistiques…</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              ["whatsapp_click", "Clics WhatsApp"],
              ["shop_view", "Consultations de boutiques"],
              ["ad_view", "Affichages publicitaires"],
            ].map(([kind, label]) => (
              <div key={kind}>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold">
                  {count(kind).toLocaleString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Interactions mesurées sur le site, toutes boutiques confondues. Un
          clic WhatsApp ne confirme ni l’envoi d’un message ni une vente.
        </p>
        <Link
          href="/admin/statistiques"
          className={"mt-3 inline-block text-sm " + linkClass}
        >
          Ouvrir les statistiques →
        </Link>
      </section>
      <section
        id="validations"
        aria-labelledby="validation-title"
        className="scroll-mt-6 rounded-2xl border bg-card p-5"
      >
        <h2 id="validation-title" className="text-lg font-bold">
          Validations en attente
        </h2>
        {pending === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Tout est à jour : aucune boutique ni aucun produit en attente.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {overview.pendingShops.slice(0, 5).map((s) => (
              <li key={s.id}>Boutique : {s.profile.name}</li>
            ))}
            {overview.pendingProducts.slice(0, 5).map((l) => (
              <li key={l.id}>Produit : {l.details.title}</li>
            ))}
          </ul>
        )}
        <Link
          href={manage}
          className={"mt-4 inline-block text-sm " + linkClass}
        >
          Gérer les boutiques et produits →
        </Link>
      </section>
      <section
        aria-labelledby="shops-title"
        className="rounded-2xl border bg-card p-5"
      >
        <h2 id="shops-title" className="text-lg font-bold">
          Vos boutiques partenaires
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Classement par nombre de produits visibles, sans estimation de ventes.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {overview.shops.map(({ shop, visible, total }) => (
            <article key={shop.id} className="min-w-0 rounded-xl border p-4">
              <h3 className="break-words font-bold">{shop.profile.name}</h3>
              <p className="mt-1 text-sm">
                {statusLabels[shop.status]} · {visible} produit(s) visible(s)
                sur {total}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <Link href={manage + "#boutiques"} className={linkClass}>
                  Gérer
                </Link>
                {shop.status === "approved" && (
                  <Link href={"/boutiques/" + shop.id} className={linkClass}>
                    Voir la boutique publique
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
        {overview.shops.length === 0 && (
          <p className="mt-4">Aucune boutique inscrite.</p>
        )}
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-lg font-bold">Publicité et forfaits</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Gérez les campagnes et retrouvez la préparation des forfaits dans
            les boutiques.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link href="/admin/publicites" className={linkClass}>
              Gérer les publicités →
            </Link>
            <Link href={manage + "#forfaits"} className={linkClass}>
              Voir les forfaits →
            </Link>
          </div>
        </section>
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-lg font-bold">Anciennes commandes DakarBoutik</h2>
          {orders.error ? (
            <p role="alert" className="mt-2 text-sm">
              Le compteur des anciennes commandes est indisponible.
            </p>
          ) : orders.loading ? (
            <p role="status">Chargement…</p>
          ) : (
            <p className="mt-2 text-sm">
              {pendingOrders} commande(s) à confirmer, hors tests et archives.
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Les échanges WhatsApp des partenaires ne créent pas de commande dans
            cette liste.
          </p>
          <Link
            href="/admin/orders"
            className={"mt-4 inline-block text-sm " + linkClass}
          >
            Ouvrir les anciennes commandes →
          </Link>
        </section>
      </div>
    </div>
  );
}
