
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
    if (!rawCategories || !products) return rawCategories || [];

    const productCounts: { [categorySlug: string]: number } = {};
    products.forEach(product => {
      const catSlugs = product.category ? [product.category] : [];
      // This part handles parent categories if needed, but for now we just count direct
      // To get parent counts, we would need to traverse up from product.category
      catSlugs.forEach(slug => {
        productCounts[slug] = (productCounts[slug] || 0) + 1;
      })
    });
    
    const allCategories = rawCategories.map(c => ({...c})); // Create a mutable copy

    const categoryMap: { [id: string]: Category & { children?: Category[] } } = {};
    allCategories.forEach(cat => {
        categoryMap[cat.id] = { ...cat, productCount: 0, subCategories: [] };
    });

    const getChildrenCount = (catId: string): number => {
        const cat = categoryMap[catId];
        if (!cat) return 0;

        let total = productCounts[cat.slug] || 0;
        
        const children = allCategories.filter(c => c.parentId === catId);
        for(const child of children) {
            total += getChildrenCount(child.id);
        }
        return total;
    }
    
    allCategories.forEach(cat => {
        cat.productCount = getChildrenCount(cat.id);
    });

    return allCategories;

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
