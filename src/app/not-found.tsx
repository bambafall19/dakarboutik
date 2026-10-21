'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-8">
        <span className="font-headline text-[7rem] font-extrabold leading-none tracking-tighter text-primary/10 md:text-[10rem]">
          404
        </span>
        <span className="absolute inset-0 flex items-center justify-center font-headline text-5xl font-extrabold tracking-tight text-foreground md:text-6xl">
          Oups
        </span>
      </div>

      <h1 className="font-headline text-2xl font-extrabold tracking-tight md:text-3xl">
        Cette page s&apos;est perdue en route
      </h1>
      <p className="mt-3 max-w-md text-balance text-sm text-muted-foreground md:text-base">
        La page que vous cherchez n&apos;existe pas ou a été déplacée. Retournez à
        l&apos;accueil ou explorez notre boutique.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="rounded-full bg-primary px-6 hover:bg-primary/90">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full px-6">
          <Link href="/products">
            <Search className="mr-2 h-4 w-4" />
            Voir la boutique
          </Link>
        </Button>
      </div>

      <div className="mt-12 w-full max-w-md">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Liens utiles
        </span>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { href: '/products?on_sale=true', label: 'Promotions' },
            { href: '/contact', label: 'Contact' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/5"
            >
              {link.label}
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
