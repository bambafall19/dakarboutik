
import { Suspense } from 'react';
import { ProductListingPage } from '@/components/product-listing-page';
import { ProductListingSkeleton } from '@/components/product-listing-skeleton';

// This page is now a simple wrapper to load the client-side logic.
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <ProductListingPage />
    </Suspense>
  );
}
