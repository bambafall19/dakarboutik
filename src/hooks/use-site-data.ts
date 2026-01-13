
'use client';

import { useMemo } from 'react';
import { collection, query, where, doc, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import type { Product, SiteSettings, Category, Banner } from '@/lib/types';
import { getBanners as getStaticBanners } from '@/lib/data';

// --- Products ---
export function useProducts() {
  const firestore = useFirestore();
  const productsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), where('status', '==', 'active'));
  }, [firestore]);

  const { data: products, loading, error } = useCollection<Product>(productsQuery);

  return { products: products || [], loading, error };
}

export function useAdminProducts() {
  const firestore = useFirestore();
  const productsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'));
  }, [firestore]);

  const { data: products, loading, error } = useCollection<Product>(productsQuery);

  return { products: products || [], loading, error };
}

export function useProductsById(id: string) {
    const firestore = useFirestore();
    const productRef = useMemo(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'products', id);
    }, [firestore, id]);

    const { data, loading, error } = useDoc<Product>(productRef);

    return { product: data, loading, error };
}

export function useProductsBySlug(slug: string) {
    const firestore = useFirestore();
    const productQuery = useMemo(() => {
        if (!firestore || !slug) return null;
        return query(collection(firestore, 'products'), where('slug', '==', slug));
    }, [firestore, slug]);

    const { data, loading, error } = useCollection<Product>(productQuery);
    
    const product = useMemo(() => (data && data.length > 0 ? data[0] : null), [data]);

    return { product, loading, error };
}


// --- Site Settings ---
export function useSiteSettings() {
  const firestore = useFirestore();
  const settingsRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'siteConfig');
  }, [firestore]);

  const { data: settings, loading, error } = useDoc<SiteSettings>(settingsRef);
  
  const defaultSettings: SiteSettings = {
    logoUrl: null,
    announcementMessage1: "Nouveaux Arrivages : Découvrez notre dernière collection d'ordinateurs portables.",
    whatsappNumber: '221771234567', // Default placeholder number
  };

  return { settings: settings || defaultSettings, loading, error };
}

// --- Banners ---
export function useBanners() {
  const firestore = useFirestore();
  const bannersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'banners');
  }, [firestore]);

  const { data: banners, loading, error } = useCollection<Banner>(bannersQuery);

  const defaultBanners = useMemo(() => getStaticBanners(), []);

  return {
    banners: banners && banners.length > 0 ? banners : defaultBanners,
    loading,
    error,
  };
}


// --- Categories ---
export function useCategories() {
  const firestore = useFirestore();
  const categoriesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'categories'), orderBy('name'));
  }, [firestore]);
  
  const { data: categories, loading, error } = useCollection<Category>(categoriesQuery);

  const nestedCategories = useMemo(() => {
    if (!categories) return [];
    const categoryMap: { [key: string]: Category & { children: Category[] } } = {};
    const topLevelCategories: (Category & { children: Category[] })[] = [];

    for (const category of categories) {
      categoryMap[category.id] = { ...category, children: [] };
    }

    for (const category of categories) {
      if (category.parentId && categoryMap[category.parentId]) {
        categoryMap[category.parentId].children.push(categoryMap[category.id]);
      } else {
        topLevelCategories.push(categoryMap[category.id]);
      }
    }
    
    const buildHierarchy = (cats: (Category & { children: Category[] })[]): Category[] => {
        return cats.map(cat => {
            const { children, ...rest } = cat;
            const subCategories = children.length > 0 ? buildHierarchy(children) : undefined;
            return { ...rest, subCategories };
        })
    }

    return buildHierarchy(topLevelCategories);
  }, [categories]);

  return { categories: nestedCategories, rawCategories: categories || [], loading, error };
}
