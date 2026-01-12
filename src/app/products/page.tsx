
'use client';

import { ProductListing } from '@/components/product-listing';
import { useProducts, useCategories } from '@/hooks/use-site-data';
import { useMemo } from 'react';
import { ProductListingSkeleton } from '@/components/product-listing-skeleton';

export default function ProductsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined }}) {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const allBrands = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean) as string[])], [products]);

  const loading = productsLoading || categoriesLoading;
  
  if (loading) {
    return <ProductListingSkeleton />
  }

  return (
    <ProductListing 
        products={products}
        categories={categories}
        brands={allBrands}
        initialCategory={searchParams.category as string}
    />
  )
}
