
import { Suspense } from 'react';
import { ProductListingPage } from '@/components/product-listing-page';
import { ProductListingSkeleton } from '@/components/product-listing-skeleton';

export const dynamic = 'force-dynamic';

// This is a Server Component that safely reads searchParams and passes primitives to the client.
export default function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const categoryFilter = typeof searchParams.category === 'string' ? searchParams.category : null;
  const brandFilter = typeof searchParams.brands === 'string' ? searchParams.brands.split(',') : [];
  const priceRangeFilter = typeof searchParams.priceRange === 'string' ? searchParams.priceRange : null;
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : null;
  const sortBy = typeof searchParams.sortBy === 'string' ? searchParams.sortBy : 'newest';

  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <ProductListingPage
        categoryFilter={categoryFilter}
        brandFilter={brandFilter}
        priceRangeFilter={priceRangeFilter}
        searchQuery={searchQuery}
        sortBy={sortBy}
      />
    </Suspense>
  );
}
