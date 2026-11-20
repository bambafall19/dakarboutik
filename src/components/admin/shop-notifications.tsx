"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useApiData } from "@/hooks/use-api-data";
import { useToast } from "@/hooks/use-toast";
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
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
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
            : `${data?.pendingCount ?? "…"} boutiques à valider`
        }
        className="relative flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-full border"
      >
        <Bell size={20} aria-hidden="true" />
        {(data?.pendingCount || 0) > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-rose-700 px-1.5 text-xs font-bold text-white">
            {data!.pendingCount}
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
        <h2 className="text-lg font-bold">
          Boutiques à valider · {data?.pendingCount ?? "…"}
        </h2>
        {error ? (
          <button className="min-h-11 underline" onClick={() => void refetch()}>
            Notifications indisponibles · Réessayer
          </button>
        ) : !data ? (
          <p>Chargement…</p>
        ) : (
          <>
            {!data.emailConfigured && (
              <p className="rounded-lg bg-amber-50 p-2 text-sm">
                L’e-mail n’est pas encore configuré. Les alertes dans l’admin
                restent actives.
              </p>
            )}
            {!data.notifications.length && <p>Aucune boutique en attente.</p>}
            {data.notifications.map((n) => (
              <article
                key={n.id}
                className="space-y-1 rounded-xl border p-3 text-sm"
              >
                <h3 className="break-words font-bold">{n.name}</h3>
                <p>
                  {n.category} · {n.city}
                </p>
                <p>
                  {new Date(n.created_at).toLocaleString("fr-FR", {
                    timeZone: "Africa/Dakar",
                  })}{" "}
                  (Dakar)
                </p>
                <p>
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
                )}
              </article>
            ))}
          </>
        )}
        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}
        <Link
          href="/admin/boutiques#boutiques"
          className="inline-flex min-h-11 items-center font-semibold text-emerald-800 underline"
        >
          Vérifier les boutiques →
        </Link>
      </section>
    </details>
  );
}
