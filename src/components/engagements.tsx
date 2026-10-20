'use client';

import { ShieldCheck, MessageSquareHeart, Truck, BadgeCheck } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

const engagements = [
  {
    icon: BadgeCheck,
    title: 'Produits Authentiques',
    description: 'Uniquement des articles neufs et certifiés.',
  },
  {
    icon: ShieldCheck,
    title: 'Qualité Garantie',
    description: 'Une sélection rigoureuse des meilleurs produits.',
  },
  {
    icon: MessageSquareHeart,
    title: 'Service Réactif',
    description: 'Une équipe locale à votre écoute au quotidien.',
  },
  {
    icon: Truck,
    title: 'Livraison Rapide',
    description: 'Vos commandes livrées dans les plus brefs délais.',
  },
];

function EngagementCard({ engagement }: { engagement: (typeof engagements)[number] }) {
  return (
    <div className="group relative flex h-full flex-col items-center gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:bg-white/[0.08]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-0" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/25 to-accent/5 ring-1 ring-accent/30 transition-transform duration-300 group-hover:scale-105">
        <engagement.icon className="h-7 w-7 text-accent" />
      </div>
      <h3 className="font-headline text-lg font-bold">{engagement.title}</h3>
      <p className="text-sm leading-relaxed text-nav-foreground/70">{engagement.description}</p>
    </div>
  );
}

export function Engagements() {
  return (
    <section className="relative overflow-hidden bg-nav py-14 text-nav-foreground md:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="container relative">
        <div className="mb-12 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
            Nos engagements
          </span>
          <h2 className="mt-1.5 font-headline text-2xl font-extrabold tracking-tight md:text-3xl">
            Pourquoi nous choisir ?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-balance text-sm text-nav-foreground/70 md:text-base">
            Votre satisfaction est notre priorité absolue, à chaque étape.
          </p>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <Carousel opts={{ align: 'start', loop: true }} className="mx-auto w-full max-w-xs">
            <CarouselContent>
              {engagements.map((engagement, index) => (
                <CarouselItem key={index}>
                  <div className="h-full p-1">
                    <EngagementCard engagement={engagement} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Desktop Grid */}
        <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-4">
          {engagements.map((engagement) => (
            <EngagementCard key={engagement.title} engagement={engagement} />
          ))}
        </div>
      </div>
    </section>
  );
}
