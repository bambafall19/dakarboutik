
'use client';

import { Suspense } from 'react';
import { Footer } from '@/components/footer';
import { useSiteSettings, useCategories } from '@/hooks/use-site-data';
import { HeaderWrapper } from './header-wrapper';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { categories, loading: categoriesLoading } = useCategories();
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/login';

  if (isAdmin || isLogin) {
    return <>{children}</>;
  }

  return (
    <Suspense>
        <div className="flex flex-col min-h-screen">
            <HeaderWrapper 
                settings={settings}
                settingsLoading={settingsLoading}
                categories={categories}
            />
            <main className="flex-1 bg-background">
            <div className="container py-6">{children}</div>
            </main>
            <Footer settings={settings} />
        </div>
    </Suspense>
  );
}
