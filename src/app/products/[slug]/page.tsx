
import { ProductDetails } from '@/components/product-details';
import { getProductBySlug, getProducts } from '@/lib/data';
import { notFound } from 'next/navigation';


export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }
  
  // Fetch related products from the same category, excluding the current one
  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return <ProductDetails product={product} relatedProducts={relatedProducts} />;
}
