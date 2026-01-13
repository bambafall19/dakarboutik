
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useBanners } from '@/hooks/use-site-data';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

export function HeroSection() {
  const { banners, loading } = useBanners();
  
  if (loading) {
    return (
      <section className="w-full">
        <div className="container py-8">
            <Skeleton className="aspect-video md:aspect-[2/1] lg:aspect-[2.5/1] w-full rounded-lg" />
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
        <div className="container py-6 md:py-10">
            <div className="bg-[#F3EFEA] rounded-lg p-6 md:p-0 md:pr-6 grid grid-cols-1 md:grid-cols-2 items-center gap-6">
                <div className="text-center md:text-left md:pl-12 lg:pl-20">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground/90">
                        {heroBanner.title}
                    </h1>
                    <p className="mt-4 text-base md:text-lg text-muted-foreground">
                        {heroBanner.subtitle}
                    </p>
                    <Button asChild className="mt-6 md:mt-8" size="lg">
                        <Link href={heroBanner.linkUrl}>Acheter maintenant</Link>
                    </Button>
                </div>
                 <div className="relative aspect-square md:aspect-auto md:h-[450px]">
                    <Image
                        src={heroBanner.image.imageUrl}
                        alt={heroBanner.title}
                        data-ai-hint={heroBanner.image.imageHint}
                        fill
                        priority
                        className="object-contain"
                    />
                </div>
            </div>
        </div>
    </section>
  );
}
