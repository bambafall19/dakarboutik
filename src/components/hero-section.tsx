
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useBanners } from '@/hooks/use-site-data';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

export function HeroSection() {
  const { banners, loading } = useBanners();
  
  if (loading) {
    return (
      <section className="w-full">
        <div className="container py-8">
            <Skeleton className="aspect-video md:aspect-[2/1] lg:aspect-[3/1] w-full" />
        </div>
      </section>
    );
  }

  const heroBanner = banners.find(b => b.id === 'banner-headphones');
  if (!heroBanner) {
    return null;
  }

  return (
    <section className="w-full">
        <div className="relative aspect-video md:aspect-[2.5/1] lg:aspect-[3/1] bg-muted">
            <Image
                src={heroBanner.image.imageUrl}
                alt={heroBanner.title}
                data-ai-hint={heroBanner.image.imageHint}
                fill
                priority
                className="object-cover"
            />
             <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
            <div className="absolute inset-0 flex items-center">
                <div className="container">
                    <div className="max-w-xl text-white">
                         <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                            {heroBanner.title}
                        </h1>
                        <p className="mt-4 text-base md:text-lg text-white/90">
                            {heroBanner.subtitle}
                        </p>
                        <Button asChild className="mt-6 md:mt-8" size="lg">
                            <Link href={heroBanner.linkUrl}>Acheter maintenant</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
