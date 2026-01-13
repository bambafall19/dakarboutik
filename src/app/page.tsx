
'use client';

import { FeaturedCategories } from '@/components/featured-categories';
import { ProductGrid } from '@/components/product-grid';
import { useProducts } from '@/hooks/use-site-data';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { HeroSection } from '@/components/hero-section';
import { HomeSidebar } from '@/components/home-sidebar';

export default function HomePage() {
  const { products, loading } = useProducts();
  
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
    
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 8);

  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <HeroSection />
      
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <HomeSidebar />
          </aside>
          <main className="lg:col-span-3 space-y-8 md:space-y-16">
            <FeaturedCategories />
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : (
              <>
                {newArrivals.length > 0 && (
                  <ProductGrid
                    title="Nouveaux arrivages"
                    products={newArrivals}
                    gridClass="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
                    link={{ href: '/products?sortBy=newest', text: 'Voir tout' }}
                  />
                )}
                 {bestsellers.length > 0 && (
                  <ProductGrid
                    title="Meilleures ventes"
                    products={bestsellers}
                    gridClass="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
                    link={{ href: '/products?sortBy=bestsellers', text: 'Voir tout' }}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
