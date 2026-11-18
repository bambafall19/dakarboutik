import Link from "next/link";

export default function CheckoutPage() {
  return (
    <section className="container space-y-5 py-12">
      <h1 className="text-3xl font-bold">Retrouvez les produits des boutiques partenaires</h1>
      <p>Les nouvelles commandes directes DakarBoutik sont fermées. Contactez le commerçant depuis sa fiche pour convenir du prix, du paiement et de la livraison.</p>
      <Link className="inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground" href="/boutiques">Explorer les produits</Link>
      <p>Vous avez déjà passé une commande ? <Link className="underline" href="/suivi">Consulter son suivi</Link></p>
    </section>
  );
}
