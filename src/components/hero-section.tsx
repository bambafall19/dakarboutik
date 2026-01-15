
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useBanners } from '@/hooks/use-site-data';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

function BannerSkeleton({ className }: { className?: string }) {
    return <Skeleton className={cn("w-full h-full", className)} />;
}


export function HeroSection() {
    const { banners, loading } = useBanners();
  
    const mainBanner = banners.find((b) => b.id === 'banner1');
    const topSubBanner = banners.find((b) => b.id === 'banner-laptops');
    const bottomSubBanner = banners.find((b) => b.id === 'banner-accessories');
  
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[30rem]">
            <BannerSkeleton />
            <div className="hidden md:grid grid-rows-2 gap-4">
                <BannerSkeleton />
                <BannerSkeleton />
            </div>
        </div>
      );
    }

    if (!mainBanner) {
        return null;
    }
  
    return (
        <div className="w-full mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 h-auto md:h-[calc(100vh-20rem)] max-h-[700px]">
                {/* Main Banner */}
                <div className="relative rounded-lg overflow-hidden h-64 md:h-full group">
                    <Link href={mainBanner.linkUrl}>
                        <Image 
                            src={mainBanner.image.imageUrl} 
                            alt={mainBanner.title}
                            data-ai-hint={mainBanner.image.imageHint}
                            fill 
                            className="object-contain bg-muted p-8"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-8 flex flex-col justify-end">
                            <h2 className="text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">{mainBanner.title}</h2>
                            {mainBanner.subtitle && <p className="mt-2 text-white/90 text-lg drop-shadow-md">{mainBanner.subtitle}</p>}
                            <Button className="mt-4 w-fit" size="lg">
                                Voir la collection <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </Link>
                </div>

                {/* Sub Banners */}
                <div className="grid grid-rows-1 md:grid-rows-2 gap-4 md:gap-6 h-auto">
                    {topSubBanner && (
                        <div className="relative rounded-lg overflow-hidden h-64 md:h-full group">
                             <Link href={topSubBanner.linkUrl}>
                                <Image 
                                    src={topSubBanner.image.imageUrl} 
                                    alt={topSubBanner.title}
                                    data-ai-hint={topSubBanner.image.imageHint}
                                    fill 
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                                    <h3 className="text-2xl font-bold text-white drop-shadow-md">{topSubBanner.title}</h3>
                                    {topSubBanner.subtitle && <p className="mt-1 text-white/90 drop-shadow-md">{topSubBanner.subtitle}</p>}
                                </div>
                            </Link>
                        </div>
                    )}
                     {bottomSubBanner && (
                        <div className="relative rounded-lg overflow-hidden h-64 md:h-full group">
                             <Link href={bottomSubBanner.linkUrl}>
                                <Image 
                                    src={bottomSubBanner.image.imageUrl} 
                                    alt={bottomSubBanner.title}
                                    data-ai-hint={bottomSubBanner.image.imageHint}
                                    fill 
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                                    <h3 className="text-2xl font-bold text-white drop-shadow-md">{bottomSubBanner.title}</h3>
                                    {bottomSubBanner.subtitle && <p className="mt-1 text-white/90 drop-shadow-md">{bottomSubBanner.subtitle}</p>}
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
      </div>
    );
}
