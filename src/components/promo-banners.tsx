
'use client';

import { useBanners } from '@/hooks/use-site-data';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

export function PromoBanners() {
  const { banners, loading } = useBanners();

  const promoBanner1 = banners.find(b => b.id === 'promo-banner-1');
  const promoBanner2 = banners.find(b => b.id === 'promo-banner-2');

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!promoBanner1 || !promoBanner2) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="relative rounded-lg overflow-hidden group">
        <Link href={promoBanner1.linkUrl}>
          <Image
            src={promoBanner1.image.imageUrl}
            alt={promoBanner1.title}
            data-ai-hint={promoBanner1.image.imageHint}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
            <h3 className="text-xl font-bold">{promoBanner1.title}</h3>
            {promoBanner1.subtitle && <p className="text-sm mt-1">{promoBanner1.subtitle}</p>}
            <Button variant="secondary" className="mt-4 w-fit">
                Voir l'offre <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Link>
      </div>
       <div className="relative rounded-lg overflow-hidden group">
        <Link href={promoBanner2.linkUrl}>
          <Image
            src={promoBanner2.image.imageUrl}
            alt={promoBanner2.title}
            data-ai-hint={promoBanner2.image.imageHint}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
            <h3 className="text-xl font-bold">{promoBanner2.title}</h3>
            {promoBanner2.subtitle && <p className="text-sm mt-1">{promoBanner2.subtitle}</p>}
            <Button variant="secondary" className="mt-4 w-fit">
                Voir l'offre <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
}
