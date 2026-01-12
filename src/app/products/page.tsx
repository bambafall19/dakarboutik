'use client';

import { ProductListing } from '@/components/product-listing';
import { useProducts, useCategories } from '@/hooks/use-site-data';
import { useMemo, Suspense, useState, useEffect } from 'react';
import { ProductListingSkeleton } from '@/components/product-listing-skeleton';
import { useSearchParams } from 'next/navigation';
import type { Product } from '@/lib/types';
import { getCategories as getStaticCategories } from '@/lib/data';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');

  const { products: allProducts, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const allBrands = useMemo(() => [...new Set(allProducts.map(p => p.brand).filter(Boolean) as string[])], [allProducts]);
  const staticCategories = useMemo(() => getStaticCategories(), []);

  const [filters, setFilters] = useState({
    categories: initialCategory ? [initialCategory] : [],
    brands: [],
    priceRange: [0, 1000000] as [number, number],
    sortBy: 'newest',
  });

  useEffect(() => {
    setFilters(f => ({...f, categories: initialCategory ? [initialCategory] : []}));
  }, [initialCategory]);

  const filteredProducts = useMemo(() => {
    let products: Product[] = [...allProducts];
    
    const currentCategories = filters.categories;

    if (currentCategories.length > 0) {
        const allCategorySlugs = currentCategories.flatMap(catSlug => {
            const selectedCategory = staticCategories.find(c => c.slug === catSlug);
            return [catSlug, ...(selectedCategory?.subCategories?.map(sc => sc.slug) || [])];
        });
        products = products.filter(p => allCategorySlugs.includes(p.category));
    }
    
    if (filters.brands.length > 0) {
      products = products.filter(p => p.brand && filters.brands.includes(p.brand));
    }
    
    products = products.filter(p => {
      const price = p.salePrice ?? p.price;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    switch (filters.sortBy) {
      case 'price_asc':
        products.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price_desc':
        products.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case 'newest':
      default:
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return products;
  }, [allProducts, filters, staticCategories]);


  const loading = productsLoading || categoriesLoading;
  
  if (loading) {
    return <ProductListingSkeleton />
  }

  return (
    <ProductListing 
        products={filteredProducts}
        categories={categories}
        brands={allBrands}
        filters={filters}
        onFilterChange={setFilters}
    />
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <ProductsContent />
    </Suspense>
  );
}
