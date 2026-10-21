'use client';

import { ProductList } from '@/components/admin/product-list';
import { AdminError } from '@/components/admin/admin-error';
import { useAdminProducts } from '@/hooks/use-site-data';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AdminProductsContent() {
  const { products, loading, error, refetch } = useAdminProducts();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';

  if (loading) {
    return <div className="flex h-full min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <AdminError onRetry={refetch} />;
  }

  return <ProductList products={products} onRefresh={refetch} initialSearch={q} />;
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="flex h-full min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <AdminProductsContent />
    </Suspense>
  );
}
