
'use client';

import { getCategoryPath } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ProductDetails } from '@/components/product-details';
import { useProducts, useProductsBySlug } from '@/hooks/use-site-data';
import { Suspense } from 'react';
import { ProductDetailsSkeleton } from '@/components/product-details-skeleton';
import React, { useMemo } from 'react';

type ProductDetailPageProps = {
  params: { slug: string };
};

function ProductDetailsContent({ slug }: { slug: string }) {
  const { product, loading: productLoading } = useProductsBySlug(slug);
  const { products: allProducts, loading: allProductsLoading } = useProducts();

  const relatedProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 5);
  }, [product, allProducts]);
  
  const categoryPath = useMemo(() => {
    if (!product) return [];
    return getCategoryPath(product.category) || [];
  }, [product]);

  if (productLoading || allProductsLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (!product) {
    notFound();
  }

  return (
    <ProductDetails 
      product={product} 
      relatedProducts={relatedProducts}
      categoryPath={categoryPath}
    />
  );
}

// This is now an async Server Component
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = params;

  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsContent slug={slug} />
    </Suspense>
  );
}
