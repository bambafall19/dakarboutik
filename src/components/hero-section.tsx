
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useBanners } from '@/hooks/use-site-data';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export function HeroSection() {
  const { banners, loading } = useBanners();
  
  if (loading) {
    return (
      <section className="w-full px-4 md:px-0">
        <Skeleton className="aspect-video md:aspect-[16/6] w-full rounded-lg" />
      </section>
    );
  }

  if (!banners || banners.length === 0) {
    return null; // Or a placeholder
  }

  return (
    <section className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
            {banners.map((banner) => (
                 <CarouselItem key={banner.id}>
                    <div className="container relative aspect-video md:aspect-[16/7] lg:aspect-[16/6] p-0">
                        <Image
                            src={banner.image.imageUrl}
                            alt={banner.title}
                            data-ai-hint={banner.image.imageHint}
                            fill
                            priority
                            className="object-cover md:rounded-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent md:rounded-lg" />
                        <div className="absolute inset-0 flex flex-col items-start justify-center text-white p-6 md:p-12 lg:p-16 w-full sm:w-4/5 md:w-3/5">
                            <p className="text-base md:text-lg lg:text-xl drop-shadow-md font-medium">
                                {banner.subtitle}
                            </p>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight drop-shadow-lg mt-2">
                            {banner.title}
                        </h1>
                        
                        <Button asChild className="mt-6 md:mt-8" size="lg">
                            <Link href={banner.linkUrl}>Découvrir</Link>
                        </Button>
                        </div>
                    </div>
                 </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 hidden md:flex" />
        <CarouselNext className="right-4 hidden md:flex" />
      </Carousel>
    </section>
  );
}
