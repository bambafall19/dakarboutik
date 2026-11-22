import Link from "next/link";

export const metadata = {
  title: "Acheter chez les boutiques partenaires | DakarBoutik",
  description: "Comment contacter un vendeur partenaire et confirmer les prix, la livraison, le paiement, la garantie et les retours.",
};

export default function PartnerPurchaseGuide() {
  return <main className="container max-w-3xl space-y-6 py-8 md:py-12">
    <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-emerald-800 underline">← Retour à l’accueil</Link>
    <header className="space-y-3">
      <h1 className="text-3xl font-bold">Acheter chez les boutiques partenaires</h1>
      <p className="leading-relaxed">DakarBoutik vous aide à découvrir les produits et à contacter les commerçants. Votre achat se prépare directement avec la boutique qui publie le produit.</p>
    </header>
    <nav aria-label="Étapes d’achat" className="flex flex-wrap gap-3 text-sm font-semibold text-emerald-800">
      <a className="min-h-11 rounded-xl border p-3" href="#contact">Contacter le vendeur</a>
      <a className="min-h-11 rounded-xl border p-3" href="#livraison">Livraison</a>
      <a className="min-h-11 rounded-xl border p-3" href="#paiement">Paiement</a>
      <a className="min-h-11 rounded-xl border p-3" href="#garantie">Garantie et retours</a>
    </nav>
    <section id="contact" className="scroll-mt-24 space-y-3 rounded-2xl border bg-white p-5">
      <h2 className="text-xl font-bold">1. Choisir le produit et contacter sa boutique</h2>
      <p>Ouvrez la fiche produit puis « Contacter le vendeur ». WhatsApp prépare un brouillon ; vous choisissez de l’envoyer. Confirmez le prix, le format, la quantité et la disponibilité avec le vendeur avant de convenir d’un achat.</p>
      <p className="text-sm text-slate-600">Les prix et disponibilités affichés proviennent des fiches publiées. Un clic WhatsApp ne confirme ni une commande, ni un paiement, ni une vente.</p>
    </section>
    <section id="livraison" className="scroll-mt-24 space-y-3 rounded-2xl border bg-white p-5">
      <h2 className="text-xl font-bold">2. Convenir de la livraison ou du retrait</h2>
      <p>Demandez à la boutique les zones desservies, les frais, le délai et les possibilités de retrait. Ces modalités se confirment directement avec elle ; il n’existe pas de tarif ou de délai unique pour tous les partenaires.</p>
    </section>
    <section id="paiement" className="scroll-mt-24 space-y-3 rounded-2xl border bg-white p-5">
      <h2 className="text-xl font-bold">3. Confirmer le paiement avec le vendeur</h2>
      <p>La boutique vous indique les moyens de paiement qu’elle accepte et le montant total, livraison comprise le cas échéant. Vérifiez avec elle le destinataire du règlement et demandez un justificatif.</p>
      <p>Le catalogue et l’assistant DakarBoutik n’encaissent pas le paiement de ces achats. Aucun paiement n’est déclenché par l’ouverture d’un brouillon WhatsApp.</p>
    </section>
    <section id="garantie" className="scroll-mt-24 space-y-3 rounded-2xl border bg-white p-5">
      <h2 className="text-xl font-bold">4. Demander les conditions de garantie et de retour</h2>
      <p>Avant l’achat, demandez au vendeur les conditions applicables au produit : garantie éventuelle, état du produit, échanges, retours et prise en charge d’un problème. Les durées et prestations ne sont pas identiques pour toutes les boutiques.</p>
      <p>Pour un problème lié à un achat partenaire, contactez d’abord la boutique concernée avec vos justificatifs. Pour signaler une fiche ou un problème d’utilisation du site, contactez DakarBoutik.</p>
      <Link href="/contact" className="inline-flex min-h-11 items-center font-semibold text-emerald-800 underline">Contacter la plateforme</Link>
    </section>
    <aside className="space-y-3 rounded-2xl border bg-amber-50 p-5">
      <h2 className="text-xl font-bold">Vous avez une ancienne commande DakarBoutik ?</h2>
      <p>Son suivi est séparé des achats auprès des partenaires. Retrouvez-la avec sa référence ou contactez l’assistance au sujet de cette ancienne commande.</p>
      <div className="flex flex-wrap gap-4 font-semibold text-emerald-800">
        <Link className="inline-flex min-h-11 items-center underline" href="/suivi">Suivre une ancienne commande</Link>
        <Link className="inline-flex min-h-11 items-center underline" href="/sav">SAV des anciennes commandes</Link>
      </div>
    </aside>
    <Link href="/boutiques" className="inline-flex min-h-12 items-center rounded-full bg-emerald-900 px-5 py-3 font-semibold text-white">Découvrir les produits partenaires</Link>
  </main>;
}
