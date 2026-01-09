
import { AddProductForm } from '@/components/admin/add-product-form';
import { getSimpleCategories, getProducts } from '@/lib/data';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default async function AddProductPage() {
  const categories = getSimpleCategories();
  const brands = [...new Set((await getProducts()).map((p) => p.brand))];

  return (
    <div className="container py-12">
      <Breadcrumb className="mb-6">
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
      <h1 className="text-3xl font-bold mb-8">Ajouter un nouveau produit</h1>
      <AddProductForm categories={categories} brands={brands} />
    </div>
  );
}
