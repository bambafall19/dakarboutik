
'use client';

import { Suspense } from 'react';
import { ProductsContent } from '@/components/products-content';
import { ProductListingSkeleton } from '@/components/product-listing-skeleton';
import type { ReadonlyURLSearchParams } from 'next/navigation';

interface ProductsPageProps {
  searchParams: ReadonlyURLSearchParams;
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="container py-8">
      <Suspense fallback={<ProductListingSkeleton />}>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
