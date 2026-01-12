import { getCategoryPath } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ProductDetails } from '@/components/product-details';
import { getProducts, getProductBySlug } from '@/lib/data-firebase';
import { Suspense } from 'react';
import { ProductDetailsSkeleton } from '@/components/product-details-skeleton';
import React from 'react';

type ProductDetailPageProps = {
  params: { slug: string };
};

async function ProductDetailsContent({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }
  
  const allProducts = await getProducts();

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 5);
  
  const categoryPath = getCategoryPath(product.category) || [];

  return (
    <ProductDetails 
      product={product} 
      relatedProducts={relatedProducts}
      categoryPath={categoryPath}
    />
  );
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsContent slug={params.slug} />
    </Suspense>
  );
}
