
'use client';

import { FeaturedCategories } from '@/components/featured-categories';
import { HeroSection } from '@/components/hero-section';
import { ProductGrid } from '@/components/product-grid';
import { Engagements } from '@/components/engagements';
import { Testimonials } from '@/components/testimonials';
import { useProducts } from '@/hooks/use-site-data';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { usePathname } from 'next/navigation';

export default function HomePage() {
  const { products, loading } = useProducts();
  const pathname = usePathname();
  
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
    
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 8);
  const saleProducts = products.filter(p => p.salePrice).slice(0, 8);

  const ProductListSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  )

  const isHomePage = pathname === '/';

  return (
    <>
      {isHomePage && <HeroSection />}
      <div className="space-y-16 my-16">
        <FeaturedCategories />
        
        {loading ? (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Nouveautés</h2>
            <ProductListSkeleton />
          </div>
        ) : (
          <ProductGrid
            title="Nouveautés"
            products={newArrivals}
            link={{ href: '/products?sortBy=newest', text: 'Voir tout' }}
            gridClass="grid-cols-2 md:grid-cols-4"
          />
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
              gridClass="grid-cols-2 md:grid-cols-4"
            />
          )
        )}
        
        <Engagements />

        {loading ? (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">En Promotion</h2>
              <ProductListSkeleton />
            </div>
        ): (
          saleProducts.length > 0 && (
              <ProductGrid
                  title="En Promotion"
                  products={saleProducts}
                  link={{ href: '/products', text: 'Voir tout' }}
                  gridClass="grid-cols-2 md:grid-cols-4"
              />
          )
        )}

        <Testimonials />
      </div>
    </>
  );
}
