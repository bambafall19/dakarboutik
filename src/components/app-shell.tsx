
'use client';

import { Suspense, useState } from 'react';
import { Footer } from '@/components/footer';
import { useSiteSettings, useCategories } from '@/hooks/use-site-data';
import { HeaderWrapper } from './header-wrapper';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';
import { MobileNav } from './mobile-nav';
import { MobileBottomNav } from './mobile-bottom-nav';
import { SearchSheet } from './search-sheet';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { categories, loading: categoriesLoading } = useCategories();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);

  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/login';

  if (isAdmin || isLogin) {
    return <>{children}</>;
  }

  return (
    <Suspense>
      <div className="flex flex-col min-h-screen bg-muted/40">
        <HeaderWrapper
            settings={settings}
            settingsLoading={settingsLoading}
            categories={categories}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 bg-background pb-20">
            <div className="container py-6">{children}</div>
        </main>
        <Footer settings={settings} />
        <MobileBottomNav 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          onSearchClick={() => setIsSearchSheetOpen(true)}
        />
      </div>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-full max-w-sm flex flex-col">
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
            <MobileNav items={categories} onLinkClick={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>
      <SearchSheet open={isSearchSheetOpen} onOpenChange={setIsSearchSheetOpen} />
    </Suspense>
  );
}
