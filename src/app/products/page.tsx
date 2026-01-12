'use client';
// ...
export default function ProductsPage() {
  return (
    <div className="container">
      <Suspense fallback={<ProductListingSkeleton />}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}