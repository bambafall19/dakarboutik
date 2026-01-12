
'use client';

import { useMemo } from 'react';
import { collection, query, where, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import type { Product, SiteSettings, Category, Banner } from '@/lib/types';
import { getCategories as getStaticCategories } from '@/lib/data';
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
    logoUrl: "https://picsum.photos/seed/dakarboutik-logo/100/100",
    announcementMessage: 'Livraison gratuite à partir de 50 000 F CFA !',
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


// --- Categories (currently static, but wrapped in a hook for consistency) ---
export function useCategories() {
    const categories = useMemo(() => getStaticCategories(), []);
    return { categories, loading: false, error: null };
}
