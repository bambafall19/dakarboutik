
'use client';

import { FeaturedCategories } from '@/components/featured-categories';
import { ProductGrid } from '@/components/product-grid';
import { useProducts } from '@/hooks/use-site-data';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { Icons } from '@/components/icons';
import { Engagements } from '@/components/engagements';
import { Testimonials } from '@/components/testimonials';
import { HeroSection } from '@/components/hero-section';

export default function HomePage() {
  const { products, loading } = useProducts();
  
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
    
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 8);
  const saleProducts = products.filter(p => p.salePrice).slice(0, 8);

  const ProductListSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  )

  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <HeroSection />
      <div className="space-y-12 my-12">
        <FeaturedCategories />
        
        {loading ? (
           <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 flex items-center gap-2">
              <Icons.flash className="h-6 w-6 text-primary" />
              Flash Sale
            </h2>
            <ProductListSkeleton />
          </div>
        ) : (
          saleProducts.length > 0 && (
              <ProductGrid
                  title="Flash Sale"
                  products={saleProducts}
                  link={{ href: '/products', text: 'Voir tout' }}
                  gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                  icon={<Icons.flash className="h-6 w-6 text-primary" />}
              />
          )
        )}

        {loading ? (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Nouveautés</h2>
            <ProductListSkeleton />
          </div>
        ) : (
          newArrivals.length > 0 && (
            <ProductGrid
              title="Nouveautés"
              products={newArrivals}
              link={{ href: '/products?sortBy=newest', text: 'Voir tout' }}
              gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            />
          )
        )}


        {loading ? (
           <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Meilleures Ventes</h2>
            <ProductListSkeleton />
          </div>
        ) : (
          bestsellers.length > 0 && (
            <ProductGrid
              title="Meilleures Ventes"
              products={bestsellers}
              link={{ href: '/products', text: 'Voir tout' }}
              gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            />
          )
        )}

        <Engagements />

        <Testimonials />
      </div>
    </div>
  );
}
