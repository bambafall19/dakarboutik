
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useSiteSettings, useCategories } from '@/hooks/use-site-data';
import { MainSidebar } from './main-sidebar';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { categories, loading: categoriesLoading } = useCategories();
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[80px_1fr]">
        <MainSidebar categories={categories} loading={categoriesLoading} />
        <div className="flex flex-col">
            <Header settings={settings} loading={settingsLoading} categories={categories} />
            <main className="flex-1 bg-background">
                <div className="container py-6">
                {children}
                </div>
            </main>
            <Footer settings={settings} />
        </div>
    </div>
  );
}
