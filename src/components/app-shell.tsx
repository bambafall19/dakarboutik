
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useSiteSettings, useCategories } from '@/hooks/use-site-data';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { categories, loading: categoriesLoading } = useCategories();

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} loading={settingsLoading} categories={categories} />
      <main className="flex-1">
        <div className="container py-6">
          {children}
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
