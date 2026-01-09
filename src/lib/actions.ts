
'use server';

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { initializeFirebase } from '@/firebase/server'; // Using server instance
import type { Product } from './types';

// Slugify function
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export async function addProduct(productData: {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  isNew: boolean;
  isBestseller: boolean;
  metaTitle?: string;
  metaDescription?: string;
}) {
  const { firestore } = initializeFirebase();
  if (!firestore) {
    throw new Error('Firestore is not initialized.');
  }

  try {
    const slug = slugify(productData.title);
    const newProduct: Omit<Product, 'id'> = {
      ...productData,
      slug,
      status: 'active',
      createdAt: new Date().toISOString(),
      // Add placeholder values for fields not in the form
      images: [
        {
          id: 'product-phone-1a',
          description: 'Front view of a modern smartphone',
          imageUrl: 'https://picsum.photos/seed/1/600/600',
          imageHint: 'smartphone product',
        },
      ],
      specs: {},
      variants: [],
      currency: 'XOF',
    };

    const docRef = await addDoc(collection(firestore, 'products'), newProduct);
    console.log('Document written with ID: ', docRef.id);

    // Revalidate paths to show the new product
    revalidatePath('/');
    revalidatePath('/products');
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to add product.');
  }
}

export async function updateSiteSettings(settings: { logoUrl?: string }) {
  const { firestore } = initializeFirebase();
  if (!firestore) {
    throw new Error('Firestore is not initialized.');
  }

  try {
    const settingsRef = doc(firestore, 'settings', 'siteConfig');
    await setDoc(settingsRef, settings, { merge: true });

    // Revalidate all paths to reflect the new logo
    revalidatePath('/', 'layout');
  } catch (e) {
    console.error('Error updating settings: ', e);
    throw new Error('Failed to update site settings.');
  }
}
