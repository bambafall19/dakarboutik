import { ProductListingSkeleton } from '@/components/product-listing-skeleton';

export default function Loading() {
  return (
    <div className="container py-8">
      <ProductListingSkeleton />
    </div>
  );
}
