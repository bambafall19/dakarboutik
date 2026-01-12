
import { EditProductForm } from '@/components/admin/edit-product-form';
import { getSimpleCategories } from '@/lib/data';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';
import { notFound } from 'next/navigation';
import type { Product } from '@/lib/types';

async function getProductById(id: string) {
    const { firestore } = initializeFirebase();
    const productRef = doc(firestore, 'products', id);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
        return null;
    }

    return { id: productSnap.id, ...productSnap.data() } as Product;
}


export default async function EditProductPage({ params }: { params: { id: string } }) {
  const categories = await getSimpleCategories();
  const product = await getProductById(params.id);

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
