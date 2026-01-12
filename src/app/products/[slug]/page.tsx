'use client';

import { ProductDetails } from '@/components/product-details';
import { useProductsBySlug, useProducts } from '@/hooks/use-site-data';
import { notFound, useParams } from 'next/navigation';
import { useMemo } from 'react';
import { ProductDetailsSkeleton } from '@/components/product-details-skeleton';


export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { product, loading: productLoading } = useProductsBySlug(slug);
  const { products: allProducts, loading: allProductsLoading } = useProducts();
  
  const relatedProducts = useMemo(() => {
    if (!product || allProducts.length === 0) return [];
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, allProducts]);

  const loading = productLoading || allProductsLoading;

  if (loading) {
    return (
        <div className="container">
            <ProductDetailsSkeleton />
        </div>
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="container">
        <ProductDetails product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
