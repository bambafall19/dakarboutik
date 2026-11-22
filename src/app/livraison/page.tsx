import Link from 'next/link';
import { getShippingBaseCost, getZonesByRegion } from '@/lib/shipping';
import { getSiteSettings } from '@/lib/site-settings-server';

export const metadata = {
  title: 'Livraison & délais | DakarBoutik',
  description: 'Zones, frais et délais indicatifs de livraison au Sénégal.',
};
export const dynamic = 'force-dynamic';

const regions = [
  { id: 'dakar', label: 'Dakar et grande banlieue' },
  { id: 'hors-dakar', label: 'Hors Dakar' },
] as const;

export default async function LivraisonPage() {
  const settings = await getSiteSettings();
  return (
    <div className="container max-w-4xl space-y-8 py-8 md:py-12">
      <h1 className="font-headline text-3xl font-bold">Livraison &amp; délais</h1>
      <aside className="space-y-2 rounded-xl border bg-amber-50 p-4 text-slate-900">
        <p className="font-semibold">Informations pour les anciennes commandes vendues par DakarBoutik.</p>
        <p>Pour un produit d’une boutique partenaire, les frais et le délai se confirment directement avec ce vendeur.</p>
        <Link href="/acheter-chez-les-partenaires#livraison" className="inline-flex min-h-11 items-center font-semibold underline">Livraison des achats partenaires →</Link>
      </aside>
      <p>Pour les commandes vendues par DakarBoutik, les frais sont calculés selon la région de livraison. Notre équipe confirme le délai selon le produit et l’adresse.</p>
      {regions.map(({ id, label }) => (
        <section key={id} aria-labelledby={id} className="space-y-3">
          <h2 id={id} className="text-xl font-bold">{label}</h2>
          <p>Frais de base au panier · <strong>{getShippingBaseCost(settings, id).toLocaleString('fr-FR')} FCFA</strong></p>
          <table className="w-full text-left text-sm">
            <thead className="bg-muted"><tr><th scope="col" className="p-3">Zone</th><th scope="col" className="p-3">Délai indicatif</th></tr></thead>
            <tbody>{getZonesByRegion(id).map(zone => (
              <tr key={zone.id} className="border-b"><th scope="row" className="p-3 font-medium">{zone.label}</th><td className="p-3">{zone.eta.replace('-', ' à ').replace('h', ' h')}</td></tr>
            ))}</tbody>
          </table>
        </section>
      ))}
      <p>Le total et les éventuelles remises de livraison s’affichent avant la confirmation. Pour les boutiques partenaires, confirmez les frais et le délai avec le vendeur.</p>
      <Link href="/contact" className="font-semibold underline">Contacter DakarBoutik pour confirmer un délai</Link>
    </div>
  );
}
