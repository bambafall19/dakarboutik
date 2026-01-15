
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useBanners } from '@/hooks/use-site-data';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  const { banners, loading } = useBanners();
  
  if (loading) {
    return (
      <section className="w-full py-2 md:py-8">
        <div className="container">
          <Skeleton className="h-[300px] md:h-[480px] w-full" />
        </div>
      </section>
    );
  }

  // Find the main banner, top sub-banner, and bottom sub-banner from the dynamic data
  const mainBanner = banners.find(b => b.id === 'banner1');
  const topSubBanner = banners.find(b => b.id === 'banner-laptops');
  const bottomSubBanner = banners.find(b => b.id === 'banner-accessories');

  return (
    <section className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-auto md:h-[480px]">
            {/* Main Banner */}
            {mainBanner && (
                <div className="lg:col-span-2 h-[300px] md:h-full relative group bg-secondary/30">
                    <Link href={mainBanner.linkUrl} className="block h-full">
                        <Image
                            src={mainBanner.image.imageUrl}
                            alt={mainBanner.image.description}
                            data-ai-hint={mainBanner.image.imageHint}
                            fill
                            priority
                            className="object-contain transition-transform duration-300 group-hover:scale-105 p-4"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
                    </Link>
                </div>
            )}

            {/* Sub Banners */}
            <div className="flex flex-col gap-0 h-full">
                {topSubBanner && (
                    <div className="h-[150px] md:h-full flex-1 relative group">
                        <Link href={topSubBanner.linkUrl} className="block h-full">
                            <Image
                                src={topSubBanner.image.imageUrl}
                                alt={topSubBanner.image.description}
                                data-ai-hint={topSubBanner.image.imageHint}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/50" />
                            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                                <h2 className="text-lg md:text-xl font-bold">{topSubBanner.title}</h2>
                                {topSubBanner.subtitle && <p className="text-xs md:text-sm text-white/80 mt-1">{topSubBanner.subtitle}</p>}
                            </div>
                        </Link>
                    </div>
                )}
                {bottomSubBanner && (
                    <div className="h-[150px] md:h-full flex-1 relative group">
                        <Link href={bottomSubBanner.linkUrl} className="block h-full">
                            <Image
                                src={bottomSubBanner.image.imageUrl}
                                alt={bottomSubBanner.image.description}
                                data-ai-hint={bottomSubBanner.image.imageHint}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/50" />
                            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                                <h2 className="text-lg md:text-xl font-bold">{bottomSubBanner.title}</h2>
                                {bottomSubBanner.subtitle && <p className="text-xs md:text-sm text-white/80 mt-1">{bottomSubBanner.subtitle}</p>}
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    </section>
  );
}
