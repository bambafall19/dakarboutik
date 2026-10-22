'use client';

import type { SiteSettings } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React from 'react';
import { Truck, ArrowRight } from 'lucide-react';
import { buildWhatsAppUrl, getWhatsAppNumber } from '@/lib/order-channels';

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

interface AnnouncementBarProps {
  settings?: SiteSettings | null;
  loading: boolean;
}

export function AnnouncementBar({ settings, loading }: AnnouncementBarProps) {
  if (loading) {
    return <Skeleton className="h-9" />;
  }

  const announcements = [
    settings?.announcementMessage1,
    settings?.announcementMessage2,
    settings?.announcementMessage3,
  ].filter(Boolean) as string[];

  if (announcements.length === 0) {
    announcements.push('Livraison offerte à Dakar dès 25 000 FCA');
  }

  return (
    <div className="relative overflow-hidden bg-nav pt-[env(safe-area-inset-top)] text-nav-foreground">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
      <div className="container flex h-9 items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15">
            <Truck className="h-3 w-3 text-accent" />
          </span>
          <ClientOnly>
            <Carousel
              opts={{ loop: true, align: 'start' }}
              plugins={[Autoplay({ delay: 3500 })]}
              className="w-full"
            >
              <CarouselContent>
                {announcements.map((text, index) => (
                  <CarouselItem
                    key={index}
                    className="flex items-center justify-center md:justify-start"
                  >
                    <p className="truncate text-[11px] font-medium tracking-wide text-nav-foreground/85">
                      {text}
                    </p>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </ClientOnly>
        </div>
        {(() => {
          const whatsappNumber = getWhatsAppNumber(settings);
          const href = whatsappNumber
            ? buildWhatsAppUrl(
                whatsappNumber,
                "Bonjour/Bonsoir Dakarboutik, je souhaite passer une commande. @https://dakarboutik.net/"
              )
            : '/contact';

          return (
            <Link
              href={href}
              target={whatsappNumber ? '_blank' : undefined}
              rel={whatsappNumber ? 'noopener noreferrer' : undefined}
              className="group hidden shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-nav-foreground/80 transition hover:border-accent/40 hover:text-accent sm:flex"
            >
              Commander sur WhatsApp
              <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </Link>
          );
        })()}
      </div>
    </div>
  );
}
