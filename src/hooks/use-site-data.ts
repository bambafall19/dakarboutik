
'use client';

import { useMemo, useCallback, useState } from 'react';
import { collection, query, where, doc, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import type { Product, SiteSettings, Category, Banner, SimpleCategory } from '@/lib/types';
import { getBanners as getStaticBanners } from '@/lib/data';
import { buildCategoryHierarchy, getAllChildCategorySlugs } from '@/lib/data-helpers';

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
        return query(collection(firestore, 'products'), where('slug', '==', slug), where('status', '==', 'active'));
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
  const [key, setKey] = useState(0);
  const { products } = useProducts();

  const categoriesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'categories'), orderBy('name'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, key]);
  
  const { data: rawCategories, loading, error } = useCollection<Category>(categoriesQuery);

  const refetch = useCallback(() => {
    setKey(prev => prev + 1);
  }, []);

  const categoriesWithCounts = useMemo(() => {
    if (!rawCategories) return [];
    
    const productCounts: { [categorySlug: string]: number } = {};
    for (const product of products) {
        productCounts[product.category] = (productCounts[product.category] || 0) + 1;
    }

    const categoryMap: { [id: string]: Category & { totalProductCount: number }} = {};

    rawCategories.forEach(cat => {
        categoryMap[cat.id] = { ...cat, productCount: productCounts[cat.slug] || 0, totalProductCount: 0 };
    });

    const getChildrenCount = (catId: string): number => {
        let total = categoryMap[catId].productCount || 0;
        const children = rawCategories.filter(c => c.parentId === catId);
        for(const child of children) {
            total += getChildrenCount(child.id);
        }
        return total;
    }

    Object.values(categoryMap).forEach(cat => {
        cat.productCount = getChildrenCount(cat.id);
    });

    return Object.values(categoryMap);

  }, [rawCategories, products]);


  const categories = useMemo(() => {
    if (!categoriesWithCounts) return [];
    return buildCategoryHierarchy(categoriesWithCounts);
  }, [categoriesWithCounts]);
  
  const simpleCategories = useMemo((): SimpleCategory[] => {
    if (!rawCategories) return [];
    // Strips icon and subcategories for a flat list
    return rawCategories.map(({ id, name, slug, parentId }) => ({ id, name, slug, parentId }));
  }, [rawCategories]);


  return { categories, rawCategories: rawCategories || [], simpleCategories, loading, error, refetch };
}
