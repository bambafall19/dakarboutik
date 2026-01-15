
'use client';

import { HeroSection } from '@/components/hero-section';
import { ProductGrid } from '@/components/product-grid';
import { useProducts, useCategories } from '@/hooks/use-site-data';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const { products, loading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!activeFilter) return products;
    return products.filter(p => p.category === activeFilter);
  }, [products, activeFilter]);

  const topLevelCategories = useMemo(() => {
    return categories.filter(c => !c.parentId);
  }, [categories]);


  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <HeroSection />
      
      <main className="container space-y-8 md:space-y-16">
        <div className="flex items-center justify-center gap-4 md:gap-8 border-b pb-4">
          <Button variant="ghost" onClick={() => setActiveFilter(null)} className={cn(!activeFilter && "text-primary font-bold")}>All</Button>
          {topLevelCategories.map(cat => (
             <Button 
                key={cat.id} 
                variant="ghost" 
                onClick={() => setActiveFilter(cat.slug)}
                className={cn(activeFilter === cat.slug && "text-primary font-bold")}
              >
                {cat.name}
              </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <ProductGrid
            products={filteredProducts}
            gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4"
          />
        )}
      </main>
    </div>
  );
}
