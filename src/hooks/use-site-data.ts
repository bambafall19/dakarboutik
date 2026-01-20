

'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { collection, query, where, doc, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import type { Product, SiteSettings, Category, Banner, SimpleCategory } from '@/lib/types';
import { getBanners as getStaticBanners } from '@/lib/data';
import { buildCategoryHierarchy } from '@/lib/data-helpers';

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
    id: 'siteConfig',
    logoUrl: null,
    announcementMessage1: "Nouveaux Arrivages : Découvrez notre dernière collection d'ordinateurs portables.",
    whatsappNumber: '221771234567', // Default placeholder number
    supportPhone: '33 123 45 67',
    supportEmail: 'contact@exemple.com'
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

  const displayedBanners = useMemo(() => {
    if (loading) {
      return defaultBanners; // Show static data while loading to prevent layout shifts
    }
    if (banners && banners.length > 0) {
      return banners;
    }
    return defaultBanners;
  }, [banners, defaultBanners, loading]);

  return {
    banners: displayedBanners,
    loading,
    error,
  };
}


// --- Categories ---
export function useCategories() {
  const firestore = useFirestore();
  const [key, setKey] = useState(0);
  const { products, loading: productsLoading } = useProducts();

  const categoriesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'categories'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, key]);
  
  const { data: unsortedRawCategories, loading: categoriesLoading, error } = useCollection<Category>(categoriesQuery);

  const rawCategories = useMemo(() => {
    if (!unsortedRawCategories) return null;
    return [...unsortedRawCategories].sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.name.localeCompare(b.name));
  }, [unsortedRawCategories]);

  const refetch = useCallback(() => {
    setKey(prev => prev + 1);
  }, []);
  
  const categoriesWithCounts = useMemo(() => {
    if (!rawCategories || !products) return [];

    const productCounts: { [categorySlug: string]: number } = {};
    products.forEach(product => {
      productCounts[product.category] = (productCounts[product.category] || 0) + 1;
    });

    const categoryMap: { [id: string]: Category } = {};
    rawCategories.forEach(cat => {
      categoryMap[cat.id] = { ...cat, productCount: 0, subCategories: [] };
    });

    const getChildrenCount = (catId: string): number => {
      const cat = categoryMap[catId];
      if (!cat) return 0;
      let total = productCounts[cat.slug] || 0;
      
      const children = rawCategories.filter(c => c.parentId === catId);
      for (const child of children) {
          total += getChildrenCount(child.id);
      }
      return total;
    }

    return rawCategories.map(cat => ({
      ...cat,
      productCount: getChildrenCount(cat.id),
    }));

  }, [rawCategories, products]);


  const categories = useMemo(() => {
    if (!rawCategories) return [];
    return buildCategoryHierarchy(rawCategories);
  }, [rawCategories]);
  
  const simpleCategories = useMemo((): SimpleCategory[] => {
    if (!rawCategories) return [];
    return rawCategories.map(({ id, name, slug, parentId }) => ({ id, name, slug, parentId }));
  }, [rawCategories]);


  return { 
    categories, 
    rawCategories: rawCategories || [], 
    simpleCategories, 
    loading: categoriesLoading || productsLoading, 
    error, 
    refetch 
  };
}
