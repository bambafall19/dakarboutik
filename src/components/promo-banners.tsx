
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


// This wrapper ensures the component only renders on the client side.
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


const PromoBanner = ({ banner }: { banner: Banner }) => {
    
    if (!banner.images || banner.images.length === 0) return null;
    
    return (
        <div className="relative group rounded-lg overflow-hidden aspect-video">
             {banner.images.length > 1 ? (
                <ClientOnly>
                    <Carousel 
                        opts={{ loop: true }} 
                        plugins={[Autoplay({delay: 5000})]}
                        className="w-full h-full"
                    >
                        <CarouselContent>
                            {banner.images.map((image, index) => (
                                <CarouselItem key={index}>
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={image.imageUrl}
                                            alt={banner.title}
                                            data-ai-hint={image.imageHint}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </ClientOnly>
            ) : (
                 <div className="relative w-full h-full">
                    <Image
                        src={banner.images[0].imageUrl}
                        alt={banner.title}
                        data-ai-hint={banner.images[0].imageHint}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
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

    const promoBanners = banners.filter(b => b.position === 'promo' && b.isActive).sort((a,b) => a.order - b.order);

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
        {promoBanners.map(banner => banner && (
            <Link href={banner.linkUrl} key={banner.id}>
                <PromoBanner banner={banner} />
            </Link>
        ))}
      </div>
    </div>
  );
}
