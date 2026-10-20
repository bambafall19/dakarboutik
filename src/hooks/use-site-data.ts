'use client';

import { useMemo } from 'react';
import type { Product, SiteSettings, Category, Banner, SimpleCategory, FaqItem } from '@/lib/types';
import { getBanners as getStaticBanners } from '@/lib/data';
import { buildCategoryHierarchy } from '@/lib/data-helpers';
import { useApiData } from './use-api-data';

// --- Products ---
export function useProducts() {
  const { data, loading, error } = useApiData<Product[]>('/api/products');
  const products = useMemo(() => (data || []).filter(p => p.status === 'active'), [data]);
  return { products, loading, error };
}

export function useAdminProducts() {
  const { data, loading, error } = useApiData<Product[]>('/api/products');
  return { products: data || [], loading, error };
}

export function useProductsById(id: string) {
  const { data, loading, error } = useApiData<Product[]>(id ? '/api/products' : null);
  const product = useMemo(() => (data || []).find(p => p.id === id) || null, [data, id]);
  return { product, loading, error };
}

export function useProductsBySlug(slug: string) {
  const { data, loading, error } = useApiData<Product>(slug ? `/api/products?slug=${encodeURIComponent(slug)}` : null);
  return { product: data, loading, error };
}

// --- Site Settings ---
export function useSiteSettings() {
  const { data, loading, error } = useApiData<SiteSettings>('/api/settings');

  const defaultSettings: SiteSettings = {
    id: 'siteConfig',
    logoUrl: null,
    announcementMessage1: "Nouveaux Arrivages : Découvrez notre dernière collection d'ordinateurs portables.",
    whatsappNumber: '221776384676',
    supportPhone: '33 123 45 67',
    supportEmail: 'contact@exemple.com'
  };

  return { settings: data || defaultSettings, loading, error };
}

// --- Banners ---
export function useBanners() {
  const { data, loading, error } = useApiData<Banner[]>('/api/banners');
  const defaultBanners = useMemo(() => getStaticBanners(), []);

  const displayedBanners = useMemo(() => {
    if (loading) return defaultBanners;
    if (data && data.length > 0) return data;
    return defaultBanners;
  }, [data, defaultBanners, loading]);

  return { banners: displayedBanners, loading, error };
}

// --- Categories ---
export function useCategories() {
  const { products, loading: productsLoading } = useProducts();
  const { data, loading: categoriesLoading, error } = useApiData<Category[]>('/api/categories');

  const rawCategories = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.name.localeCompare(b.name));
  }, [data]);

  const categoriesWithCounts = useMemo(() => {
    if (!rawCategories.length || !products) return [];

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
    };

    return rawCategories.map(cat => ({ ...cat, productCount: getChildrenCount(cat.id) }));
  }, [rawCategories, products]);

  const categories = useMemo(() => {
    if (!rawCategories.length) return [];
    return buildCategoryHierarchy(rawCategories);
  }, [rawCategories]);

  const simpleCategories = useMemo((): SimpleCategory[] => {
    return rawCategories.map(({ id, name, slug, parentId }) => ({ id, name, slug, parentId }));
  }, [rawCategories]);

  return {
    categories,
    rawCategories,
    categoriesWithCounts,
    simpleCategories,
    loading: categoriesLoading || productsLoading,
    error,
  };
}

// --- FAQs ---
export function useFaqs() {
  const { data, loading, error } = useApiData<FaqItem[]>('/api/faq');
  return { faqs: data || [], loading, error };
}
