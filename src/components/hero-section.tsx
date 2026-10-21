'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import type { Banner } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React from 'react';
import { ArrowRight, ShieldCheck, Truck, Headset } from 'lucide-react';

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

const BannerDisplay = ({ banner, isMain }: { banner: Banner; isMain?: boolean }) => {
  if (!banner.images || banner.images.length === 0) return null;

  if (banner.images.length > 1) {
    return (
      <ClientOnly>
        <Carousel
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 4000 })]}
          className="h-full w-full"
        >
          <CarouselContent>
            {banner.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-full w-full">
                  <Image
                    src={image.imageUrl}
                    alt={banner.title}
                    data-ai-hint={image.imageHint}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                    priority={isMain && index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </ClientOnly>
    );
  }

  const image = banner.images[0];
  return (
    <div className="relative h-full w-full">
      <Image
        src={image.imageUrl}
        alt={banner.title}
        data-ai-hint={image.imageHint}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        priority={isMain}
      />
    </div>
  );
};

const trustItems = [
  { icon: Truck, label: 'Livraison à Dakar' },
  { icon: ShieldCheck, label: 'Paiement sécurisé' },
  { icon: Headset, label: 'Support 7j/7' },
];

interface HeroSectionProps {
  banners: Banner[];
  loading: boolean;
}

export function HeroSection({ banners, loading }: HeroSectionProps) {
  const heroBanners = banners
    .filter((b) => b.position === 'hero' && b.isActive)
    .sort((a, b) => a.order - b.order);
  const adBanners = banners
    .filter((b) => b.position === 'ad' && b.isActive)
    .sort((a, b) => a.order - b.order);
  const announcementBanners = banners
    .filter((b) => b.position === 'announcement' && b.isActive)
    .sort((a, b) => a.order - b.order);

  const mainBanner = heroBanners.length > 0 ? heroBanners[0] : null;

  if (loading) {
    return (
      <div className="container space-y-4 py-6">
        <Skeleton className="aspect-[16/6] w-full rounded-3xl lg:aspect-[16/5]" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="aspect-video w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const adBannerGridClass =
    adBanners.length === 1
      ? 'md:grid-cols-1'
      : adBanners.length === 2
        ? 'md:grid-cols-2'
        : 'md:grid-cols-3';

  return (
    <section className="hero-mesh">
      <div className="container space-y-4 py-8">
        {mainBanner && (
          <div className="grid gap-4 lg:grid-cols-12">
            <Link href={mainBanner.linkUrl} className="lg:col-span-8">
              <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-3xl md:aspect-[16/6]">
                <BannerDisplay banner={mainBanner} isMain={true} />
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/25 to-transparent p-6 md:p-8">
                  <span className="mb-auto inline-flex w-fit items-center rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
                    Nouveauté
                  </span>
                  <h2 className="text-balance font-headline text-2xl font-extrabold text-white drop-shadow-lg md:text-4xl">
                    {mainBanner.title}
                  </h2>
                  {mainBanner.subtitle && (
                    <p className="mt-2 max-w-lg text-base text-white/90 drop-shadow-md md:text-lg">
                      {mainBanner.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </Link>

            {/* Editorial side panel */}
            <div className="flex flex-col gap-4 lg:col-span-4">
              <div className="card-premium flex flex-1 flex-col justify-center gap-4 p-6 md:p-8">
                <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                  Teranga Premium
                </span>
                <h3 className="font-headline text-xl font-extrabold leading-tight text-balance">
                  L&apos;électronique de confiance, livrée à Dakar.
                </h3>
                <p className="text-sm text-muted-foreground">
                  Des produits authentiques, un service local, des prix justes.
                </p>
                <Link
                  href="/products"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Découvrir la boutique
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {trustItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-card p-3 text-center"
                  >
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {announcementBanners.length > 0 && (
          <div className="overflow-hidden rounded-2xl">
            <ClientOnly>
              <Carousel opts={{ loop: true, align: 'start' }} plugins={[Autoplay({ delay: 5000 })]}>
                <CarouselContent>
                  {announcementBanners.map((banner) => (
                    <CarouselItem key={banner.id} className="md:basis-1/2 lg:basis-1/3">
                      <Link href={banner.linkUrl} className="group block p-1">
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                          <Image
                            src={banner.images[0].imageUrl}
                            alt={banner.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 p-2 text-center">
                            <h3 className="font-headline font-bold text-white drop-shadow-md">
                              {banner.title}
                            </h3>
                            {banner.subtitle && (
                              <p className="mt-1 text-xs text-white/80">{banner.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </ClientOnly>
          </div>
        )}

        {adBanners.length > 0 && (
          <div className={`grid grid-cols-1 gap-4 ${adBannerGridClass}`}>
            {adBanners.map((banner) => (
              <Link href={banner.linkUrl} key={banner.id}>
                <div className="group relative aspect-video w-full overflow-hidden rounded-2xl">
                  <BannerDisplay banner={banner} />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="font-headline text-xl font-bold text-white drop-shadow-md">
                      {banner.title}
                    </h3>
                    {banner.subtitle && (
                      <p className="mt-1 text-sm text-white/90 drop-shadow-md">{banner.subtitle}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
