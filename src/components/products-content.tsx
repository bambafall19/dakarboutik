'use client';

import { useSearchParams } from 'next/navigation';
import { useProducts, useCategories } from '@/hooks/use-site-data';
import { ProductListing } from '@/components/product-listing';
import { ProductListingSkeleton } from '@/components/product-listing-skeleton';
import { useMemo, useState } from 'react';

export function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSortBy = searchParams.get('sortBy') || 'newest';

  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  const [filters, setFilters] = useState({
    categories: initialCategory ? [initialCategory] : [],
    brands: [],
    priceRange: [0, 1000000] as [number, number],
    sortBy: initialSortBy,
  });

  const brands = useMemo(() => {
    const allBrands = products.map((p) => p.brand).filter(Boolean) as string[];
    return [...new Set(allBrands)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (filters.categories.length > 0) {
      filtered = filtered.filter((p) => filters.categories.includes(p.category));
    }
    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) => p.brand && filters.brands.includes(p.brand));
    }

    filtered = filtered.filter(p => {
      const price = p.salePrice ?? p.price;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    switch (filters.sortBy) {
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
  }, [products, filters]);

  if (productsLoading || categoriesLoading) {
    return <ProductListingSkeleton />;
  }

  return (
    <ProductListing
      products={filteredProducts}
      categories={categories}
      brands={brands}
      filters={filters}
      onFilterChange={setFilters}
    />
  );
}
