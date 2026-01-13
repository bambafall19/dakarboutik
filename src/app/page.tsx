
'use client';

import { FeaturedCategories } from '@/components/featured-categories';
import { ProductGrid } from '@/components/product-grid';
import { useProducts } from '@/hooks/use-site-data';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { Icons } from '@/components/icons';
import { HeroSection } from '@/components/hero-section';
import { Testimonials } from '@/components/testimonials';
import { Engagements } from '@/components/engagements';

export default function HomePage() {
  const { products, loading } = useProducts();
  
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
    
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 8);
  const saleProducts = products.filter(p => p.salePrice).slice(0, 8);

  return (
    <div className="flex flex-col gap-12 md:gap-20">
      <HeroSection />
      
        {loading ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          </>
        ) : (
          <>
            {saleProducts.length > 0 && (
                <ProductGrid
                    title="Flash Sale"
                    products={saleProducts}
                    link={{ href: '/products', text: 'Voir tout' }}
                    gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                    icon={<Icons.flash className="h-6 w-6 text-primary" />}
                />
            )}
            {newArrivals.length > 0 && (
              <ProductGrid
                title="Nouveautés"
                products={newArrivals}
                link={{ href: '/products?sortBy=newest', text: 'Voir tout' }}
                gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              />
            )}
            {bestsellers.length > 0 && (
              <ProductGrid
                title="Meilleures Ventes"
                products={bestsellers}
                link={{ href: '/products', text: 'Voir tout' }}
                gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              />
            )}
          </>
        )}

        <FeaturedCategories />
        <Engagements />
        <Testimonials />
    </div>
  );
}
