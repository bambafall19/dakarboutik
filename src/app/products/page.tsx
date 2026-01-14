
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductListing } from '@/components/product-listing';
import { ProductListingSkeleton } from '@/components/product-listing-skeleton';
import { useProducts, useCategories } from '@/hooks/use-site-data';
import { getAllChildCategorySlugs } from '@/lib/data-helpers';
import { useMemo } from 'react';
import type { Product } from '@/lib/types';
import { CategorySidebar } from '@/components/category-sidebar';
import { ProductFilters } from '@/components/product-filters';
import { Card, CardContent } from '@/components/ui/card';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const { products, loading: productsLoading } = useProducts();
  const { categories, rawCategories, loading: categoriesLoading } = useCategories();

  const categoryFilter = searchParams.get('category');
  const brandFilter = searchParams.get('brands')?.split(',').filter(Boolean) || [];
  const priceRangeFilter = searchParams.get('priceRange');
  const searchQuery = searchParams.get('q');
  const sortBy = searchParams.get('sortBy') || 'newest';

  const selectedPriceRange: [number, number] = useMemo(() => {
    let range: [number, number] = [0, 1000000];
    if (priceRangeFilter) {
      const [min, max] = priceRangeFilter.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        range = [min, max];
      }
    }
    return range;
  }, [priceRangeFilter]);
  
  const filteredProducts = useMemo(() => {
    let filtered: Product[] = [...products];
    
    // Search Query
    if (searchQuery) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }

    // Category
    if (categoryFilter) {
        const allSelectedSlugs = getAllChildCategorySlugs(categoryFilter, rawCategories);
        const uniqueSlugs = [...new Set(allSelectedSlugs)];
        filtered = filtered.filter((p) => uniqueSlugs.includes(p.category));
    }
      
    // Brand
    if (brandFilter.length > 0) {
      filtered = filtered.filter((p) => p.brand && brandFilter.includes(p.brand));
    }

    // Price
    filtered = filtered.filter(p => {
      const price = p.salePrice ?? p.price;
      return price >= selectedPriceRange[0] && price <= selectedPriceRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  }, [products, categoryFilter, brandFilter, selectedPriceRange, sortBy, rawCategories, searchQuery]);
  
  const brands = useMemo(() => {
    const allBrands = products.map((p) => p.brand).filter(Boolean) as string[];
    return [...new Set(allBrands)];
  }, [products]);


  if (productsLoading || categoriesLoading) {
    return <ProductListingSkeleton />;
  }
  
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <aside className="hidden md:block md:col-span-1">
        <div className="sticky top-24">
          <Card>
            <CardContent className="pt-6 space-y-8">
              <CategorySidebar categories={categories} />
              <ProductFilters brands={brands} />
            </CardContent>
          </Card>
        </div>
      </aside>
      <main className="md:col-span-3">
        <ProductListing
          products={filteredProducts}
          allCategories={categories}
          brands={brands}
          suggestedProducts={bestsellers}
        />
      </main>
    </div>
  );
}


export default function ProductsPage() {
  return (
    <div className="py-2">
      <Suspense fallback={<ProductListingSkeleton />}>
        <ProductsPageContent />
      </Suspense>
    </div>
  );
}
