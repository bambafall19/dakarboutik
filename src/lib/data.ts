
import { HardDrive, MemoryStick, Cpu, Headset, Router, Tv, Smartphone, Tablet, Laptop, Plug } from 'lucide-react';
import type { ImagePlaceholder } from './placeholder-images';
import { findImage } from './placeholder-images';
import type { Banner, Category, Product, SimpleCategory, SiteSettings } from './types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  orderBy,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';

const { firestore } = initializeFirebase();

const categories: Category[] = [
  {
    id: 'cat-informatique',
    name: 'Informatique',
    slug: 'informatique',
    icon: Laptop,
    subCategories: [
      { id: 'sub-pc', name: 'PC', slug: 'pc' },
      { id: 'sub-ordinateur-portable', name: 'Ordinateur Portable', slug: 'ordinateur-portable' },
      { id: 'sub-carte-graphique', name: 'Carte graphique', slug: 'carte-graphique' },
      { id: 'sub-souris', name: 'Souris', slug: 'souris' },
      { id: 'sub-clavier', name: 'Clavier', slug: 'clavier' },
      { id: 'sub-boitier-pc', name: 'Boîtier PC', slug: 'boitier-pc' },
      { id: 'sub-processeur', name: 'Processeur', slug: 'processeur' },
      { id: 'sub-convertisseur', name: 'Convertisseur, Câble & Adaptateur', slug: 'convertisseur-cable-adaptateur' },
    ],
  },
  {
    id: 'cat-accessoires',
    name: 'Accessoires Informatiques',
    slug: 'accessoires-informatiques',
    icon: Plug,
    subCategories: [
      { id: 'sub-lecteur-multimedia', name: 'Lecteur multimédia', slug: 'lecteur-multimedia' },
      { id: 'sub-routeur', name: 'Routeur', slug: 'routeur' },
      { id: 'sub-casque-info', name: 'Casque', slug: 'casque-info' },
      { id: 'sub-carte-mere', name: 'Carte Mère', slug: 'carte-mere' },
      { id: 'sub-carte-memoire', name: 'Carte mémoire', slug: 'carte-memoire' },
      { id: 'sub-cle-usb', name: 'Clé USB', slug: 'cle-usb' },
      { id: 'sub-disque-dur-externe', name: 'Disque dur externe', slug: 'disque-dur-externe' },
      { id: 'sub-disque-dur-interne', name: 'Disque dur interne', slug: 'disque-dur-interne' },
      { id: 'sub-alimentation-pc', name: 'Alimentation PC', slug: 'alimentation-pc' },
      { id: 'sub-ventilateur-pc', name: 'Ventilateur PC', slug: 'ventilateur-pc' },
    ],
  },
  {
    id: 'cat-telephones-tablettes',
    name: 'Téléphones & Tablettes',
    slug: 'telephones-tablettes',
    icon: Smartphone,
    subCategories: [
      { id: 'sub-iphone', name: 'iPhone', slug: 'iphone' },
      { id: 'sub-samsung-phone', name: 'Samsung', slug: 'samsung-phone' },
      { id: 'sub-tecno', name: 'Tecno', slug: 'tecno' },
      { id: 'sub-telephones-fixes', name: 'Téléphones fixes', slug: 'telephones-fixes' },
      { id: 'sub-accessoires-telephones', name: 'Accessoires téléphones', slug: 'accessoires-telephones' },
      { id: 'sub-apple-tablet', name: 'Apple', slug: 'apple-tablet' },
      { id: 'sub-microsoft-tablet', name: 'Microsoft', slug: 'microsoft-tablet' },
      { id: 'sub-samsung-tablet', name: 'Samsung (Tablettes)', slug: 'samsung-tablet' },
      { id: 'sub-tablettes-educatives', name: 'Tablettes éducatives', slug: 'tablettes-educatives' },
      { id: 'sub-accessoires-tablettes', name: 'Accessoires tablettes', slug: 'accessoires-tablettes' },
    ],
  },
];

const banners: Banner[] = [
  {
    id: 'banner1',
    title: 'Les nouveaux smartphones sont arrivés !',
    image: findImage('banner-1'),
    linkUrl: '/products?category=telephones-tablettes',
  },
  {
    id: 'banner2',
    title: 'Le son immersif à votre portée',
    image: findImage('banner-2'),
    linkUrl: '/products?category=accessoires-informatiques',
  },
  {
    id: 'banner3',
    title: 'Boostez votre productivité',
    image: findImage('banner-3'),
    linkUrl: '/products?category=informatique',
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

export const getCategories = (): Category[] => categories;

export const getSimpleCategories = (): SimpleCategory[] => {
  return categories.map(({ icon, ...rest }) => rest);
}

export const getCategoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
export const getBanners = () => banners;

export const getNewArrivals = async (count: number = 4) =>
  await fetchProducts(
    query(
      collection(firestore, 'products'),
      orderBy('createdAt', 'desc'),
      limit(count)
    )
  );

export const getBestsellers = async (count: number = 4) =>
  await fetchProducts(
    query(
      collection(firestore, 'products'),
      where('isBestseller', '==', true),
      where('status', '==', 'active'),
      limit(count)
    )
  );

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const settingsRef = doc(firestore, 'settings', 'siteConfig');
  const docSnap = await getDoc(settingsRef);

  if (docSnap.exists()) {
    return docSnap.data() as SiteSettings;
  } else {
    // Return default settings if nothing is in the database
    return {
      logoUrl: "https://picsum.photos/seed/dakarboutik-logo/100/100",
      announcementMessage: 'Livraison gratuite à partir de 50 000 F CFA !',
    };
  }
};
