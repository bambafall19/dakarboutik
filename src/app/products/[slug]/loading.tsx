import { ProductDetailsSkeleton } from '@/components/product-details-skeleton';

export default function Loading() {
  return (
    <div className="container py-8">
      <ProductDetailsSkeleton />
    </div>
  );
}
