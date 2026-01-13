
'use client';

import { FeaturedCategories } from '@/components/featured-categories';
import { ProductGrid } from '@/components/product-grid';
import { useProducts } from '@/hooks/use-site-data';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { Icons } from '@/components/icons';
import { HeroSection } from '@/components/hero-section';
import { Testimonials } from '@/components/testimonials';

export default function HomePage() {
  const { products, loading } = useProducts();
  
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
    
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 8);
  const saleProducts = products.filter(p => p.salePrice).slice(0, 8);


  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <HeroSection />
      
      <div className="container space-y-8 md:space-y-12">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
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
            </>
          )}
      </div>
      
    </div>
  );
}
