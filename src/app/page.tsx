
'use client';

import { FeaturedCategories } from '@/components/featured-categories';
import { ProductGrid } from '@/components/product-grid';
import { useProducts } from '@/hooks/use-site-data';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { HeroSection } from '@/components/hero-section';
import { PromoBanners } from '@/components/promo-banners';
import { Testimonials } from '@/components/testimonials';
import { useMemo } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Icons } from '@/components/icons';

export default function HomePage() {
  const { products, loading } = useProducts();
  
  const newArrivals = useMemo(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return products
      .filter(p => new Date(p.createdAt) > twentyFourHoursAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [products]);
    
  const bestsellers = useMemo(() => 
    products.filter(p => p.isBestseller).slice(0, 8),
    [products]
  );

  const electronics = useMemo(() => 
    products.filter(p => p.category === 'electronique-grand-public').slice(0, 8),
    [products]
  );

  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <HeroSection />
      
      <main className="container space-y-8 md:space-y-16">
        <FeaturedCategories />
        <PromoBanners />
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
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
                    dragFree: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2">
                    {newArrivals.map((product, index) => (
                      <CarouselItem key={index} className="pl-2 basis-[45%] md:basis-1/4 lg:basis-1/5">
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
             {bestsellers.length > 0 && (
              <ProductGrid
                title="Meilleures ventes"
                products={bestsellers}
                gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                link={{ href: '/products?sortBy=bestsellers', text: 'Voir tout' }}
              />
            )}
            {electronics.length > 0 && (
              <div className="hidden md:block">
                <ProductGrid
                  title="Électroniques & Technologies"
                  products={electronics}
                  gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                  link={{ href: '/products?category=electronique-grand-public', text: 'Voir tout' }}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
