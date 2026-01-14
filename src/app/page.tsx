
'use client';

import { FeaturedCategories } from '@/components/featured-categories';
import { ProductGrid } from '@/components/product-grid';
import { useProducts } from '@/hooks/use-site-data';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { HeroSection } from '@/components/hero-section';
import { PromoBanners } from '@/components/promo-banners';
import { Engagements } from '@/components/engagements';
import { useMemo } from 'react';

export default function HomePage() {
  const { products, loading } = useProducts();
  
  const newArrivals = useMemo(() => 
    [...products]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8),
    [products]
  );
    
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
      
      <div className="container">
          <main className="space-y-8 md:space-y-16">
            <FeaturedCategories />
            <PromoBanners />
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : (
              <>
                {newArrivals.length > 0 && (
                  <ProductGrid
                    title="Nouveaux arrivages"
                    products={newArrivals}
                    gridClass="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    link={{ href: '/products?sortBy=newest', text: 'Voir tout' }}
                  />
                )}
                 {bestsellers.length > 0 && (
                  <ProductGrid
                    title="Meilleures ventes"
                    products={bestsellers}
                    gridClass="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    link={{ href: '/products?sortBy=bestsellers', text: 'Voir tout' }}
                  />
                )}
                {electronics.length > 0 && (
                  <ProductGrid
                    title="Électroniques & Technologies"
                    products={electronics}
                    gridClass="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    link={{ href: '/products?category=electronique-grand-public', text: 'Voir tout' }}
                  />
                )}
              </>
            )}
          </main>
      </div>
      <Engagements />
    </div>
  );
}
