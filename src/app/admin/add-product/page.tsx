
import { AddProductForm } from '@/components/admin/add-product-form';
import { getCategories } from '@/lib/data';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { initializeFirebase } from '@/firebase/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Product } from '@/lib/types';

export default async function AddProductPage() {
  const categories = getCategories();
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

// We need to duplicate this here because of a circular dependency issue with server actions
async function getProducts() {
  const { firestore } = initializeFirebase();
  const productsCollection = collection(firestore, 'products');
  const finalQuery = query(
    productsCollection,
    where('status', '==', 'active')
  );
  const querySnapshot = await getDocs(finalQuery);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Product)
  );
}
