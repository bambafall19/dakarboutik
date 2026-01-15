
'use client';

import { HeroSection } from '@/components/hero-section';
import { ProductGrid } from '@/components/product-grid';
import { useProducts, useCategories, useBanners } from '@/hooks/use-site-data';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { FeaturedCategories } from '@/components/featured-categories';
import { Engagements } from '@/components/engagements';
import type { Product } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Icons } from '@/components/icons';
import { ProductCard } from '@/components/product-card';
import { Zap, ArrowRight, TrendingUp } from 'lucide-react';


const PromoBanners = () => {
  const { banners, loading } = useBanners();
  const promoBanner1 = banners.find(b => b.id === 'promo-banner-1');
  const promoBanner2 = banners.find(b => b.id === 'promo-banner-2');

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-[2/1] w-full" />
        <Skeleton className="aspect-[2/1] w-full" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {promoBanner1 && (
        <Link href={promoBanner1.linkUrl} className="block relative rounded-lg overflow-hidden group">
          <Image src={promoBanner1.image.imageUrl} alt={promoBanner1.title} width={600} height={300} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-6 left-6 text-white">
            <h3 className="text-2xl font-bold">{promoBanner1.title}</h3>
            {promoBanner1.subtitle && <p>{promoBanner1.subtitle}</p>}
          </div>
        </Link>
      )}
      {promoBanner2 && (
        <Link href={promoBanner2.linkUrl} className="block relative rounded-lg overflow-hidden group">
          <Image src={promoBanner2.image.imageUrl} alt={promoBanner2.title} width={600} height={300} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/40" />
           <div className="absolute bottom-6 left-6 text-white">
            <h3 className="text-2xl font-bold">{promoBanner2.title}</h3>
            {promoBanner2.subtitle && <p>{promoBanner2.subtitle}</p>}
          </div>
        </Link>
      )}
    </div>
  );
};


export default function HomePage() {
  const { products, loading } = useProducts();

  const newProducts = useMemo(() => {
    return products
      .filter(p => p.isNew || new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [products]);

  const bestsellers = useMemo(() => {
    return products.filter(p => p.isBestseller).slice(0, 10);
  }, [products]);

  const renderProductCarousel = (productList: Product[]) => {
     if (loading) {
      return (
         <div className="flex space-x-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
               <ProductCardSkeleton />
            </div>
          ))}
        </div>
      )
    }
    if (productList.length === 0) return null;

    return (
      <Carousel opts={{ align: "start" }} className="-ml-4">
        <CarouselContent>
          {productList.map((product) => (
            <CarouselItem key={product.id} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <div className="p-4">
                  <ProductCard product={product} />
                </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    )
  }

  return (
    <div className="flex flex-col gap-12 md:gap-20">
      <HeroSection />
      
      <main className="container space-y-16 md:space-y-24">
        <FeaturedCategories />

        {newProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Nouveaux arrivages</h2>
              </div>
              <Button variant="ghost" asChild>
                  <Link href="/products?sortBy=newest">
                      Voir tout
                      <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
              </Button>
            </div>
            {renderProductCarousel(newProducts)}
          </section>
        )}

        <PromoBanners />

        {bestsellers.length > 0 && (
          <section>
             <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Meilleures ventes</h2>
              </div>
              <Button variant="ghost" asChild>
                  <Link href="/products">
                      Voir tout
                      <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
              </Button>
            </div>
            {renderProductCarousel(bestsellers)}
          </section>
        )}

      </main>
      
      <Engagements />
    </div>
  );
}
