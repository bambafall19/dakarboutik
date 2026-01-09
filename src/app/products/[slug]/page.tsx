
import { ProductDetails } from '@/components/product-details';
import { getProductBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';


export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
