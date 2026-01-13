
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useBanners } from '@/hooks/use-site-data';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { findImage } from '@/lib/placeholder-images';

export function HeroSection() {
  const { banners, loading } = useBanners();
  
  if (loading) {
    return (
      <section className="w-full container py-8">
          <Skeleton className="aspect-video md:aspect-[2/1] lg:aspect-[16/7] w-full" />
      </section>
    );
  }

  const mainBanner = findImage('banner-headphones');
  const topSubBanner = findImage('banner-laptops');
  const bottomSubBanner = findImage('banner-accessories');

  return (
    <section className="w-full container py-2 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-auto md:h-[480px]">
            {/* Main Banner */}
            <div className="lg:col-span-2 h-[300px] md:h-full relative rounded-lg overflow-hidden group">
                <Link href={mainBanner.imageUrl ? '/products?category=audio' : '#'} className="block h-full">
                    <Image
                        src={mainBanner.imageUrl}
                        alt={mainBanner.description}
                        data-ai-hint={mainBanner.imageHint}
                        fill
                        priority
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/10" />
                    <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight max-w-md">
                            Le son immersif à votre portée
                        </h1>
                        <p className="mt-2 text-white/90 max-w-md">
                            Explorez notre sélection de casques et écouteurs.
                        </p>
                        <Button className="mt-6 w-fit" size="lg">
                            Découvrir <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </Link>
            </div>

            {/* Sub Banners */}
            <div className="flex flex-col gap-4 md:gap-6 h-full">
                <div className="h-[150px] md:h-full flex-1 relative rounded-lg overflow-hidden group">
                     <Link href={topSubBanner.imageUrl ? '/products?category=informatique' : '#'} className="block h-full">
                        <Image
                            src={topSubBanner.imageUrl}
                            alt={topSubBanner.description}
                            data-ai-hint={topSubBanner.imageHint}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                         <div className="absolute inset-0 bg-black/50" />
                         <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                            <h2 className="text-lg md:text-xl font-bold">PC Portables</h2>
                            <p className="text-xs md:text-sm text-white/80 mt-1">Puissance et mobilité</p>
                         </div>
                    </Link>
                </div>
                <div className="h-[150px] md:h-full flex-1 relative rounded-lg overflow-hidden group">
                    <Link href={bottomSubBanner.imageUrl ? '/products?category=accessoires' : '#'} className="block h-full">
                        <Image
                            src={bottomSubBanner.imageUrl}
                            alt={bottomSubBanner.description}
                            data-ai-hint={bottomSubBanner.imageHint}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50" />
                        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                            <h2 className="text-lg md:text-xl font-bold">Accessoires</h2>
                             <p className="text-xs md:text-sm text-white/80 mt-1">Tout pour vos appareils</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    </section>
  );
}

