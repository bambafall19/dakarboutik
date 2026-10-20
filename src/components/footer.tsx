'use client';

import Link from 'next/link';
import { Separator } from './ui/separator';
import type { SiteSettings } from '@/lib/types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Facebook, Instagram, Phone, Mail, MessageCircle, MapPin, Send } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import { Logo } from './logo';

const footerLinks = {
  Boutique: [
    { name: 'Smartphones', href: '/products?category=telephonie' },
    { name: 'Audio', href: '/products?category=audio' },
    { name: 'Accessoires', href: '/products?category=accessoires' },
    { name: 'PC & Portables', href: '/products?category=informatique' },
    { name: 'Promotions', href: '/products?on_sale=true' },
  ],
  Support: [
    { name: 'À propos', href: '/a-propos' },
    { name: 'Contact', href: '/contact' },
    { name: 'Garantie & SAV', href: '/sav' },
    { name: 'Suivi de Commande', href: '/suivi' },
    { name: 'FAQ', href: '/faq' },
  ],
};

interface FooterProps {
  settings?: SiteSettings | null;
}

export function Footer({ settings }: FooterProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <footer className="relative mt-16 bg-nav text-nav-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="container flex flex-col items-center gap-6 py-10 md:flex-row md:justify-between">
          <div className="max-w-md text-center md:text-left">
            <h3 className="font-headline text-2xl font-extrabold">
              Rejoignez la <span className="text-accent">communauté</span>
            </h3>
            <p className="mt-1 text-sm text-nav-foreground/70">
              Offres exclusives, nouveautés et bons plans livrés dans votre boîte mail.
            </p>
          </div>
          <form className="flex w-full max-w-md gap-2">
            <Input
              type="email"
              placeholder="Votre adresse email"
              className="h-12 rounded-full border-white/15 bg-white/5 px-5 text-nav-foreground placeholder:text-nav-foreground/50 focus-visible:ring-accent"
            />
            <Button type="submit" size="lg" className="h-12 gap-2 rounded-full bg-accent px-6 text-accent-foreground hover:bg-accent/90">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">S&apos;inscrire</span>
            </Button>
          </form>
        </div>
      </div>

      <div className="container pb-8 pt-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="mb-5">
              <Logo imageUrl={settings?.logoUrl} loading={!isClient} inverted />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-nav-foreground/70">
              Votre destination 100% sénégalaise pour l&apos;électronique de qualité, livrée
              partout à Dakar et au Sénégal.
            </p>
            <div className="mt-6 space-y-3">
              {isClient ? (
                <>
                  {settings?.supportPhone && (
                    <a
                      href={`tel:${settings.supportPhone}`}
                      className="group flex items-center gap-3 text-sm text-nav-foreground/70 transition hover:text-accent"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition group-hover:bg-accent/15">
                        <Phone className="h-4 w-4 text-accent" />
                      </span>
                      <span>{settings.supportPhone}</span>
                    </a>
                  )}
                  {settings?.supportEmail && (
                    <a
                      href={`mailto:${settings.supportEmail}`}
                      className="group flex items-center gap-3 text-sm text-nav-foreground/70 transition hover:text-accent"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition group-hover:bg-accent/15">
                        <Mail className="h-4 w-4 text-accent" />
                      </span>
                      <span>{settings.supportEmail}</span>
                    </a>
                  )}
                  {settings?.whatsappNumber && (
                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/\s/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-sm text-nav-foreground/70 transition hover:text-accent"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition group-hover:bg-accent/15">
                        <MessageCircle className="h-4 w-4 text-accent" />
                      </span>
                      <span>Discuter sur WhatsApp</span>
                    </a>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-32 bg-white/10" />
                  <Skeleton className="h-5 w-48 bg-white/10" />
                  <Skeleton className="h-5 w-40 bg-white/10" />
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-1 lg:col-span-5 lg:pl-8">
            <div className="hidden grid-cols-2 gap-8 text-left md:grid">
              {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title}>
                  <h4 className="mb-4 font-headline text-sm font-bold uppercase tracking-wider text-accent">
                    {title}
                  </h4>
                  <nav className="flex flex-col gap-2.5 text-sm">
                    {links.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="w-fit text-nav-foreground/70 transition-colors hover:text-accent"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              ))}
            </div>

            <div className="md:hidden">
              <Accordion type="multiple" className="w-full">
                {Object.entries(footerLinks).map(([title, links]) => (
                  <AccordionItem value={title} key={title} className="border-white/10">
                    <AccordionTrigger className="py-3 text-base font-semibold hover:no-underline">
                      {title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <nav className="flex flex-col gap-3 pl-4">
                        {links.map((link) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            className="py-1 text-nav-foreground/70 transition-colors hover:text-accent"
                          >
                            {link.name}
                          </Link>
                        ))}
                      </nav>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact / social */}
          <div className="lg:col-span-3">
            <h4 className="mb-4 font-headline text-sm font-bold uppercase tracking-wider text-accent">
              Nous trouver
            </h4>
            <p className="flex items-start gap-3 text-sm text-nav-foreground/70">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>Dakar, Sénégal</span>
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-nav-foreground/80 ring-1 ring-white/10 transition hover:bg-accent hover:text-accent-foreground hover:ring-accent"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-nav-foreground/80 ring-1 ring-white/10 transition hover:bg-accent hover:text-accent-foreground hover:ring-accent"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-nav-foreground/60 md:flex-row">
          <div className="text-center md:text-left">
            {isClient ? (
              <p>© {new Date().getFullYear()} DakarBoutik. Une entreprise fièrement sénégalaise.</p>
            ) : (
              <Skeleton className="mb-1 h-5 w-80 bg-white/10" />
            )}
            <p>Developed &amp; Deployed by Mouhamadou BAMBA</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/conditions-generales" className="transition hover:text-accent">
              Conditions générales
            </Link>
            <Link href="/politique-de-confidentialite" className="transition hover:text-accent">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
