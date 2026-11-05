'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CategoryIcons, Icons } from './icons';
import { Logo } from './logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import type { Category, SiteSettings } from '@/lib/types';
import { SheetTitle } from './ui/sheet';
import { X, Heart, Home, Store, ShoppingBag, Search, ArrowRight, UserRound, Sparkles, Tag, MessageCircle, Phone, Mail } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { normalizePhoneNumber } from '@/lib/order-channels';

interface MobileNavProps {
  items: Category[];
  settings?: SiteSettings | null;
  onLinkClick: () => void;
}

const links = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/products', label: 'Produits DakarBoutik', icon: ShoppingBag },
  { href: '/boutiques', label: 'Boutiques partenaires', icon: Store },
  { href: '/commercant', label: 'Mon espace commerçant', icon: UserRound },
];
const row = 'flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

export function MobileNav({ items, settings, onLinkClick }: MobileNavProps) {
  const pathname = usePathname();
  const whatsapp = normalizePhoneNumber(settings?.whatsappNumber || '')?.replace(/\D/g, '');
  const phone = normalizePhoneNumber(settings?.supportPhone || settings?.phone || '');
  const categories = (entries: Category[], trail = '') => entries.map(cat => {
    const Icon = CategoryIcons[cat.slug] || Icons.chevronRight;
    const href = `/products?category=${encodeURIComponent(cat.slug)}`;
    return cat.subCategories?.length ? (
      <AccordionItem key={cat.id} value={`${trail}${cat.id}`} className="border-b-0">
        <AccordionTrigger className={`${row} w-full text-left hover:no-underline`}>
          <span className="flex min-w-0 items-center gap-3"><Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{cat.name}</span>
        </AccordionTrigger>
        <AccordionContent className="ml-5 border-l border-primary/15 pl-2 pb-1">
          <Link className={`${row} text-primary`} href={href} onClick={onLinkClick}>Tout voir dans cette catégorie <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>
          <Accordion type="multiple">{categories(cat.subCategories, `${trail}${cat.id}-`)}</Accordion>
        </AccordionContent>
      </AccordionItem>
    ) : <Link key={cat.id} href={href} onClick={onLinkClick} className={row}><Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span>{cat.name}</span></Link>;
  });

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <div className="shrink-0 border-b bg-gradient-to-br from-emerald-50 to-amber-50 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-slate-900">
        <div className="flex items-center justify-between gap-3">
          <Logo onClick={onLinkClick} />
          <SheetTitle className="flex-1 text-base text-slate-900">Bienvenue !<span className="mt-1 block text-xs font-normal text-slate-600">Vos boutiques, à portée de main</span></SheetTitle>
          <button type="button" aria-label="Fermer le menu" onClick={onLinkClick} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-900 focus-visible:outline focus-visible:outline-2"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <form action="/boutiques" onSubmit={onLinkClick} role="search" aria-label="Rechercher depuis le menu" className="mt-2 flex items-center rounded-xl border border-emerald-200 bg-white">
          <input name="source" value="tous" type="hidden" />
          <input name="q" type="search" aria-label="Produit ou boutique" placeholder="Un produit, une boutique…" className="min-w-0 flex-1 rounded-l-xl bg-transparent px-3 py-3 text-base outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-600" />
          <button aria-label="Rechercher" className="flex h-11 w-11 shrink-0 items-center justify-center text-emerald-800"><Search className="h-5 w-5" aria-hidden="true" /></button>
        </form>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        <nav aria-label="Navigation mobile" className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return <Link key={href} href={href} onClick={onLinkClick} aria-current={active ? 'page' : undefined} className={`${row} ${active ? 'bg-primary/10 text-primary' : ''}`}><Icon className="h-5 w-5 shrink-0" aria-hidden="true" /><span className="flex-1">{label}</span>{active && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />}</Link>;
          })}
        </nav>
        <div className="my-3 grid grid-cols-2 gap-2">
          <Link href="/products?on_sale=true" onClick={onLinkClick} className={`${row} justify-center bg-amber-50 text-amber-950`}><Tag className="h-4 w-4" aria-hidden="true" />Promotions</Link>
          <Link href="/products?sortBy=newest" onClick={onLinkClick} className={`${row} justify-center bg-emerald-50 text-emerald-950`}><Sparkles className="h-4 w-4" aria-hidden="true" />Nouveautés</Link>
        </div>
        <Accordion type="multiple" className="border-y">
          <AccordionItem value="categories" className="border-b-0">
            <AccordionTrigger className="min-h-12 px-3 text-sm font-bold hover:no-underline">Explorer les catégories</AccordionTrigger>
            <AccordionContent><Accordion type="multiple">{categories(items)}</Accordion>{!items.length && <Link className={row} href="/products" onClick={onLinkClick}>Voir tous les produits</Link>}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="help" className="border-b-0">
            <AccordionTrigger className="min-h-12 px-3 text-sm font-bold hover:no-underline">Aide et informations</AccordionTrigger>
            <AccordionContent>{[['/contact','Contact et commandes'],['/sav','Garantie et SAV'],['/faq','Questions fréquentes'],['/a-propos','À propos'],['/mentions-legales','Mentions légales'],['/conditions-generales','Conditions générales'],['/politique-de-confidentialite','Confidentialité']].map(([href,label]) => <Link key={href} href={href} onClick={onLinkClick} className={row}>{label}</Link>)}</AccordionContent>
          </AccordionItem>
        </Accordion>
        <Link href="/favoris" onClick={onLinkClick} className={`${row} mt-2`}><Heart className="h-5 w-5" aria-hidden="true" />Mes favoris</Link>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={`${row} justify-center bg-emerald-50 text-emerald-900`}><MessageCircle className="h-4 w-4" aria-hidden="true" />WhatsApp</a>}
          {phone && <a href={`tel:${phone}`} className={`${row} justify-center border`}><Phone className="h-4 w-4" aria-hidden="true" />Appeler</a>}
          {settings?.supportEmail && <a href={`mailto:${settings.supportEmail}`} className={`${row} col-span-2 min-w-0 text-xs`}><Mail className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="break-all">{settings.supportEmail}</span></a>}
        </div>
        <div className="mt-2 flex items-center justify-between px-3 text-xs text-muted-foreground"><span>Apparence</span><ThemeToggle /></div>
      </div>
      <div className="shrink-0 border-t bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Link href="/commercant?inscription=1" onClick={onLinkClick} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"><Store className="h-5 w-5" aria-hidden="true" />Inscrire ma boutique<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
