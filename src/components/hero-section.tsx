
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
      <section className="w-full">
        <div className="container px-0 md:px-8">
            <Skeleton className="aspect-video md:aspect-[16/6] w-full md:rounded-lg" />
        </div>
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
                    <div className="container relative aspect-video md:aspect-[16/7] lg:aspect-[16/6] p-0 md:rounded-lg overflow-hidden px-0 md:px-8">
                         <div className="relative w-full h-full">
                            <Image
                                src={banner.image.imageUrl}
                                alt={banner.title}
                                data-ai-hint={banner.image.imageHint}
                                fill
                                priority
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
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
                    </div>
                 </CarouselItem>
            ))}
        </CarouselContent>
         <div className="hidden md:block">
            <CarouselPrevious className="left-12" />
            <CarouselNext className="right-12" />
        </div>
      </Carousel>
    </section>
  );
}
