"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { MARJI_SHOP_ID, scentContactUrl, type MarjiAnswer } from "@/lib/marji-assistant";

export function MarjiAssistant({ productId }: { productId?: string }) {
  const uid = useId();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<MarjiAnswer | null>(null);
  const [asked, setAsked] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"products" | "scents" | "seller">("products");
  const [chosenProduct, setChosenProduct] = useState(productId || "");
  const [scent, setScent] = useState("");
  async function ask(value: string, nextMode: typeof mode = "products") {
    if (busy || !value.trim()) return;
    setBusy(true); setError(""); setAnswer(null); setAsked(value.trim()); setMode(nextMode); setScent(""); setChosenProduct(productId || "");
    try {
      const response = await fetch("/api/marji-assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: value.trim(), ...(productId ? { productId } : {}) }), cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Réponse indisponible.");
      setAnswer(data); setQuestion("");
    } catch (err) { setError(err instanceof Error ? err.message : "Réessayez dans un instant."); }
    finally { setBusy(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void ask(question); }
  const selected = answer?.products.find(item => item.id === chosenProduct);
  const validScent = !!selected && selected.scents.includes(scent);
  const contactProps = { target: "_blank", rel: "noopener noreferrer", "data-engagement-audience": "partner", "data-shop-id": MARJI_SHOP_ID } as const;
  const button = "min-h-12 rounded-xl border border-emerald-200 bg-white p-3 text-left text-sm font-bold text-emerald-950 hover:bg-emerald-100 disabled:opacity-50";
  return (
    <section aria-labelledby={`${uid}-title`} className="min-w-0 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Assistant catalogue MARJI</p>
        <h2 id={`${uid}-title`} className="mt-1 text-xl font-bold">On vous aide à choisir ?</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">Choisissez en quelques clics. Les prix sont unitaires ; MARJI confirme la disponibilité des senteurs, la livraison et le paiement.</p>
        {productId && <p className="mt-2 text-sm font-semibold text-emerald-800">Le produit de cette fiche est déjà sélectionné.</p>}
      </div>
      <div className="grid gap-2" aria-label="Trois choix MARJI">
        <button type="button" disabled={busy} onClick={() => void ask(productId ? "Quel est le prix ?" : "Voir les produits et prix")} className={button}>🛍️ {productId ? "Voir le produit et son prix" : "Voir les produits et prix"}</button>
        <button type="button" disabled={busy} onClick={() => void ask(productId ? "Quelles senteurs ?" : "Voir les produits et prix", "scents")} className={button}>🌸 Choisir ma senteur</button>
        <button type="button" disabled={busy} onClick={() => void ask("Parler au vendeur", "seller")} className={button}>💬 Parler à MARJI</button>
      </div>
      <div aria-live="polite" aria-busy={busy} className="space-y-3">
        {busy && <p role="status" className="text-sm">Chargement du catalogue…</p>}
        {error && <p role="alert" className="rounded-xl bg-white p-3 text-sm text-red-800">{error}</p>}
        {answer && <>
          <p className="rounded-xl bg-white p-3 text-sm leading-relaxed">{answer.text}</p>
          {mode === "scents" && answer.products.length > 0 ? <div className="space-y-3 rounded-xl border bg-white p-4">
            <label htmlFor={`${uid}-format`} className="block text-sm font-semibold">1. Choisir le format ou la collection</label>
            <select id={`${uid}-format`} className="min-h-12 w-full min-w-0 rounded-xl border p-2 text-base" value={chosenProduct} onChange={event => {setChosenProduct(event.target.value); setScent("");}}>
              <option value="">Sélectionner un produit</option>
              {answer.products.map(item => <option key={item.id} value={item.id}>{item.title} · {item.price}</option>)}
            </select>
            {selected && <>
              <p className="font-bold text-emerald-800">{selected.price} l’unité · {selected.availability}</p>
              {selected.scents.length ? <>
                <label htmlFor={`${uid}-scent`} className="block text-sm font-semibold">2. Choisir la senteur</label>
                <select id={`${uid}-scent`} className="min-h-12 w-full rounded-xl border p-2 text-base" value={scent} onChange={event => setScent(event.target.value)}>
                  <option value="">Sélectionner une senteur</option>
                  {selected.scents.map(name => <option key={name}>{name}</option>)}
                </select>
                {validScent ? <a {...contactProps} href={scentContactUrl(selected,scent)} className="inline-flex min-h-12 items-center rounded-xl bg-emerald-900 p-3 text-sm font-bold text-white">3. Confirmer mon choix avec MARJI ↗</a> : <p className="text-sm text-slate-600">Choisissez une senteur pour préparer votre message.</p>}
              </> : <p className="text-sm">La liste des senteurs n’est pas renseignée sur cette fiche. Demandez-la au vendeur.</p>}
              <Link href={selected.href} className="block min-h-11 py-2 text-sm font-semibold underline">Voir la fiche complète</Link>
              <p className="text-xs text-slate-600">Senteurs annoncées sur la fiche, à confirmer avec MARJI avant achat.</p>
            </>}
          </div> : <ul className="grid gap-3">
            {answer.products.map(product => <li key={product.id} className="min-w-0 space-y-2 rounded-xl border bg-white p-3">
              <div className="flex items-start gap-3">
                {product.image && <img src={product.image} alt="" width={56} height={56} loading="lazy" className="h-14 w-14 shrink-0 rounded-lg object-contain" />}
                <Link href={product.href} className="block break-words text-sm font-semibold text-emerald-950 underline">{product.title}</Link>
              </div>
              <p className="font-bold text-emerald-800">{product.price} <span className="font-normal">l’unité</span></p>
              <p className="text-sm">{product.availability}</p>
              <p className="text-xs text-slate-600">Fiche actualisée le {new Date(product.updatedAt).toLocaleDateString("fr-FR", { timeZone: "Africa/Dakar" })}</p>
              <a {...contactProps} href={product.contactUrl} className="inline-flex min-h-11 items-center rounded-xl border px-3 py-2 text-sm font-semibold text-emerald-900">Confirmer avec le vendeur ↗</a>
            </li>)}
          </ul>}
          <a {...contactProps} href={answer.contactUrl} className="inline-flex min-h-12 items-center rounded-xl bg-emerald-900 px-4 py-3 font-semibold text-white">Parler à MARJI sur WhatsApp ↗</a>
          <p className="text-xs text-slate-600">WhatsApp ouvre un brouillon avec votre choix. Vous choisissez de l’envoyer.</p>
        </>}
      </div>
      <details className="rounded-xl border bg-white p-3">
        <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">Une autre question ?</summary>
        <form onSubmit={submit} className="space-y-2 pt-2">
          <label htmlFor={`${uid}-question`} className="block text-sm font-semibold">Votre question</label>
          <input id={`${uid}-question`} value={question} onChange={event => setQuestion(event.target.value)} maxLength={300} required disabled={busy} placeholder="Ex. : Quel est le prix des brumes ?" className="min-h-12 w-full min-w-0 rounded-xl border bg-white p-3 text-base" />
          <button disabled={busy || !question.trim()} className="min-h-12 rounded-xl bg-emerald-900 px-5 py-3 font-semibold text-white disabled:opacity-50">Demander</button>
          {asked && <p className="break-words text-sm">Dernière question : {asked}</p>}
          <p className="text-xs text-slate-600">Évitez les informations personnelles ou bancaires. La conversation n’est pas conservée dans cet outil.</p>
        </form>
      </details>
    </section>
  );
}
