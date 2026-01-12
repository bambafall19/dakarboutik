
import Image from 'next/image';
import Link from 'next/link';
import { getBanners } from '@/lib/data';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function HeroSection() {
  const banners = getBanners();
  const mainBanner = banners[0];

  return (
    <section className="w-full bg-secondary/50">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            <div className="space-y-4 text-center md:text-left">
              <p className="font-bold text-primary uppercase tracking-wider">#Big Fashion Sale</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                {mainBanner.title}
              </h1>
              {mainBanner.subtitle && (
                <p className="max-w-xl text-base md:text-lg text-muted-foreground mx-auto md:mx-0">
                  {mainBanner.subtitle}
                </p>
              )}
              <Button asChild className="mt-6" size="lg">
                <Link href={mainBanner.linkUrl}>Acheter maintenant</Link>
              </Button>
            </div>
            <div className="relative aspect-square w-full">
            <Image
              src={mainBanner.image.imageUrl}
              alt={mainBanner.title}
              data-ai-hint={mainBanner.image.imageHint}
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
