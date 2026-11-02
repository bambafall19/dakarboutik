import Link from "next/link";
import { isSponsored, type Shop } from "@/lib/marketplace-model";

export function MarketplaceSpotlight({ shops, now }: { shops: Shop[]; now: number }) {
  const sponsored = shops.filter((shop) => isSponsored(shop, now)).slice(0, 3);
  const ended = now >= Date.parse("2026-11-14T00:00:00Z");
  const started = now >= Date.parse("2026-10-31T00:00:00Z");
  const advertisingUrl = `https://wa.me/221776384676?text=${encodeURIComponent(
    "Bonjour DakarBoutik, je souhaite faire de la publicité pour ma boutique. Nom de la boutique :\nVille :\nProduits à mettre en avant :\nPériode souhaitée :",
  )}`;

  return (
    <div className="space-y-8">
      <section id="publicite" aria-labelledby="advertising-title" className="scroll-mt-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="advertising-title" className="text-2xl font-bold">À la une des boutiques</h2>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-600">Espace publicitaire</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sponsored.map((shop) => (
            <Link key={shop.id} href={`/boutiques/${shop.id}`} className="min-w-0 overflow-hidden rounded-2xl border border-amber-200 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-800">
              {shop.profile.image && <img src={shop.profile.image} alt={shop.profile.name} loading="lazy" referrerPolicy="no-referrer" className="h-40 w-full object-cover" />}
              <div className="space-y-3 p-6">
                <span className="inline-block rounded-full bg-yellow-200 px-3 py-1 text-xs font-semibold text-emerald-950">Publicité · Sponsorisé</span>
                <h3 className="break-words text-xl font-bold">{shop.profile.name}</h3>
                <p className="text-sm text-slate-600">{shop.profile.category} · {shop.profile.city}</p>
                <p className="line-clamp-2 break-words text-sm">{shop.profile.description}</p>
                <span className="block font-semibold text-emerald-800">Découvrir la boutique →</span>
              </div>
            </Link>
          ))}
          <div className={`rounded-2xl border border-yellow-300 bg-gradient-to-r from-yellow-100 to-yellow-50 p-6 ${sponsored.length === 0 ? "md:col-span-2 lg:col-span-3" : ""}`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-950">Votre publicité ici</p>
            <h3 className="mt-3 text-xl font-bold">Donnez plus de visibilité à votre boutique</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700">Présentez vos nouveautés et vos produits disponibles aux visiteurs de DakarBoutik. Contactez-nous pour connaître les emplacements, les périodes et les tarifs.</p>
            <a href={advertisingUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white">Demander une mise en avant ↗</a>
          </div>
        </div>
      </section>

      <section id="actualites" aria-labelledby="news-title" className="scroll-mt-6 overflow-hidden rounded-2xl border-t-8 border-yellow-400 bg-emerald-950 text-white">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_2fr] md:p-8">
          <div className="border-b border-emerald-700 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200">Actualité · Sport au Sénégal</p>
            <p className="mt-4 text-4xl font-black md:text-5xl">DAKAR<br /><span className="text-yellow-300">2026</span></p>
            <p className="mt-4 text-sm text-emerald-100">31 octobre — 13 novembre 2026</p>
          </div>
          <div>
            <span className="inline-block rounded-full bg-emerald-800 px-3 py-1 text-xs font-semibold">{ended ? "Retour sur l’événement" : started ? "Les Jeux sont en cours" : "À venir"}</span>
            <h2 id="news-title" className="mt-4 text-2xl font-bold md:text-3xl">Les Jeux Olympiques de la Jeunesse à Dakar</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-emerald-100">Dakar 2026 marque la première organisation d’un événement sportif olympique sur le continent africain. Retrouvez les actualités, le programme sportif et les sites de compétition auprès du Comité International Olympique.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="https://www.olympics.com/ioc/dakar-2026" target="_blank" rel="noopener noreferrer" className="rounded-full bg-yellow-300 px-5 py-3 text-sm font-semibold text-emerald-950 hover:bg-yellow-200">Actualités officielles ↗</a>
              <a href="https://www.olympics.com/ioc/dakar-2026-sports-programme" target="_blank" rel="noopener noreferrer" className="rounded-full border border-yellow-300 px-5 py-3 text-sm font-semibold">Programme sportif ↗</a>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-emerald-200">Source : CIO · Informations vérifiées le 2 novembre 2026. Rubrique indépendante, sans affiliation officielle aux Jeux. Les résultats ne sont pas actualisés en direct sur DakarBoutik.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
