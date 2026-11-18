
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { OFFICIAL_CATALOG_ENABLED } from '@/lib/catalog-mode';
import { ProductListingPage } from '@/components/product-listing-page';
import { ProductListingSkeleton } from '@/components/product-listing-skeleton';

export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  if (!OFFICIAL_CATALOG_ENABLED) redirect('/boutiques');
  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <ProductListingPage />
    </Suspense>
  );
}
