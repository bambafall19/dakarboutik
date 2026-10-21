
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
import { useParams } from 'next/navigation';
import { AdminError } from '@/components/admin/admin-error';

function EditProductPageContent() {
  const params = useParams();
  const id = params.id as string;

  const { categories, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();
  const { product, loading: productLoading, error: productError, refetch: refetchProduct } = useProductsById(id);

  if (productLoading || categoriesLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (productError || categoriesError) {
    return (
      <AdminError
        title="Impossible de charger le produit"
        onRetry={() => {
          refetchProduct();
          refetchCategories();
        }}
      />
    );
  }

  if (!product) {
    return (
      <AdminError
        title="Produit introuvable"
        description="Ce produit n'existe plus ou a été supprimé."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
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
      <h1 className="font-headline text-3xl font-extrabold">Modifier : {product.title}</h1>
      <EditProductForm categories={categories} product={product} />
    </div>
  );
}

export default function EditProductPage() {
  return <EditProductPageContent />;
}
