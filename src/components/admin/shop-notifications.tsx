"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useApiData } from "@/hooks/use-api-data";
import { useToast } from "@/hooks/use-toast";
import type { AccessRequestsData } from './merchant-access-requests';
type Notice = {
  id: string;
  name: string;
  category: string;
  city: string;
  created_at: string;
  email_status: string | null;
};
type Data = {
  pendingCount: number;
  notifications: Notice[];
  emailConfigured: boolean;
  pendingProductsCount: number;
  products: {id:string;shop_id:string;title:string;shop_name:string;updated_at:string}[];
};
const emailLabels: Record<string, string> = {
  queued: "E-mail en attente",
  sending: "Envoi en cours",
  sent: "E-mail accepté par le service d’envoi",
  failed: "Échec de l’e-mail",
  unconfigured: "E-mail à configurer",
};
export function ShopNotifications() {
  const { data, error, refetch } = useApiData<Data>(
    "/api/marketplace/notifications",
  );
  const previous = useRef<Set<string> | null>(null);
  const previousProducts=useRef<Set<string>|null>(null);
  const {data:access,error:accessError}=useApiData<AccessRequestsData>('/api/admin/merchant-access-requests');
  const previousAccess=useRef<Set<string>|null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  useEffect(()=>{
    if(!access)return;
    const fresh=access.requests.filter(r=>!previousAccess.current?.has(r.id));
    if(previousAccess.current&&fresh.length)toast({title:'Nouvelle demande d’accès commerçant',description:fresh.map(r=>r.shop_name).join(', ')});
    previousAccess.current=new Set(access.requests.map(r=>r.id));
  },[access,toast]);
  const total=(data?.pendingCount||0)+(data?.pendingProductsCount||0)+(access?.pendingCount||0);
  useEffect(() => {
    if (!data) return;
    const fresh = data.notifications.filter(
      (n) => !previous.current?.has(n.id),
    );
    if (previous.current && fresh.length)
      toast({
        title: "Nouvelle boutique à valider",
        description: fresh.map((n) => n.name).join(", "),
      });
    previous.current = new Set(data.notifications.map((n) => n.id));
    const freshProducts=data.products.filter(p=>!previousProducts.current?.has(p.id));
    if(previousProducts.current&&freshProducts.length)toast({title:'Produits en attente de validation',description:freshProducts.map(p=>`${p.title} · ${p.shop_name}`).join(', ')});
    previousProducts.current=new Set(data.products.map(p=>p.id));
  }, [data, toast]);
  async function retry(id: string) {
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/marketplace/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const b = await r.json();
      if (!r.ok) throw Error(b.error);
      setMessage(
        "Relance demandée. Le résultat s’actualisera automatiquement.",
      );
      await refetch();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Relance impossible.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="relative shrink-0">
      <summary
        aria-label={
          error
            ? "Notifications boutiques indisponibles"
            : `${data?.pendingCount ?? "…"} boutiques à valider · ${data?.pendingProductsCount??'…'} produits à valider · ${access?.pendingCount??'…'} demandes d’accès`
        }
        className="relative flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-full border"
      >
        <Bell size={20} aria-hidden="true" />
        {total > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-rose-700 px-1.5 text-xs font-bold text-white">
            {total}
          </span>
        )}
        {error && (
          <span className="absolute -right-1 -top-1 rounded-full bg-amber-200 px-1 text-xs">
            !
          </span>
        )}
      </summary>
      <section
        aria-label="Notifications des boutiques"
        className="absolute -right-16 top-12 z-50 max-h-[70vh] w-[min(22rem,calc(100vw-2rem))] space-y-3 overflow-y-auto rounded-2xl border bg-white p-4 text-slate-900 shadow-xl sm:right-0"
      >
        <h2 className="text-lg font-bold">À traiter</h2>
        <p className="text-xs text-slate-600">Les alertes restent présentes jusqu’à la validation ou la suspension de la fiche.</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Link href="/admin/boutiques?validation=boutiques#boutiques" className="rounded-xl border bg-emerald-50 p-3 font-semibold">Boutiques à valider <strong className="block text-xl">{data?.pendingCount??'…'}</strong></Link>
          <Link href="/admin/boutiques?statut=pending#produits" className="rounded-xl border bg-amber-50 p-3 font-semibold">Produits à valider <strong className="block text-xl">{data?.pendingProductsCount??'…'}</strong></Link>
        </div>
        <div className="border-t pt-2 text-sm">
          <Link href="/admin/boutiques#demandes-acces" className="inline-flex min-h-11 items-center font-bold text-emerald-900 underline">Demandes d’accès commerçants · {access?.pendingCount??'…'} →</Link>
          {accessError&&<p>Demandes d’accès temporairement indisponibles.</p>}
        </div>
        {error ? (
          <button className="min-h-11 underline" onClick={() => void refetch()}>
            Notifications indisponibles · Réessayer
          </button>
        ) : !data ? (
          <p>Chargement…</p>
        ) : (
          <>
            <h3 className="text-sm font-bold">Boutiques en attente</h3>
            {!data.notifications.length && <p>Aucune boutique en attente.</p>}
            {data.notifications.slice(0,3).map((n) => (
              <article
                key={n.id}
                className="space-y-1 rounded-xl border p-3 text-sm"
              >
                <Link href={`/admin/boutiques?shop=${n.id}#boutiques`} className="inline-flex min-h-11 items-center break-words font-bold text-emerald-900 underline">{n.name} →</Link>
                <p>
                  {n.category} · {n.city}
                </p>
                <p>
                  {new Date(n.created_at).toLocaleString("fr-FR", {
                    timeZone: "Africa/Dakar",
                  })}{" "}
                  (Dakar)
                </p>
                <details className="text-xs"><summary className="cursor-pointer py-2">Suivi de l’e-mail</summary><p>
                  {n.email_status
                    ? emailLabels[n.email_status]
                    : "Inscrite avant l’activation des e-mails"}
                </p>
                {["failed", "unconfigured", "queued", "sending"].includes(
                  n.email_status || "",
                ) && (
                  <button
                    disabled={busy}
                    onClick={() => void retry(n.id)}
                    className="min-h-11 font-semibold text-emerald-800 underline disabled:opacity-50"
                  >
                    Réessayer l’e-mail
                  </button>
                )}</details>
              </article>
            ))}
            <h3 className="border-t pt-3 text-sm font-bold">Produits en attente</h3>
            {!data.products.length&&<p className="text-sm">Aucun produit en attente.</p>}
            {data.products.slice(0,3).map(p=><Link key={p.id} href={`/admin/boutiques?shop=${p.shop_id}&statut=pending#produits`} className="block rounded-xl border p-3 text-sm"><span className="block break-words font-semibold text-emerald-900">{p.title} →</span><span className="text-slate-600">{p.shop_name}</span></Link>)}
          </>
        )}
        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}
        <Link
          href="/admin/boutiques?validation=boutiques#boutiques"
          className="inline-flex min-h-11 items-center font-semibold text-emerald-800 underline"
        >
          Vérifier les boutiques →
        </Link>
      </section>
    </details>
  );
}
