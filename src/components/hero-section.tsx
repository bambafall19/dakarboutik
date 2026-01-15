
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import type { Banner } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import Autoplay from "embla-carousel-autoplay";


const BannerDisplay = ({ banner }: { banner: Banner }) => {
    if (!banner.images || banner.images.length === 0) return null;

    if (banner.images.length > 1) {
        return (
            <Carousel 
                opts={{ loop: true }}
                plugins={[Autoplay({delay: 4000, stopOnInteraction: false })]}
                className="w-full h-full"
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
                                    priority={index === 0}
                                />
                            </Link>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        );
    }
    
    // Single image
    const image = banner.images[0];
    return (
        <Link href={banner.linkUrl} className="block w-full h-full">
            <Image 
                src={image.imageUrl} 
                alt={banner.title}
                data-ai-hint={image.imageHint}
                fill 
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
            />
        </Link>
    );
};


interface HeroSectionProps {
    banners: Banner[];
    loading: boolean;
}

export function HeroSection({ banners, loading }: HeroSectionProps) {
    const mainBanner = banners.find(b => b.id === 'banner1');
    const topSubBanner = banners.find(b => b.id === 'banner-laptops');
    const bottomSubBanner = banners.find(b => b.id === 'banner-accessories');
    const announcementBanners = [
        banners.find(b => b.id === 'announcement-1'),
        banners.find(b => b.id === 'announcement-2'),
        banners.find(b => b.id === 'announcement-3'),
    ].filter(Boolean) as Banner[];

    if (loading) {
        return (
             <div className="container py-6 grid grid-cols-1 lg:grid-cols-3 gap-4 h-[500px]">
                <Skeleton className="lg:col-span-2 h-full" />
                <div className="hidden lg:flex flex-col gap-4 h-full">
                    <Skeleton className="h-1/2" />
                    <Skeleton className="h-1/2" />
                </div>
            </div>
        )
    }

    return (
        <section className="bg-muted/30">
            <div className="container py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto lg:h-[500px]">
                    {mainBanner && (
                         <div className="relative rounded-lg overflow-hidden w-full h-[300px] lg:h-full lg:col-span-2 group">
                            <BannerDisplay banner={mainBanner} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-8 flex flex-col justify-end pointer-events-none">
                                <h2 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">{mainBanner.title}</h2>
                                {mainBanner.subtitle && <p className="text-lg text-white/90 mt-2 max-w-lg drop-shadow-md">{mainBanner.subtitle}</p>}
                            </div>
                        </div>
                    )}
                   
                    <div className="hidden lg:flex flex-col gap-4">
                        {topSubBanner && (
                            <div className="relative rounded-lg overflow-hidden w-full h-1/2 group">
                                <BannerDisplay banner={topSubBanner} />
                                <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-center pointer-events-none">
                                    <h3 className="text-2xl font-bold text-white drop-shadow-md">{topSubBanner.title}</h3>
                                    {topSubBanner.subtitle && <p className="text-md text-white/90 mt-1 drop-shadow-md">{topSubBanner.subtitle}</p>}
                                </div>
                            </div>
                        )}
                         {bottomSubBanner && (
                            <div className="relative rounded-lg overflow-hidden w-full h-1/2 group">
                                <BannerDisplay banner={bottomSubBanner} />
                                <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-center pointer-events-none">
                                    <h3 className="text-2xl font-bold text-white drop-shadow-md">{bottomSubBanner.title}</h3>
                                    {bottomSubBanner.subtitle && <p className="text-md text-white/90 mt-1 drop-shadow-md">{bottomSubBanner.subtitle}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                 {announcementBanners.length > 0 && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                        <Carousel 
                            opts={{ loop: true }}
                            plugins={[Autoplay({delay: 5000})]}
                        >
                        <CarouselContent>
                            {announcementBanners.map((banner) => (
                                <CarouselItem key={banner.id}>
                                    <Link href={banner.linkUrl}>
                                        <div className="relative aspect-[16/2] md:aspect-[16/1] w-full">
                                            <Image 
                                                src={banner.images[0].imageUrl}
                                                alt={banner.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </Link>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        </Carousel>
                    </div>
                 )}
            </div>
        </section>
    );
}
