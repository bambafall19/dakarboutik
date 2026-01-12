
'use client';

import { Suspense } from 'react';
import { ProductsContent } from '@/components/products-content';
import { ProductListingSkeleton } from '@/components/product-listing-skeleton';

export default function ProductsPage() {
  return (
    <div className="py-8">
      <Suspense fallback={<ProductListingSkeleton />}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}
