import 'server-only';
import { initializeFirebase } from '@/firebase/server';
import { collection, getDocs, query, where, doc, getDoc, orderBy } from 'firebase/firestore';
import type { Banner, Category, Product, SiteSettings } from './types';
import { getBanners as getStaticBanners } from './data';

// This is a server-side only function
export async function getProducts() {
  const { firestore } = initializeFirebase();
  const productsRef = collection(firestore, 'products');
  const q = query(productsRef, where('status', '==', 'active'));
  const querySnapshot = await getDocs(q);

  const products = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  return products;
}

export async function getProductBySlug(slug: string) {
    const { firestore } = initializeFirebase();
    const productsRef = collection(firestore, 'products');
    const q = query(productsRef, where('slug', '==', slug), where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Product;
}

export async function getCategories() {
  const { firestore } = initializeFirebase();
  const categoriesRef = collection(firestore, 'categories');
  const q = query(categoriesRef, orderBy('name'));
  const querySnapshot = await getDocs(q);

  const categories = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];

  return categories;
}
