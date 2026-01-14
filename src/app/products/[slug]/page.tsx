
import { Suspense } from 'react';
import { ProductDetailsPageContent } from '@/components/product-details-page-content';
import { ProductDetailsSkeleton } from '@/components/product-details-skeleton';


type ProductDetailPageProps = {
  params: { slug: string };
};

// This is the Server Component that reads params and passes them to the client component.
export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const slug = params.slug;

  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsPageContent slug={slug} />
    </Suspense>
  );
}

