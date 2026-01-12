'use client';
// ...
export default function ProductDetailPage() {
  const params = useParams();
// ...
  if (!product) {
    notFound();
  }

  return (
    <div className="container">
        <ProductDetails product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
