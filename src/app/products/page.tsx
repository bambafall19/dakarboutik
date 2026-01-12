
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductListing } from '@/components/product-listing';
import { ProductListingSkeleton } from '@/components/product-listing-skeleton';
import { useProducts } from '@/hooks/use-site-data';
import { getCategories, getAllChildCategorySlugs, getLeafCategories } from '@/lib/data';
import { useMemo } from 'react';
import type { Product } from '@/lib/types';


function ProductsPageContent() {
  const searchParams = useSearchParams();
  const { products, loading: productsLoading } = useProducts();
  const allCategories = useMemo(() => getCategories(), []);
  const filterableCategories = useMemo(() => getLeafCategories(), []);

  const categoryFilter = searchParams.get('category')?.split(',') || [];
  const brandFilter = searchParams.get('brands')?.split(',') || [];
  const priceRangeFilter = searchParams.get('priceRange');
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

    // Category
    if (categoryFilter.length > 0) {
        const allSelectedSlugs = categoryFilter.flatMap(slug => getAllChildCategorySlugs(slug));
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
  }, [products, categoryFilter, brandFilter, selectedPriceRange, sortBy]);
  
  const brands = useMemo(() => {
    const allBrands = products.map((p) => p.brand).filter(Boolean) as string[];
    return [...new Set(allBrands)];
  }, [products]);


  if (productsLoading) {
    return <ProductListingSkeleton />;
  }

  return (
    <ProductListing
      products={filteredProducts}
      allCategories={allCategories}
      filterableCategories={filterableCategories}
      brands={brands}
    />
  );
}


export default function ProductsPage() {
  return (
    <div className="py-8">
      <Suspense fallback={<ProductListingSkeleton />}>
        <ProductsPageContent />
      </Suspense>
    </div>
  );
}
