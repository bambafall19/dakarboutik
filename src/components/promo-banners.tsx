
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import type { Banner } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface PromoBannersProps {
    banners: Banner[];
}

export function PromoBanners({ banners }: PromoBannersProps) {

    const promoBanner1 = banners.find(b => b.id === 'promo-banner-1');
    const promoBanner2 = banners.find(b => b.id === 'promo-banner-2');

    if (!promoBanner1 || !promoBanner2) {
        return (
            <div className="container grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="aspect-video" />
                <Skeleton className="aspect-video" />
            </div>
        )
    }
  
  return (
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative group rounded-lg overflow-hidden">
            <Link href={promoBanner1.linkUrl}>
                <div className='aspect-video relative'>
                    <Image
                        src={promoBanner1.image.imageUrl}
                        alt={promoBanner1.title}
                        data-ai-hint={promoBanner1.image.imageHint}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
                <div className="absolute inset-0 bg-black/30 p-8 flex flex-col justify-end">
                    {promoBanner1.subtitle && <p className="text-white font-semibold">{promoBanner1.subtitle}</p>}
                    <h3 className="text-3xl font-bold text-white mt-2">{promoBanner1.title}</h3>
                </div>
           </Link>
        </div>
         <div className="relative group rounded-lg overflow-hidden">
            <Link href={promoBanner2.linkUrl}>
                <div className='aspect-video relative'>
                    <Image
                        src={promoBanner2.image.imageUrl}
                        alt={promoBanner2.title}
                        data-ai-hint={promoBanner2.image.imageHint}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
                <div className="absolute inset-0 bg-black/30 p-8 flex flex-col justify-end">
                    {promoBanner2.subtitle && <p className="text-white font-semibold">{promoBanner2.subtitle}</p>}
                    <h3 className="text-3xl font-bold text-white mt-2">{promoBanner2.title}</h3>
                </div>
           </Link>
        </div>
      </div>
    </div>
  );
}
