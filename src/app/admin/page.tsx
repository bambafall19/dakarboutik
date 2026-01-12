'use client';

import { ProductList } from '@/components/admin/product-list';
import { useProducts } from '@/hooks/use-site-data';
import { Loader2 } from 'lucide-react';


export default function AdminProductsPage() {
  const { products, loading } = useProducts();

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return <ProductList products={products} />;
}
