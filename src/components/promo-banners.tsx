
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import type { Banner } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface PromoBannersProps {
    banners: Banner[];
    loading?: boolean;
}

const PromoBanner = ({ banner }: { banner: Banner }) => (
    <div className="relative group rounded-lg overflow-hidden">
        <Link href={banner.linkUrl}>
            <div className='aspect-video relative'>
                <Image
                    src={banner.image.imageUrl}
                    alt={banner.title}
                    data-ai-hint={banner.image.imageHint}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <div className="absolute inset-0 bg-black/30 p-8 flex flex-col justify-end">
                {banner.subtitle && <p className="text-white font-semibold">{banner.subtitle}</p>}
                <h3 className="text-3xl font-bold text-white mt-2">{banner.title}</h3>
            </div>
       </Link>
    </div>
);


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
        {promoBanners.map(banner => <PromoBanner key={banner.id} banner={banner} />)}
      </div>
    </div>
  );
}
