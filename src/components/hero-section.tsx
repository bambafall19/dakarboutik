
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useBanners } from '@/hooks/use-site-data';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function HeroSection() {
  const { banners, loading } = useBanners();
  const mainBanner = banners.find(b => b.id === 'banner1');

  if (loading) {
    return (
      <section className="w-full">
        <div className="container px-0">
          <Skeleton className="aspect-video w-full" />
        </div>
      </section>
    );
  }

  if (!mainBanner) {
    return null; // Or a placeholder
  }

  return (
    <section className="w-full">
      <div className="container relative aspect-video">
        <Image
          src={mainBanner.image.imageUrl}
          alt={mainBanner.title}
          data-ai-hint={mainBanner.image.imageHint}
          fill
          priority
          className="object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black/40 rounded-lg" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight drop-shadow-lg">
            {mainBanner.title}
          </h1>
          {mainBanner.subtitle && (
            <p className="max-w-2xl mt-4 text-base md:text-lg text-neutral-200 drop-shadow-md">
              {mainBanner.subtitle}
            </p>
          )}
          <Button asChild className="mt-6" size="lg">
            <Link href={mainBanner.linkUrl}>Explorer les produits</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
