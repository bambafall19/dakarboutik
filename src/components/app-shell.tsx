
'use client';

import { Suspense, useState } from 'react';
import { Footer } from '@/components/footer';
import { useSiteSettings, useCategories } from '@/hooks/use-site-data';
import { HeaderWrapper } from './header-wrapper';
import { usePathname } from 'next/navigation';
import { MainSidebar } from './main-sidebar';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';
import { MobileNav } from './mobile-nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { categories, loading: categoriesLoading } = useCategories();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/login';

  if (isAdmin || isLogin) {
    return <>{children}</>;
  }

  return (
    <Suspense>
      <div className="grid lg:grid-cols-[80px_1fr] min-h-screen bg-muted/40">
        <MainSidebar 
            categories={categories} 
            loading={categoriesLoading}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <div className="flex flex-col">
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
      </div>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-full max-w-sm">
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
            <MobileNav items={categories} onLinkClick={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </Suspense>
  );
}
