
'use client';

import { useProductsBySlug } from '@/hooks/use-site-data';
import { useProducts } from '@/hooks/use-site-data';
import { ProductDetails } from '@/components/product-details';
import { ProductDetailsSkeleton } from '@/components/product-details-skeleton';
import { notFound, useParams } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { product, loading: productLoading, error } = useProductsBySlug(slug);
  const { products: allProducts, loading: allProductsLoading } = useProducts();

  if (productLoading || allProductsLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (error || !product) {
    notFound();
  }

  const relatedProducts = allProducts
    .filter(
      (p) => p.category === product.category && p.id !== product.id
    )
    .slice(0, 4);

  return (
    <ProductDetails product={product} relatedProducts={relatedProducts} />
  );
}
