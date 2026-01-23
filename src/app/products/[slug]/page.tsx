
import { Suspense } from 'react';
import { ProductDetailsPageContent } from '@/components/product-details-page-content';
import { ProductDetailsSkeleton } from '@/components/product-details-skeleton';
import { getProductBySlug } from '@/lib/data-firebase';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';


type ProductDetailPageProps = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: ProductDetailPageProps
): Promise<Metadata> {
  const slug = params.slug;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Produit non trouvé',
    };
  }

  return {
    title: product.metaTitle || product.title,
    description: product.metaDescription || product.description.substring(0, 160),
    openGraph: {
        title: product.metaTitle || product.title,
        description: product.metaDescription || product.description.substring(0, 160),
        images: [
            {
                url: product.images[0]?.imageUrl,
                width: 800,
                height: 600,
                alt: product.title,
            },
        ],
    },
  };
}

// This is the Server Component that reads params and passes them to the client component.
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const slug = params.slug;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsPageContent product={product} />
    </Suspense>
  );
}
