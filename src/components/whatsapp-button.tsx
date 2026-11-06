'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Search, ArrowRight } from 'lucide-react';
import { Icons } from './icons';
import { useSiteSettings } from '@/hooks/use-site-data';
import { buildWhatsAppUrl, getWhatsAppNumber } from '@/lib/order-channels';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';

const topics = [
  { label: 'Trouver un produit', text: 'Recherchez dans le catalogue DakarBoutik. Les prix et disponibilités sont indiqués sur les fiches produits.', href: '/products', action: 'Voir les produits' },
  { label: 'Boutiques partenaires', text: 'Chaque commerçant gère ses produits. Ouvrez sa boutique pour le contacter et confirmer le stock, la livraison et le paiement.', href: '/boutiques', action: 'Explorer les boutiques' },
  { label: 'Suivre une commande', text: 'Munissez-vous de votre référence de commande. Pour un achat directement auprès d’un partenaire, contactez ce commerçant.', href: '/suivi', action: 'Suivre ma commande' },
  { label: 'Inscrire ma boutique', text: 'Créez votre compte commerçant, présentez votre boutique et ajoutez vos produits. La publication est soumise à validation.', href: '/commercant?inscription=1', action: 'Créer mon espace' },
  { label: 'Livraison et paiement', text: 'Les frais et délais dépendent de votre localité et du vendeur. Confirmez les modalités avec l’équipe avant de commander.', href: '/faq', action: 'Consulter les informations' },
  { label: 'Garantie et SAV', text: 'Consultez les conditions applicables à votre produit. Préparez votre référence de commande pour faciliter votre demande.', href: '/sav', action: 'Consulter le SAV' },
];

export function WhatsAppButton() {
  const { settings } = useSiteSettings();
  const number = getWhatsAppNumber(settings);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const topic = selected === null ? null : topics[selected];
  const whatsappUrl = number ? buildWhatsAppUrl(number, `Bonjour DakarBoutik, j’ai besoin d’aide${topic ? ` : ${topic.label}` : ''}.`) : null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 z-40 flex min-h-12 items-center gap-2 rounded-full bg-emerald-700 px-4 py-3 font-semibold text-white shadow-lg hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:bottom-6" aria-label="Ouvrir l’assistant DakarBoutik">
          <MessageCircle className="h-6 w-6" aria-hidden="true" />Besoin d’aide ?
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-5 motion-reduce:animate-none">
        <DialogTitle className="pr-5 text-xl text-emerald-800">Votre assistant DakarBoutik</DialogTitle>
        <DialogDescription>Bonjour ! Que souhaitez-vous faire ? Cet assistant vous guide automatiquement. Votre équipe reste joignable sur WhatsApp.</DialogDescription>
        <div className="grid grid-cols-2 gap-2">
          {topics.map((item, index) => <button type="button" key={item.label} aria-pressed={selected === index} onClick={() => setSelected(index)} className={`min-h-12 rounded-xl border p-3 text-left text-sm font-medium ${selected === index ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'hover:bg-muted'}`}>{item.label}</button>)}
        </div>
        <div aria-live="polite" aria-atomic="true">
          {topic && <div className="rounded-xl bg-muted p-4"><p className="text-sm leading-relaxed">{topic.text}</p><Link href={topic.href} onClick={() => setOpen(false)} className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-emerald-800 underline">{topic.action}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>}
        </div>
        <form action="/products" role="search" className="space-y-2">
          <label htmlFor="assistant-product" className="text-sm font-medium">Quel produit recherchez-vous ?</label>
          <div className="flex gap-2"><input id="assistant-product" name="q" type="search" required maxLength={120} placeholder="Batterie, ordinateur, téléphone…" className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-base" /><button type="submit" aria-label="Rechercher un produit" className="min-h-11 rounded-lg bg-emerald-700 px-3 text-white"><Search className="h-5 w-5" /></button></div>
        </form>
        {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-3 font-semibold text-white hover:bg-emerald-800"><Icons.whatsapp className="h-5 w-5" />Contacter l’équipe sur WhatsApp</a> : <Link href="/contact" onClick={() => setOpen(false)} className="font-semibold underline">Contacter l’équipe</Link>}
        <p className="text-xs text-muted-foreground">WhatsApp s’ouvre avec un message à vérifier et à envoyer. Aucun message n’est envoyé automatiquement par cet assistant.</p>
      </DialogContent>
    </Dialog>
  );
}
