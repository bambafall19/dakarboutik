"use client";

import { useState } from "react";
import { Package, CheckCircle2, Clock3, Store, ArrowUpRight, Search, ImageIcon } from "lucide-react";
import { availabilityLabels, normalizeMarketplaceText, statusLabels, type Listing, type Shop } from "@/lib/marketplace-model";

export type MerchantPanel = "overview" | "shop" | "products" | "editor";

export function MerchantOverview({ shop, listings, onNavigate }: { shop?: Shop; listings: Listing[]; onNavigate: (panel: MerchantPanel) => void }) {
  const visible = shop?.status === "approved" ? listings.filter(l => l.status === "approved").length : 0;
  const completed = shop ? [shop.profile.name, shop.profile.description, shop.profile.image, shop.profile.address, shop.profile.whatsapp, shop.profile.hours].filter(Boolean).length : 0;
  const progress = Math.round(completed / 6 * 100);
  return <div className="space-y-5">
    <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm" aria-labelledby="merchant-overview-title">
      <div className="h-2 bg-gradient-to-r from-emerald-500 via-yellow-300 to-rose-400" />
      <div className="flex flex-wrap items-center gap-4 p-5 sm:p-7">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border bg-emerald-50 p-2">
          {shop?.profile.image ? <img src={shop.profile.image} alt="Logo de votre boutique" className="h-full w-full object-contain" /> : <Store className="h-9 w-9 text-emerald-700" aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Votre espace personnel</p><h2 id="merchant-overview-title" className="mt-1 break-words text-2xl font-bold sm:text-3xl">{shop?.profile.name || "Bienvenue !"}</h2><p className="mt-2 text-sm text-slate-600">{shop ? `${shop.profile.city} · ${shop.profile.category}` : "Votre prochaine étape : présenter votre boutique."}</p></div>
        {shop && <span className={`rounded-full px-3 py-2 text-xs font-semibold ${shop.status === "approved" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>{statusLabels[shop.status]}</span>}
      </div>
      <div className="flex flex-wrap gap-3 border-t border-slate-100 px-5 py-4 sm:px-7">
        <button type="button" onClick={() => onNavigate(shop && shop.status !== "suspended" ? "editor" : "shop")} className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">{shop && shop.status !== "suspended" ? "+ Ajouter un produit" : "Compléter ma boutique"}</button>
        {shop?.status === "approved" && <a href={`/boutiques/${shop.id}`} className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold">Voir ma boutique <ArrowUpRight size={16} aria-hidden="true" /></a>}
      </div>
    </section>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[{ label: "Produits au catalogue", value: listings.length, icon: Package, color: "bg-sky-50 text-sky-800" }, { label: "Visibles en ligne", value: visible, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-800" }, { label: "En attente de validation", value: listings.filter(l => l.status === "pending").length, icon: Clock3, color: "bg-amber-50 text-amber-800" }, { label: "Disponibles", value: listings.filter(l => l.details.availability === "available").length, icon: Store, color: "bg-violet-50 text-violet-800" }].map(item => <div key={item.label} className="rounded-2xl border border-white bg-white p-4 shadow-sm sm:p-5"><span className={`mb-3 inline-flex rounded-xl p-2 ${item.color}`}><item.icon size={20} aria-hidden="true" /></span><p className="text-3xl font-bold tabular-nums">{item.value}</p><p className="mt-1 text-xs text-slate-600 sm:text-sm">{item.label}</p></div>)}
    </div>
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-2xl border bg-white p-5"><h3 className="font-bold">Une boutique prête à être découverte</h3><div className="mt-3 flex justify-between text-sm"><span>Présentation renseignée</span><span className="font-semibold">{progress} %</span></div><progress className="mt-3 h-2 w-full accent-emerald-600" value={completed} max={6} aria-label="Présentation renseignée" /><p className="mt-3 text-sm text-slate-600">Nom, présentation, photo, adresse, WhatsApp et horaires. Ce score décrit votre fiche, pas sa validation.</p><button type="button" onClick={() => onNavigate("shop")} className="mt-4 text-sm font-semibold text-emerald-800 underline">Améliorer ma présentation →</button></section>
      <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5"><h3 className="font-bold">Votre prochaine action</h3><p className="mt-3 text-sm leading-relaxed text-slate-700">{!shop ? "Créez votre fiche boutique pour commencer à présenter vos produits." : shop.status === "suspended" ? "Votre boutique est suspendue. Contactez l’assistance pour connaître les étapes à suivre." : shop.status === "pending" ? "Votre boutique attend sa validation. Vous pouvez préparer vos produits en attendant." : listings.length === 0 ? "Ajoutez votre premier produit avec une photo claire et un prix à jour." : "Gardez vos disponibilités à jour pour éviter les demandes sur des produits épuisés."}</p><a className="mt-4 inline-block text-sm font-semibold text-emerald-800 underline" href="https://wa.me/221776384676" target="_blank" rel="noopener noreferrer">Contacter l’assistance WhatsApp ↗</a></section>
    </div>
  </div>;
}

export function DashboardCharts({ listings }: { listings: Listing[] }) {
  const groups = [
    { title: "Validation du catalogue", subtitle: "Statut de vos fiches produits", rows: [
      { label: "Approuvés", value: listings.filter(l => l.status === "approved").length, color: "bg-emerald-500" },
      { label: "En attente", value: listings.filter(l => l.status === "pending").length, color: "bg-amber-400" },
      { label: "Suspendus", value: listings.filter(l => l.status === "suspended").length, color: "bg-rose-400" },
    ] },
    { title: "Disponibilités déclarées", subtitle: "Tous les produits, quel que soit leur statut", rows: [
      { label: "Disponibles", value: listings.filter(l => l.details.availability === "available").length, color: "bg-sky-500" },
      { label: "Sur commande", value: listings.filter(l => l.details.availability === "order").length, color: "bg-violet-400" },
      { label: "Épuisés", value: listings.filter(l => l.details.availability === "sold_out").length, color: "bg-slate-400" },
    ] },
  ];
  return <section aria-label="Graphiques du catalogue" className="space-y-3">
    <div className="grid gap-4 lg:grid-cols-2">{groups.map(group => <figure key={group.title} className="rounded-2xl border bg-white p-5 sm:p-6"><figcaption><h3 className="font-bold">{group.title}</h3><p className="mt-1 text-xs text-slate-500">{group.subtitle}</p></figcaption>{!listings.length && <p className="mt-4 text-sm text-slate-500">Les graphiques se rempliront avec vos premiers produits.</p>}<dl className="mt-5 space-y-4">{group.rows.map(row => <div key={row.label}><div className="mb-2 flex items-center justify-between gap-3 text-sm"><dt>{row.label}</dt><dd className="font-semibold tabular-nums">{row.value} <span className="font-normal text-slate-500">· {listings.length ? Math.round(row.value / listings.length * 100) : 0} %</span></dd></div><div aria-hidden="true" className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500 ${row.color}`} style={{ width: `${listings.length ? row.value / listings.length * 100 : 0}%` }} /></div></div>)}</dl></figure>)}</div>
    <p className="text-xs leading-relaxed text-slate-500">Calculé à partir du catalogue actuel. Un produit approuvé n’est visible que si sa boutique est publiée. Ces graphiques ne mesurent pas les ventes ni les visites.</p>
  </section>;
}

export function ProductInventory({ listings, disabled, onEdit, onAvailability }: { listings: Listing[]; disabled: boolean; onEdit: (listing: Listing) => void; onAvailability: (listing: Listing, availability: string) => void }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [availability, setAvailability] = useState("");
  const [sort, setSort] = useState("recent");
  const filtered = listings.filter(l => (!status || l.status === status) && (!availability || l.details.availability === availability) && normalizeMarketplaceText(`${l.details.title} ${l.details.category}`).includes(normalizeMarketplaceText(search))).sort((a,b) => sort === "price" ? a.details.price - b.details.price : sort === "name" ? a.details.title.localeCompare(b.details.title, "fr") : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  const control = "mt-1 w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-sm";
  return <section aria-labelledby="inventory-title" className="space-y-5 rounded-3xl border bg-white p-4 sm:p-6">
    <div><h2 id="inventory-title" className="text-2xl font-bold">Gérer mes produits</h2><p className="mt-2 text-sm text-slate-600">Recherchez une fiche, ajustez sa disponibilité ou modifiez son contenu.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <label className="text-xs font-medium text-slate-600"><span className="inline-flex items-center gap-1"><Search size={14} aria-hidden="true" /> Rechercher un produit</span><input type="search" className={control} value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom ou catégorie" /></label>
      <label className="text-xs font-medium text-slate-600">Validation<select className={control} value={status} onChange={e => setStatus(e.target.value)}><option value="">Tous les statuts</option>{Object.entries(statusLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="text-xs font-medium text-slate-600">Disponibilité du catalogue<select className={control} value={availability} onChange={e => setAvailability(e.target.value)}><option value="">Toutes les disponibilités</option>{Object.entries(availabilityLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="text-xs font-medium text-slate-600">Trier par<select className={control} value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Dernière modification</option><option value="name">Nom du produit</option><option value="price">Prix croissant</option></select></label>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2"><p role="status" className="text-sm text-slate-500">{filtered.length} produit(s) sur {listings.length}</p>{(search || status || availability) && <button type="button" className="text-sm font-semibold text-emerald-800 underline" onClick={() => {setSearch("");setStatus("");setAvailability("");}}>Effacer les filtres</button>}</div>
    {!filtered.length && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">{listings.length ? "Aucun produit ne correspond à ces filtres." : "Votre catalogue est prêt à accueillir son premier produit. Utilisez l’onglet Ajouter un produit."}</div>}
    <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] gap-4 rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid"><span>Produit</span><span>Prix</span><span>Validation</span><span>Disponibilité</span><span>Action</span></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{filtered.map(l => <article key={l.id} className="grid min-w-0 items-center gap-4 rounded-2xl border border-slate-200 p-4 motion-safe:transition-colors hover:border-emerald-300 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto]">
      <div className="flex min-w-0 items-center gap-3"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50">{l.details.image ? <img loading="lazy" src={l.details.image} alt="" className="h-full w-full rounded-xl object-contain" /> : <ImageIcon aria-hidden="true" className="text-slate-300" />}</div><div className="min-w-0"><h3 className="break-words text-sm font-bold">{l.details.title}</h3><p className="mt-1 break-words text-xs text-slate-500">{l.details.category}</p></div></div>
      <p className="text-sm font-semibold tabular-nums">{l.details.price.toLocaleString("fr-FR")} FCFA</p>
      <span className={`w-fit rounded-full px-2 py-1 text-xs font-medium ${l.status === "approved" ? "bg-emerald-50 text-emerald-800" : l.status === "pending" ? "bg-amber-50 text-amber-800" : "bg-rose-50 text-rose-800"}`}>{statusLabels[l.status]}</span>
      <label className="text-xs text-slate-500"><span className="lg:sr-only">Disponibilité</span><select aria-label={`Disponibilité de ${l.details.title}`} className="w-full min-w-0 rounded-lg border bg-white p-2 text-sm text-slate-900" value={l.details.availability} disabled={disabled} onChange={e => onAvailability(l,e.target.value)}>{Object.entries(availabilityLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <button type="button" disabled={disabled} onClick={() => onEdit(l)} className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-800 disabled:opacity-50" aria-label={`Modifier ${l.details.title}`}>Modifier</button>
    </article>)}</div>
  </section>;
}
