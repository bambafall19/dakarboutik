
'use client';

import { ProductListing } from '@/components/product-listing';
import { useProducts, useCategories } from '@/hooks/use-site-data';
import { useMemo, Suspense } from 'react';
import { ProductListingSkeleton } from '@/components/product-listing-skeleton';
import { useSearchParams } from 'next/navigation';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
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
        initialCategory={initialCategory || undefined}
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
