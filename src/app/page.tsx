
'use client';

import { HeroSection } from '@/components/hero-section';
import { ProductGrid } from '@/components/product-grid';
import { useBanners, useProducts } from '@/hooks/use-site-data';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import { FeaturedCategories } from '@/components/featured-categories';
import { PromoBanners } from '@/components/promo-banners';
import { Engagements } from '@/components/engagements';
import { Icons } from '@/components/icons';

export default function HomePage() {
  const { products, loading: productsLoading } = useProducts();
  const { banners, loading: bannersLoading } = useBanners();

  const newProducts = useMemo(() => {
    return products
      .filter(p => p.isNew || new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [products]);

  const bestsellers = useMemo(() => {
    return products.filter(p => p.isBestseller).slice(0, 8);
  }, [products]);
  
  const loading = productsLoading || bannersLoading;

  if (loading) {
    return (
      <div className="container space-y-12 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
        <Separator />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <HeroSection banners={banners} loading={loading} />
      
      <main className="flex flex-col gap-12 md:gap-16 lg:gap-20 py-8">
        <FeaturedCategories />
        
        {newProducts.length > 0 && (
          <div className="container">
            <ProductGrid 
              title="Nouveaux arrivages"
              products={newProducts}
              link={{href: "/products?sortBy=newest", text: "Voir tout"}}
              gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              icon={<Icons.flash className="text-primary" />}
            />
          </div>
        )}
        
        <PromoBanners banners={banners} />

        {bestsellers.length > 0 && (
           <div className="container">
             <ProductGrid 
              title="Nos meilleures ventes"
              products={bestsellers}
              link={{href: "/products", text: "Voir tout"}}
              gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
            />
           </div>
        )}
        
        <Engagements />

      </main>
    </div>
  );
}
