
'use client';

import { AddProductForm } from '@/components/admin/add-product-form';
import { useCategories } from '@/hooks/use-site-data';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Loader2 } from 'lucide-react';
import { AdminError } from '@/components/admin/admin-error';

export default function AddProductPage() {
  const { categories, loading, error, refetch } = useCategories();

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <AdminError title="Impossible de charger les catégories" onRetry={refetch} />;
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
            <BreadcrumbPage>Ajouter un produit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="font-headline text-3xl font-extrabold">Ajouter un nouveau produit</h1>
      <AddProductForm categories={categories} />
    </div>
  );
}
