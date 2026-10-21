'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Category, SiteSettings } from '@/lib/types';

export type SiteDataSeed = {
  settings: SiteSettings | null;
  categories: Category[] | null;
  products?: unknown[] | null;
};

export const SiteDataContext = createContext<SiteDataSeed>({
  settings: null,
  categories: null,
  products: null,
});

export function SiteDataProvider({
  settings = null,
  categories = null,
  products = null,
  children,
}: SiteDataSeed & { children: React.ReactNode }) {
  const value = useMemo<SiteDataSeed>(
    () => ({ settings, categories, products }),
    [settings, categories, products]
  );

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteDataSeed(): SiteDataSeed {
  return useContext(SiteDataContext);
}
