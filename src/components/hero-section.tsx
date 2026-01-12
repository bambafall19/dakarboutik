
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useBanners } from '@/hooks/use-site-data';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function HeroSection() {
  const { banners, loading } = useBanners();
  const mainBanner = banners.find(b => b.id === 'banner1');

  if (loading) {
    return (
      <section className="w-full bg-secondary/50">
        <div className="container py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
                <div className="space-y-4 text-center md:text-left">
                    <Skeleton className="h-12 w-3/4 mx-auto md:mx-0" />
                    <Skeleton className="h-6 w-full max-w-md mx-auto md:mx-0" />
                    <Skeleton className="h-12 w-48 mt-6 mx-auto md:mx-0" />
                </div>
                <Skeleton className="aspect-square w-full rounded-lg" />
            </div>
        </div>
      </section>
    )
  }

  if (!mainBanner) {
    return null; // Or a placeholder
  }

  return (
    <section className="w-full bg-secondary/50">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            <div className="space-y-4 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                {mainBanner.title}
              </h1>
              {mainBanner.subtitle && (
                <p className="max-w-xl text-base md:text-lg text-muted-foreground mx-auto md:mx-0">
                  {mainBanner.subtitle}
                </p>
              )}
              <Button asChild className="mt-6" size="lg">
                <Link href={mainBanner.linkUrl}>Explorer les produits</Link>
              </Button>
            </div>
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="relative aspect-square w-full">
                        <Image
                        src={mainBanner.image.imageUrl}
                        alt={mainBanner.title}
                        data-ai-hint={mainBanner.image.imageHint}
                        fill
                        priority
                        className="object-cover"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </section>
  );
}
