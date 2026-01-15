
'use client';

import { FeaturedCategories } from '@/components/featured-categories';
import { ProductGrid } from '@/components/product-grid';
import { useBanners, useProducts } from '@/hooks/use-site-data';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { Engagements } from '@/components/engagements';
import { useMemo } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { HeroSection } from '@/components/hero-section';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';


function PromoBanners() {
  const { banners, loading } = useBanners();
  const promoBanner1 = banners.find(b => b.id === 'promo-banner-1');
  const promoBanner2 = banners.find(b => b.id === 'promo-banner-2');

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!promoBanner1 || !promoBanner2) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
      <Link href={promoBanner1.linkUrl} className="block group relative rounded-lg overflow-hidden">
        <Image 
          src={promoBanner1.image.imageUrl} 
          alt={promoBanner1.title} 
          width={600} 
          height={250} 
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
          <h3 className="text-2xl font-bold text-white drop-shadow-md">{promoBanner1.title}</h3>
          {promoBanner1.subtitle && <p className="mt-1 text-white/90 drop-shadow-md">{promoBanner1.subtitle}</p>}
        </div>
      </Link>
      <Link href={promoBanner2.linkUrl} className="block group relative rounded-lg overflow-hidden">
        <Image 
          src={promoBanner2.image.imageUrl} 
          alt={promoBanner2.title} 
          width={600} 
          height={250} 
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
          <h3 className="text-2xl font-bold text-white drop-shadow-md">{promoBanner2.title}</h3>
          {promoBanner2.subtitle && <p className="mt-1 text-white/90 drop-shadow-md">{promoBanner2.subtitle}</p>}
        </div>
      </Link>
    </div>
  );
}


export default function HomePage() {
  const { products, loading } = useProducts();
  
  const newArrivals = useMemo(() => {
    return products
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [products]);
    
  const bestsellers = useMemo(() => 
    products.filter(p => p.isBestseller).slice(0, 10),
    [products]
  );


  return (
    <div className="flex flex-col gap-8 md:gap-12">
      
      <main className="container space-y-8 md:space-y-16">
        <HeroSection />
        <FeaturedCategories />
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {newArrivals.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight">Nouveaux arrivages</h2>
                  <Button variant="ghost" asChild>
                    <Link href={'/products?sortBy=newest'}>
                      Voir tout
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <Carousel
                  opts={{
                    align: "start",
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {newArrivals.map((product, index) => (
                      <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                        <div className="p-1 h-full">
                          <ProductCard product={product} />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className='-left-4 hidden md:flex' />
                  <CarouselNext className='-right-4 hidden md:flex' />
                </Carousel>
              </section>
            )}

            <PromoBanners />

             {bestsellers.length > 0 && (
              <ProductGrid
                title="Meilleures ventes"
                products={bestsellers}
                gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                link={{ href: '/products?sortBy=bestsellers', text: 'Voir tout' }}
              />
            )}
          </>
        )}
      </main>
      <Engagements />
    </div>
  );
}
