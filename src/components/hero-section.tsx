
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import type { Banner } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel';
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
    const announcementBanners = [
        banners.find(b => b.id === 'announcement-1'),
        banners.find(b => b.id === 'announcement-2'),
        banners.find(b => b.id === 'announcement-3'),
    ].filter(Boolean) as Banner[];

    if (loading) {
        return (
             <div className="container py-6">
                <Skeleton className="w-full aspect-[16/6] lg:aspect-[16/5] rounded-lg" />
            </div>
        )
    }

    return (
        <section className="bg-muted/30">
            <div className="container py-6 space-y-4">
                {mainBanner && (
                    <div className="relative rounded-lg overflow-hidden w-full aspect-[16/8] md:aspect-[16/6] lg:aspect-[16/5] group">
                        <BannerDisplay banner={mainBanner} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 md:p-12 flex flex-col justify-end pointer-events-none">
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">{mainBanner.title}</h2>
                            {mainBanner.subtitle && <p className="text-lg text-white/90 mt-2 max-w-lg drop-shadow-md">{mainBanner.subtitle}</p>}
                        </div>
                    </div>
                )}
                 {announcementBanners.length > 0 && (
                    <div className="rounded-lg overflow-hidden">
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
