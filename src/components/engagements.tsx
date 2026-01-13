
import { ShieldCheck, MessageSquareHeart, Truck, CreditCard } from 'lucide-react';

const engagements = [
  {
    icon: ShieldCheck,
    title: 'Qualité Garantie',
    description: 'Nous sélectionnons les meilleurs produits pour vous assurer une qualité irréprochable.',
  },
  {
    icon: MessageSquareHeart,
    title: 'Service Client Réactif',
    description: 'Notre équipe est à votre écoute pour vous conseiller et vous assister à chaque étape.',
  },
  {
    icon: CreditCard,
    title: 'Paiement Sécurisé',
    description: 'Achetez en toute confiance grâce à nos systèmes de paiement 100% sécurisés.',
  },
  {
    icon: Truck,
    title: 'Livraison Rapide',
    description: 'Recevez vos commandes dans les plus brefs délais, partout à Dakar et au Sénégal.',
  },
];

export function Engagements() {
  return (
    <section className="bg-muted/50 py-16">
      <div className="container">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Pourquoi nous choisir ?</h2>
            <p className="mt-2 text-muted-foreground">Votre satisfaction est notre priorité absolue.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {engagements.map((engagement) => (
            <div key={engagement.title} className="flex flex-col items-center text-center p-6 rounded-lg transition-all duration-300 hover:bg-background hover:shadow-lg">
              <div className="bg-primary/10 p-4 rounded-full mb-4 border-2 border-primary/20">
                <engagement.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg">{engagement.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{engagement.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
