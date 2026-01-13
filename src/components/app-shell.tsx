
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useSiteSettings, useCategories } from '@/hooks/use-site-data';
import { MainSidebar } from './main-sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { categories, loading: categoriesLoading } = useCategories();

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <MainSidebar categories={categories} loading={categoriesLoading} />
        <div className="flex flex-col">
            <Header settings={settings} loading={settingsLoading} categories={categories} />
            <main className="flex-1 overflow-auto bg-muted/40">
                <div className="container py-6">
                 {children}
                </div>
            </main>
            <Footer settings={settings} />
        </div>
    </div>
  );
}
