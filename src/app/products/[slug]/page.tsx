
'use client';

import { getCategoryPath } from '@/lib/data-helpers';
import { notFound } from 'next/navigation';
import { ProductDetails } from '@/components/product-details';
import { useProducts, useProductsBySlug, useCategories } from '@/hooks/use-site-data';
import { Suspense, useEffect } from 'react';
import { ProductDetailsSkeleton } from '@/components/product-details-skeleton';
import React, { useMemo } from 'react';
import { useRecentProducts } from '@/hooks/use-recent-products';

type ProductDetailPageProps = {
  params: { slug: string };
};

function ProductDetailsPageContent({ slug }: { slug: string }) {
  const { product, loading: productLoading } = useProductsBySlug(slug);
  const { products: allProducts, loading: allProductsLoading } = useProducts();
  const { rawCategories, loading: categoriesLoading } = useCategories();
  const { addRecentProduct } = useRecentProducts();

  useEffect(() => {
    if (product) {
      addRecentProduct(product);
    }
  }, [product, addRecentProduct]);

  const relatedProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 5);
  }, [product, allProducts]);
  
  const categoryPath = useMemo(() => {
    if (!product || rawCategories.length === 0) return [];
    return getCategoryPath(product.category, rawCategories) || [];
  }, [product, rawCategories]);

  if (productLoading || allProductsLoading || categoriesLoading) {
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

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const slug = params.slug;

  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsPageContent slug={slug} />
    </Suspense>
  );
}

