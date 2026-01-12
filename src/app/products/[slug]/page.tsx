
import { getProductBySlug, getCategoryPath } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ProductDetails } from '@/components/product-details';
import { ProductDetailsSkeleton } from '@/components/product-details-skeleton';
import { getProducts } from '@/lib/data-firebase';

type ProductDetailPageProps = {
  params: { slug: string };
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }
  
  const allProducts = await getProducts();

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 5);
  
  const categoryPath = getCategoryPath(product.category);

  return (
    <ProductDetails 
      product={product} 
      relatedProducts={relatedProducts}
      categoryPath={categoryPath}
    />
  );
}
