
'use client';

import { HeroSection } from '@/components/hero-section';
import { ProductGrid } from '@/components/product-grid';
import { useProducts } from '@/hooks/use-site-data';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { useMemo } from 'react';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const { products, loading } = useProducts();

  const newProducts = useMemo(() => {
    return products
      .filter(p => p.isNew || new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [products]);

  const electronicsProducts = useMemo(() => {
    return products.filter(p => p.category === 'informatique' || p.category === 'telephonie' || p.category === 'accessoires').slice(0, 5);
  }, [products]);


  if (loading) {
    return (
      <div className="container space-y-12 py-8">
        <ProductGrid 
          title="Nouveaux arrivages"
          products={[]}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
        <Separator />
        <ProductGrid 
            title="Électroniques & Technologies"
            products={[]}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <HeroSection />
      
      <main className="container space-y-12 py-8">
        {newProducts.length > 0 && (
          <ProductGrid 
            title="Nouveaux arrivages"
            products={newProducts}
            link={{href: "/products?sortBy=newest", text: "Voir tout"}}
            gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          />
        )}
        
        <Separator />

        {electronicsProducts.length > 0 && (
           <ProductGrid 
            title="Électroniques & Technologies"
            products={electronicsProducts}
            link={{href: "/products", text: "Voir tout"}}
            gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          />
        )}
      </main>
    </div>
  );
}
