
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import type { Banner } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from './ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React from 'react';

const PromoBanner = ({ banner }: { banner: Banner }) => {
    const [api, setApi] = React.useState<CarouselApi>()
 
    React.useEffect(() => {
        if (!api) return;
        // This is a workaround to force the carousel to re-render after hydration
        // to fix a bug where it doesn't have the correct size.
        setTimeout(() => api.reInit(), 0);
    }, [api])

    if (!banner.images || banner.images.length === 0) return null;
    
    return (
        <div className="relative group rounded-lg overflow-hidden aspect-video">
             {banner.images.length > 1 ? (
                <Carousel 
                    opts={{ loop: true }} 
                    plugins={[Autoplay({delay: 5000})]}
                    className="w-full h-full"
                    setApi={setApi}
                >
                    <CarouselContent>
                        {banner.images.map((image, index) => (
                             <CarouselItem key={index}>
                                <Link href={banner.linkUrl} className="block w-full h-full">
                                    <Image
                                        src={image.imageUrl}
                                        alt={banner.title}
                                        data-ai-hint={image.imageHint}
                                        fill
                                        className="object-cover"
                                    />
                                </Link>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            ) : (
                 <Link href={banner.linkUrl} className="block w-full h-full">
                    <Image
                        src={banner.images[0].imageUrl}
                        alt={banner.title}
                        data-ai-hint={banner.images[0].imageHint}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </Link>
            )}
            <div className="absolute inset-0 bg-black/30 p-8 flex flex-col justify-end pointer-events-none">
                {banner.subtitle && <p className="text-white font-semibold">{banner.subtitle}</p>}
                <h3 className="text-3xl font-bold text-white mt-2">{banner.title}</h3>
            </div>
        </div>
    )
};


interface PromoBannersProps {
    banners: Banner[];
    loading?: boolean;
}

export function PromoBanners({ banners, loading }: PromoBannersProps) {

    const promoBanner1 = banners.find(b => b.id === 'promo-banner-1');
    const promoBanner2 = banners.find(b => b.id === 'promo-banner-2');
    
    const promoBanners = [promoBanner1, promoBanner2].filter(Boolean) as Banner[];

    if (loading) {
        return (
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Skeleton className="aspect-video" />
                    <Skeleton className="aspect-video" />
                </div>
            </div>
        )
    }
  
    if (promoBanners.length === 0) {
        return null;
    }

  return (
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {promoBanners.map(banner => banner && <PromoBanner key={banner.id} banner={banner} />)}
      </div>
    </div>
  );
}
