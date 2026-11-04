"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TrackingLookupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  return <main className="container max-w-xl py-8 sm:py-16">
    <h1 className="text-3xl font-bold">Suivre ma commande</h1>
    <p className="mt-3 text-muted-foreground">Saisissez le numéro indiqué sur votre confirmation de commande DakarBoutik. Conservez ce numéro confidentiel.</p>
    <form className="mt-6 space-y-4 rounded-2xl border bg-card p-5" onSubmit={event => {
      event.preventDefault();
      const id = String(new FormData(event.currentTarget).get("orderId") || "").trim();
      if (!/^[A-Za-z0-9_-]{4,48}$/.test(id)) { setError("Vérifiez le numéro figurant sur votre confirmation."); return; }
      setError(""); router.push(`/suivi/${encodeURIComponent(id)}`);
    }}>
      <label htmlFor="tracking-id" className="block font-semibold">Numéro de commande</label>
      <input id="tracking-id" name="orderId" required maxLength={48} autoCapitalize="none" spellCheck={false} placeholder="DKB-…" aria-describedby="tracking-error" aria-invalid={!!error} className="h-12 w-full rounded-xl border bg-background px-4 text-base" />
      <p id="tracking-error" role="alert" className="text-sm text-destructive">{error}</p>
      <button className="min-h-12 w-full rounded-xl bg-primary px-5 font-bold text-primary-foreground" type="submit">Afficher le suivi</button>
    </form>
    <p className="mt-5 text-sm text-muted-foreground">Pour un achat directement auprès d’une boutique partenaire, contactez cette boutique. Vous avez perdu votre numéro ? <Link className="font-semibold underline" href="/contact">Contacter DakarBoutik</Link>.</p>
  </main>;
}
