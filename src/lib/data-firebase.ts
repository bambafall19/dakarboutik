
import 'server-only';
import { initializeFirebase } from '@/firebase/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Product } from './types';

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
