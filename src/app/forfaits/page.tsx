import Link from "next/link";
import { MarketplaceNav } from "@/components/marketplace/catalog";
import {
  MERCHANT_PLANS,
  VISIBILITY_OPTIONS,
  billingEnabled,
  formatFcfa,
} from "@/lib/merchant-plans";
export const dynamic = "force-dynamic";
export default function PlansPage() {
  const enabled = billingEnabled();
  return (
    <>
      <MarketplaceNav compact />
      <main className="min-h-screen bg-emerald-50/50 text-slate-900">
        <div className="container space-y-10 py-10 sm:py-16">
          <header className="max-w-3xl space-y-4">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
              Votre boutique sur DakarBoutik
            </p>
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
              Un forfait adapté à votre catalogue.
            </h1>
            <p className="text-lg text-slate-600">
              Présentez vos produits, recevez les demandes de vos clients et
              faites découvrir votre commerce.
            </p>
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
              {enabled
                ? "Activation après vérification de votre règlement par notre équipe. Un mois à compter de l’activation, sans renouvellement automatique."
                : "Offres en préparation. Aucun paiement n’est demandé et les boutiques actuelles restent accessibles. L’ouverture sera annoncée avant toute facturation."}
            </p>
          </header>
          <section
            aria-label="Forfaits boutiques"
            className="grid gap-5 md:grid-cols-3"
          >
            {MERCHANT_PLANS.map((plan, i) => (
              <article
                key={plan.id}
                className={`flex min-w-0 flex-col rounded-3xl border bg-white p-6 shadow-sm ${i === 1 ? "border-emerald-600 ring-1 ring-emerald-600" : "border-emerald-100"}`}
              >
                <p className="text-sm font-bold text-emerald-700">
                  {plan.name}
                </p>
                <h2 className="mt-3 text-3xl font-bold">
                  {plan.limit} produits
                </h2>
                <p className="mt-5 text-2xl font-bold">
                  {formatFcfa(plan.price)}
                  <span className="block text-sm font-normal text-slate-500">
                    pour un mois · sans engagement de renouvellement
                  </span>
                </p>
                <p className="my-5 text-sm leading-relaxed text-slate-600">
                  {plan.description}
                </p>
                <ul className="mb-6 space-y-3 text-sm">
                  <li>✓ Fiche boutique et coordonnées</li>
                  <li>✓ Photos, prix et disponibilités</li>
                  <li>✓ Recherche par produit, ville et catégorie</li>
                  <li>✓ Contact direct avec le vendeur</li>
                  <li>✓ Publication après validation</li>
                </ul>
                <Link
                  className="mt-auto rounded-xl bg-emerald-800 px-4 py-3 text-center font-semibold text-white"
                  href={`/commercant?inscription=1&forfait=${plan.id}#forfait`}
                >
                  {enabled ? "Choisir ce forfait" : "Préparer mon inscription"}
                </Link>
              </article>
            ))}
          </section>
          <section
            className="rounded-3xl border bg-white p-6 sm:p-8"
            aria-labelledby="visibility-title"
          >
            <h2 id="visibility-title" className="text-2xl font-bold">
              Plus de visibilité, à votre rythme.
            </h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              La publicité est facultative et séparée du forfait. Les
              emplacements dépendent des disponibilités. Aucun nombre de ventes
              ou de contacts n’est garanti.
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {VISIBILITY_OPTIONS.filter((o) => o.id !== "none").map((o) => (
                <article
                  className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5"
                  key={o.id}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                    Sponsorisé · sur devis
                  </p>
                  <h3 className="mt-3 text-xl font-bold">{o.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed">
                    {o.description}
                  </p>
                  <Link
                    className="mt-5 inline-flex min-h-11 items-center font-semibold text-emerald-800 underline"
                    href={`/commercant?publicite=${o.id}#forfait`}
                  >
                    Préparer ma demande →
                  </Link>
                </article>
              ))}
            </div>
          </section>
          <section className="max-w-3xl space-y-4">
            <h2 className="text-2xl font-bold">Comment cela fonctionne</h2>
            <ol className="list-decimal space-y-3 pl-5">
              <li>Créez votre compte et renseignez votre boutique.</li>
              <li>
                Choisissez votre forfait et, si besoin, une option de publicité.
              </li>
              <li>
                Notre équipe vous confirme les modalités de règlement. Une
                preuve envoyée ne vaut pas confirmation de paiement.
              </li>
              <li>
                Après vérification du paiement, le forfait est activé pour un
                mois. Vos fiches restent soumises à validation.
              </li>
            </ol>
            <p className="text-sm text-slate-600">
              Les produits en attente et publiés occupent une place dans le
              forfait. Les produits suspendus libèrent leur place. À
              l’expiration, les fiches sont conservées et leur affichage public
              est interrompu jusqu’au renouvellement. La publicité fait l’objet
              d’une validation et d’un calendrier séparés.
            </p>
            <p className="text-sm text-slate-600">
              La sélection « boutiques actives » dépend du nombre de produits
              publiés. Elle reste distincte des publicités payantes et ne
              constitue pas une note de qualité.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
