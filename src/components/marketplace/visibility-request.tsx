"use client";
import { useState, type FormEvent } from "react";
export function VisibilityRequest({ shopExists }: { shopExists: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/marketplace/visibility-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const body = await r.json();
      if (!r.ok) throw Error(body.error || "Demande indisponible.");
      form.reset();
      setMessage(
        "Demande transmise à l’administration. L’équipe vous contactera pour le devis et les dates. Aucun paiement effectué.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Réessayez plus tard.");
    } finally {
      setBusy(false);
    }
  }
  const control =
    "mt-2 w-full min-w-0 rounded-xl border bg-white p-3 text-base";
  return (
    <section
      className="space-y-4 rounded-3xl border bg-white p-5 sm:p-7"
      aria-labelledby="visibility-request-title"
    >
      <h2 id="visibility-request-title" className="text-2xl font-bold">
        Faire connaître ma boutique
      </h2>
      <p>
        Demandez une publicité sur devis. L’administration validera le visuel,
        les dates et le tarif avant toute diffusion.
      </p>
      {!shopExists ? (
        <p>Créez votre boutique pour envoyer une demande.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <fieldset
            disabled={busy}
            className="grid min-w-0 gap-4 sm:grid-cols-2"
          >
            <label>
              Emplacement
              <select name="placement" className={control}>
                <option value="home">Accueil</option>
                <option value="shops">Page des boutiques</option>
              </select>
            </label>
            <label>
              Durée souhaitée
              <select name="days" className={control}>
                <option value="7">7 jours</option>
                <option value="14">14 jours</option>
                <option value="30">30 jours</option>
              </select>
            </label>
            <label>
              E-mail de réponse
              <input
                name="email"
                type="email"
                maxLength={254}
                autoComplete="email"
                required
                className={control}
              />
            </label>
            <label>
              Date de début souhaitée (facultatif)
              <input name="start" type="date" className={control} />
            </label>
            <label className="sm:col-span-2">
              Produits à mettre en avant et précisions
              <textarea
                name="note"
                maxLength={1000}
                rows={3}
                className={control}
              />
            </label>
            <button className="min-h-12 rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white sm:col-span-2">
              {busy ? "Envoi…" : "Demander un devis publicitaire"}
            </button>
          </fieldset>
        </form>
      )}
      {message && (
        <p role="status" className="rounded-xl bg-amber-50 p-3">
          {message}
        </p>
      )}
    </section>
  );
}
