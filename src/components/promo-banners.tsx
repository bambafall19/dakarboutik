
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
        <div className="relative group overflow-hidden rounded-3xl aspect-video ring-1 ring-border/60 shadow-sm transition-shadow duration-300 hover:shadow-[0_24px_50px_-24px_rgba(11,110,79,0.4)]">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-6 flex flex-col justify-end pointer-events-none md:p-8">
                {banner.subtitle && <span className="w-fit rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">{banner.subtitle}</span>}
                <h3 className="font-headline text-2xl font-extrabold text-white mt-3 md:text-4xl">{banner.title}</h3>
                <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm ring-1 ring-white/20 transition group-hover:bg-white/25">
                    Découvrir
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
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
