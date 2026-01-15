
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useBanners } from '@/hooks/use-site-data';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";


export function HeroSection() {
    const { banners, loading } = useBanners();
  
    const mainBanner = banners.find((b) => b.id === 'banner1');
  
    if (loading) {
      return (
        <div className="container">
            <Skeleton className="w-full aspect-[16/7]" />
        </div>
      );
    }

    if (!mainBanner) {
        return null;
    }
  
    return (
        <div className="container">
            <Carousel
                plugins={[Autoplay({ delay: 5000 })]}
                opts={{ loop: true }}
            >
                <CarouselContent>
                    <CarouselItem>
                         <div className="relative rounded-lg overflow-hidden w-full aspect-[16/7] bg-secondary">
                            <Image 
                                src={mainBanner.image.imageUrl} 
                                alt={mainBanner.title}
                                data-ai-hint={mainBanner.image.imageHint}
                                fill 
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center items-start text-left">
                                <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg max-w-2xl">{mainBanner.title}</h2>
                                {mainBanner.subtitle && <p className="mt-4 text-white/90 text-lg drop-shadow-md max-w-xl">{mainBanner.subtitle}</p>}
                                <Button asChild className="mt-6" size="lg">
                                  <Link href={mainBanner.linkUrl}>
                                    Découvrir
                                  </Link>
                                </Button>
                            </div>
                        </div>
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
            </Carousel>
      </div>
    );
}
