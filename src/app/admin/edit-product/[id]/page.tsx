
'use client';

import { EditProductForm } from '@/components/admin/edit-product-form';
import { useCategories } from '@/hooks/use-site-data';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useProductsById } from '@/hooks/use-site-data';
import { Loader2 } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { Suspense } from 'react';

function EditProductPageContent() {
  const params = useParams();
  const id = params.id as string;
  
  const { categories, loading: categoriesLoading } = useCategories();
  const { product, loading: productLoading } = useProductsById(id);

  if (productLoading || categoriesLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Modifier un produit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-bold mb-8">Modifier: {product.title}</h1>
      <EditProductForm categories={categories} product={product} />
    </div>
  );
}


// This is the Server Component that reads searchParams and passes them to the client component.
export default function EditProductPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <EditProductPageContent />
    </Suspense>
  )
}
