"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { MARJI_SHOP_ID, type MarjiAnswer } from "@/lib/marji-assistant";

export function MarjiAssistant({ productId }: { productId?: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<MarjiAnswer | null>(null);
  const [asked, setAsked] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function ask(value: string) {
    if (busy || !value.trim()) return;
    setBusy(true); setError(""); setAnswer(null); setAsked(value.trim());
    try {
      const response = await fetch("/api/marji-assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: value.trim(), ...(productId ? { productId } : {}) }), cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Réponse indisponible.");
      setAnswer(data); setQuestion("");
    } catch (err) { setError(err instanceof Error ? err.message : "Réessayez dans un instant."); }
    finally { setBusy(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void ask(question); }
  return (
    <section aria-labelledby="marji-assistant-title" className="min-w-0 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Assistant catalogue MARJI</p>
        <h2 id="marji-assistant-title" className="mt-1 text-xl font-bold">On vous aide à choisir ?</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">Produits, prix et disponibilités des fiches publiées. Réponses automatiques ; MARJI confirme les senteurs, la livraison et le paiement.</p>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Questions rapides">
        {(productId ? ["Quel est le prix ?", "Est-ce disponible ?", "Parler au vendeur"] : ["Voir les produits et prix", "Prix des brumes", "Extraits 20 ml", "Parler au vendeur"]).map(text => <button key={text} type="button" disabled={busy} onClick={() => void ask(text)} className="min-h-11 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-900 disabled:opacity-50">{text}</button>)}
      </div>
      <form onSubmit={submit} className="space-y-2">
        <label htmlFor="marji-question" className="block text-sm font-semibold">Votre question</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="marji-question" value={question} onChange={event => setQuestion(event.target.value)} maxLength={300} required disabled={busy} placeholder="Ex. : Quel est le prix des brumes ?" className="min-h-12 min-w-0 flex-1 rounded-xl border bg-white p-3 text-base" />
          <button disabled={busy || !question.trim()} className="min-h-12 rounded-xl bg-emerald-900 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Recherche…" : "Demander"}</button>
        </div>
        <p className="text-xs text-slate-600">Évitez les informations personnelles ou bancaires. La conversation n’est pas conservée dans cet outil.</p>
      </form>
      <div aria-live="polite" aria-busy={busy} className="space-y-3">
        {asked && <p className="break-words text-sm"><strong>Vous :</strong> {asked}</p>}
        {error && <p role="alert" className="rounded-xl bg-white p-3 text-sm text-red-800">{error}</p>}
        {answer && <>
          <p className="rounded-xl bg-white p-4 text-sm leading-relaxed">{answer.text}</p>
          <ul className="grid gap-3 md:grid-cols-2">
            {answer.products.map(product => <li key={product.id} className="min-w-0 space-y-2 rounded-xl border bg-white p-4">
              <Link href={product.href} className="block break-words font-semibold text-emerald-950 underline">{product.title}</Link>
              <p className="font-bold text-emerald-800">{product.price} <span className="font-normal">l’unité</span></p>
              <p className="text-sm">{product.availability}</p>
              <p className="text-xs text-slate-600">Fiche actualisée le {new Date(product.updatedAt).toLocaleDateString("fr-FR", { timeZone: "Africa/Dakar" })}</p>
              <a href={product.contactUrl} target="_blank" rel="noopener noreferrer" data-engagement-audience="partner" data-shop-id={MARJI_SHOP_ID} className="inline-flex min-h-11 items-center rounded-xl border px-3 py-2 text-sm font-semibold text-emerald-900">Confirmer avec le vendeur ↗</a>
            </li>)}
          </ul>
          <a href={answer.contactUrl} target="_blank" rel="noopener noreferrer" data-engagement-audience="partner" data-shop-id={MARJI_SHOP_ID} className="inline-flex min-h-12 items-center rounded-xl bg-emerald-900 px-4 py-3 font-semibold text-white">{answer.handoff ? "Passer la main au vendeur" : "Parler à MARJI"} sur WhatsApp ↗</a>
          <p className="text-xs text-slate-600">WhatsApp ouvre un brouillon avec votre question. Vous choisissez de l’envoyer.</p>
        </>}
      </div>
    </section>
  );
}
