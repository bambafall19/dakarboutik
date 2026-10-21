'use client';

import { useCallback, useMemo } from 'react';
import type { Product, SiteSettings, Category, Banner, SimpleCategory, FaqItem } from '@/lib/types';
import { buildCategoryHierarchy } from '@/lib/data-helpers';
import { withDefaultSettings } from '@/lib/settings-defaults';
import { useApiData } from './use-api-data';
import { useSiteDataSeed } from '@/context/site-data-context';

// --- Products ---
export function useProducts() {
  const { products: seededProducts } = useSiteDataSeed();
  const { data, loading, error, refetch } = useApiData<Product[]>(
    '/api/products',
    [],
    (seededProducts as Product[]) ?? null
  );
  const products = useMemo(() => (data || []).filter(p => p.status === 'active'), [data]);
  return { products, loading, error, refetch };
}

export function useAdminProducts() {
  const { data, loading, error, refetch } = useApiData<Product[]>('/api/products');
  return { products: data || [], loading, error, refetch };
}

export function useProductsById(id: string) {
  const { data, loading, error, refetch } = useApiData<Product[]>(id ? '/api/products' : null);
  const product = useMemo(() => (data || []).find(p => p.id === id) || null, [data, id]);
  return { product, loading, error, refetch };
}

export function useProductsBySlug(slug: string) {
  const { data, loading, error, refetch } = useApiData<Product>(slug ? `/api/products?slug=${encodeURIComponent(slug)}` : null);
  return { product: data, loading, error, refetch };
}

// --- Site Settings ---
export function useSiteSettings() {
  const { settings: seededSettings } = useSiteDataSeed();
  const { data, loading, error, refetch } = useApiData<SiteSettings>(
    '/api/settings',
    [],
    seededSettings ?? null
  );

  const settings = useMemo(() => withDefaultSettings(data), [data]);

  return { settings, loading, error, refetch };
}

// --- Banners ---
export function useBanners() {
  const { data, loading, error, refetch } = useApiData<Banner[]>('/api/banners');
  return { banners: data || [], loading, error, refetch };
}

// --- Categories ---
export function useCategories() {
  const { categories: seededCategories } = useSiteDataSeed();
  const { products, loading: productsLoading, refetch: refetchProducts } = useProducts();
  const { data, loading: categoriesLoading, error, refetch: refetchCategories } = useApiData<Category[]>(
    '/api/categories',
    [],
    seededCategories ?? null
  );

  const refetch = useCallback(async () => {
    await Promise.all([refetchCategories(), refetchProducts()]);
  }, [refetchCategories, refetchProducts]);

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
    refetch,
  };
}

// --- FAQs ---
export function useFaqs() {
  const { data, loading, error, refetch } = useApiData<FaqItem[]>('/api/faq');
  return { faqs: data || [], loading, error, refetch };
}
