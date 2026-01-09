import { Smartphone, Headphones, Laptop, Plug } from 'lucide-react';
import type { ImagePlaceholder } from './placeholder-images';
import { findImage } from './placeholder-images';
import type { Banner, Category, Product } from './types';
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';

const { firestore } = initializeFirebase();

const categories: Category[] = [
  { id: 'cat1', name: 'Smartphones', slug: 'smartphones', icon: Smartphone },
  { id: 'cat2', name: 'Accessoires', slug: 'accessoires', icon: Plug },
  { id: 'cat3', name: 'Audio', slug: 'audio', icon: Headphones },
  { id: 'cat4', name: 'PC & Portables', slug: 'pc-portables', icon: Laptop },
];

const banners: Banner[] = [
  {
    id: 'banner1',
    title: 'Les nouveaux smartphones sont arrivés !',
    image: findImage('banner-1'),
    linkUrl: '/products?category=smartphones',
  },
  {
    id: 'banner2',
    title: 'Le son immersif à votre portée',
    image: findImage('banner-2'),
    linkUrl: '/products?category=audio',
  },
  {
    id: 'banner3',
    title: 'Boostez votre productivité',
    image: findImage('banner-3'),
    linkUrl: '/products?category=accessoires',
  },
];

async function fetchProducts(q?: any): Promise<Product[]> {
  const productsCollection = collection(firestore, 'products');
  const finalQuery =
    q || query(productsCollection, where('status', '==', 'active'));
  const querySnapshot = await getDocs(finalQuery);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Product)
  );
}

export const getProducts = async () => {
  return await fetchProducts();
};

export const getProductBySlug = async (slug: string) => {
  const q = query(
    collection(firestore, 'products'),
    where('slug', '==', slug),
    limit(1)
  );
  const products = await fetchProducts(q);
  return products[0] || null;
};

export const getCategories = () => categories;
export const getCategoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
export const getBanners = () => banners;

export const getNewArrivals = async (count: number = 4) =>
  await fetchProducts(
    query(
      collection(firestore, 'products'),
      where('isNew', '==', true),
      limit(count)
    )
  );

export const getBestsellers = async (count: number = 4) =>
  await fetchProducts(
    query(
      collection(firestore, 'products'),
      where('isBestseller', '==', true),
      limit(count)
    )
  );
