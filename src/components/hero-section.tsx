
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import type { Banner } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from './ui/carousel';
import Autoplay from "embla-carousel-autoplay";
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


const BannerDisplay = ({ banner, isMain }: { banner: Banner, isMain?: boolean }) => {
    if (!banner.images || banner.images.length === 0) return null;

    if (banner.images.length > 1) {
        return (
            <ClientOnly>
                <Carousel 
                    opts={{ loop: true }}
                    plugins={[Autoplay({delay: 4000 })]}
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
                                        sizes="100vw"
                                        className="object-cover"
                                        priority={isMain && index === 0}
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </ClientOnly>
        );
    }
    
    // Single image
    const image = banner.images[0];
    return (
        <div className="relative w-full h-full">
            <Image 
                src={image.imageUrl} 
                alt={banner.title}
                data-ai-hint={image.imageHint}
                fill 
                sizes="100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={isMain}
            />
        </div>
    );
};


interface HeroSectionProps {
    banners: Banner[];
    loading: boolean;
}

export function HeroSection({ banners, loading }: HeroSectionProps) {
    const heroBanners = banners.filter(b => b.position === 'hero' && b.isActive).sort((a,b) => a.order - b.order);
    const adBanners = banners.filter(b => b.position === 'ad' && b.isActive).sort((a,b) => a.order - b.order);
    const announcementBanners = banners.filter(b => b.position === 'announcement' && b.isActive).sort((a,b) => a.order - b.order);

    const mainBanner = heroBanners.length > 0 ? heroBanners[0] : null;


    if (loading) {
        return (
             <div className="container py-6 space-y-4">
                <Skeleton className="w-full aspect-[16/6] lg:aspect-[16/5] rounded-lg" />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="w-full aspect-video rounded-lg" />
                    <Skeleton className="w-full aspect-video rounded-lg" />
                    <Skeleton className="w-full aspect-video rounded-lg" />
                </div>
            </div>
        )
    }

    return (
        <section className="bg-muted/30">
            <div className="container py-6 space-y-4">
                {mainBanner && (
                     <Link href={mainBanner.linkUrl}>
                        <div className="relative rounded-lg overflow-hidden w-full aspect-[16/8] md:aspect-[16/6] lg:aspect-[16/5] group">
                            <BannerDisplay banner={mainBanner} isMain={true} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 md:p-12 flex flex-col justify-end pointer-events-none">
                                <h2 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">{mainBanner.title}</h2>
                                {mainBanner.subtitle && <p className="text-lg text-white/90 mt-2 max-w-lg drop-shadow-md">{mainBanner.subtitle}</p>}
                            </div>
                        </div>
                     </Link>
                )}
                 {announcementBanners.length > 0 && (
                    <div className="rounded-lg overflow-hidden">
                       <ClientOnly>
                         <Carousel 
                            opts={{ loop: true, align: 'start' }}
                            plugins={[Autoplay({delay: 5000})]}
                        >
                        <CarouselContent>
                            {announcementBanners.map((banner) => (
                                <CarouselItem key={banner.id} className="md:basis-1/2 lg:basis-1/3">
                                    <Link href={banner.linkUrl} className="block p-1">
                                        <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                                            <Image 
                                                src={banner.images[0].imageUrl}
                                                alt={banner.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                        </div>
                                    </Link>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        </Carousel>
                       </ClientOnly>
                    </div>
                 )}
                  {adBanners.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {adBanners.map(banner => (
                             <Link href={banner.linkUrl} key={banner.id}>
                                <div className="relative rounded-lg overflow-hidden w-full aspect-video group">
                                    <BannerDisplay banner={banner} />
                                </div>
                            </Link>
                         ))}
                     </div>
                 )}
            </div>
        </section>
    );
}
