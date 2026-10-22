'use client';

import Link from 'next/link';
import { CategoryIcons, Icons } from './icons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import type { Category, SiteSettings } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { SheetTitle } from './ui/sheet';
import {
  X,
  Heart,
  Info,
  Mail,
  Sparkles,
  Phone,
  MessageCircle,
  MapPin,
  Headset,
  HelpCircle,
  Tag,
  Facebook,
  Instagram,
  Music2,
  Send,
  Award,
} from 'lucide-react';
import { Separator } from './ui/separator';
import { ThemeToggle } from './theme-toggle';
import { SnowToggleButton } from './snow-toggle-button';
import { normalizePhoneNumber } from '@/lib/order-channels';

interface MobileNavProps {
  items: Category[];
  settings?: SiteSettings | null;
  onLinkClick: () => void;
}

const shopShortcuts = [
  { name: 'Promotions', href: '/products?on_sale=true', icon: Tag },
  { name: 'Nouveautés', href: '/products?sortBy=newest', icon: Sparkles },
  { name: 'Best-sellers', href: '/products?bestseller=true', icon: Award },
];

const supportLinks = [
  { name: 'À propos', href: '/a-propos', icon: Info },
  { name: 'Contact', href: '/contact', icon: Mail },
  { name: 'Garantie & SAV', href: '/sav', icon: Headset },
  { name: 'FAQ', href: '/faq', icon: HelpCircle },
];

const legalLinks = [
  { name: 'Conditions générales', href: '/conditions-generales' },
  { name: 'Politique de confidentialité', href: '/politique-de-confidentialite' },
];

export function MobileNav({ items, settings, onLinkClick }: MobileNavProps) {
  const whatsappNumber = settings?.whatsappNumber?.replace(/\s/g, '');
  const supportPhone = settings?.supportPhone || settings?.phone;
  const phoneHref = supportPhone
    ? `tel:${normalizePhoneNumber(supportPhone) ?? supportPhone}`
    : undefined;
  const mailHref = settings?.supportEmail ? `mailto:${settings.supportEmail}` : undefined;

  const renderCategoryLinks = (categories: Category[], level = 0) => {
    return categories.map((cat) => {
      const Icon = CategoryIcons[cat.slug] || Icons.chevronRight;
      const hasSubCategories = cat.subCategories && cat.subCategories.length > 0;

      if (hasSubCategories) {
        return (
          <AccordionItem key={cat.id} value={cat.slug} className="border-b-0">
            <AccordionTrigger className="py-3 text-base font-medium hover:no-underline px-4">
                <span className="flex items-center gap-4">
                    <Icon className="h-5 w-5" />
                    {cat.name}
                </span>
            </AccordionTrigger>
            <AccordionContent className="pl-6 border-l ml-6">
                <div className="flex flex-col">
                    {renderCategoryLinks(cat.subCategories!, level + 1)}
                </div>
            </AccordionContent>
          </AccordionItem>
        );
      }

      return (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className="flex items-center gap-4 py-3 text-base px-4"
          onClick={onLinkClick}
          style={{ paddingLeft: level > 0 ? `calc(${level} * 1.5rem + 1rem)` : '1rem' }}
        >
          <Icon className="h-5 w-5" />
          <span className={level > 0 ? 'font-normal text-sm' : 'font-medium'}>{cat.name}</span>
        </Link>
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 border-b bg-nav p-4 text-nav-foreground">
        <SheetTitle className="sr-only">Menu Principal</SheetTitle>
        <div className='flex justify-between items-center'>
          <Link href="/" onClick={onLinkClick} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-700 font-headline text-base font-extrabold text-primary-foreground ring-2 ring-accent/60">
              D
            </span>
            <span className="font-headline text-lg font-extrabold tracking-tight">
              Dakar<span className="text-accent">Boutik</span>
            </span>
          </Link>
           <Button variant="ghost" size="icon" onClick={onLinkClick} className="text-nav-foreground hover:bg-white/10">
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Raccourcis boutique */}
        <div className="grid grid-cols-3 gap-2 p-4">
          {shopShortcuts.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={onLinkClick}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-card px-2 py-3 text-center transition active:scale-95"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/12 text-accent">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-semibold leading-tight text-foreground">{item.name}</span>
            </Link>
          ))}
        </div>

        <nav className="flex flex-col p-4">
            <Link
                href="/"
                className="flex items-center gap-4 py-3 text-base font-medium"
                onClick={onLinkClick}
            >
                <Icons.home className="h-5 w-5" />
                Accueil
            </Link>
            <Link
                href="/products"
                className="flex items-center gap-4 py-3 text-base font-medium"
                onClick={onLinkClick}
            >
                <Icons.layoutGrid className="h-5 w-5" />
                Toute la boutique
            </Link>
        </nav>
        <div className="px-4">
          <Separator />
        </div>
        <Accordion type="multiple" className="flex flex-col py-4">
          {renderCategoryLinks(items)}
        </Accordion>
        <div className="px-4">
          <Separator />
        </div>
        <nav className="flex flex-col gap-1 p-4">
            <Link
                href="/favoris"
                className="flex items-center gap-4 py-3 text-base font-medium"
                onClick={onLinkClick}
            >
                <Heart className="h-5 w-5" />
                Mes favoris
            </Link>
        </nav>

        {/* Besoin d'aide */}
        <div className="px-4">
          <Separator />
        </div>
        <nav className="flex flex-col gap-1 p-4">
          <p className="pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Besoin d&apos;aide
          </p>
          {supportLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-4 py-3 text-base font-medium"
              onClick={onLinkClick}
            >
              <link.icon className="h-5 w-5" />
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Contact direct */}
        <div className="px-4">
          <Separator />
        </div>
        <div className="p-4">
          <p className="pb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Nous contacter
          </p>
          <div className="grid grid-cols-2 gap-2">
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-3 py-3 text-sm font-semibold text-white transition active:scale-95"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}
            {phoneHref && (
              <a
                href={phoneHref}
                className="flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-3 text-sm font-semibold text-primary transition active:scale-95"
              >
                <Phone className="h-4 w-4" />
                Appeler
              </a>
            )}
            {mailHref && (
              <a
                href={mailHref}
                className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-3 py-3 text-sm font-semibold transition active:scale-95"
              >
                <Mail className="h-4 w-4" />
                {settings?.supportEmail}
              </a>
            )}
          </div>

          {settings?.address && (
            <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <span>{settings.address}</span>
            </p>
          )}
        </div>

        {/* Newsletter */}
        <div className="px-4">
          <Separator />
        </div>
        <div className="p-4">
          <p className="font-headline text-sm font-bold">Rejoignez la communauté</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Offres exclusives et nouveautés, livrées dans votre boîte mail.
          </p>
          {whatsappNumber ? (
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                'Bonjour DakarBoutik, je souhaite recevoir vos offres et nouveautés.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accent-foreground transition active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" />
              Recevoir les offres sur WhatsApp
            </a>
          ) : (
            <Button
              type="button"
              className="mt-3 h-12 w-full rounded-full font-semibold"
              onClick={onLinkClick}
            >
              <Send className="mr-2 h-4 w-4" />
              S&apos;inscrire aux offres
            </Button>
          )}
        </div>

        {/* Réseaux sociaux */}
        <div className="px-4">
          <Separator />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3">
            {settings?.facebookUrl ? (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition active:scale-95"
              >
                <Facebook className="h-4 w-4" />
              </a>
            ) : null}
            {settings?.instagramUrl ? (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition active:scale-95"
              >
                <Instagram className="h-4 w-4" />
              </a>
            ) : null}
            {settings?.tiktokUrl ? (
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition active:scale-95"
              >
                <Music2 className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>

        {/* Mentions légales */}
        <div className="px-4">
          <Separator />
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {legalLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="py-1.5 text-xs text-muted-foreground transition active:scale-[0.99]"
              onClick={onLinkClick}
            >
              {link.name}
            </Link>
          ))}
          <p className="pt-2 text-[11px] text-muted-foreground/80">
            © {new Date().getFullYear()} {settings?.siteName || 'DakarBoutik'}. Entreprise fièrement
            sénégalaise.
          </p>
        </nav>
      </ScrollArea>

      <div className="p-4 border-t mt-auto bg-background">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Contrôles</span>
            <div className="flex items-center">
              <SnowToggleButton />
              <ThemeToggle />
            </div>
        </div>
      </div>
    </div>
  );
}
