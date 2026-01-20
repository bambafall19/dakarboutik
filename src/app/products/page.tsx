
import { Suspense } from 'react';
import { ProductListingPage } from '@/components/product-listing-page';
import { ProductListingSkeleton } from '@/components/product-listing-skeleton';

export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <ProductListingPage />
    </Suspense>
  );
}
