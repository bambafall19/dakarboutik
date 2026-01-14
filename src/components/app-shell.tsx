
'use client';

import { Suspense, useState, useEffect } from 'react';
import { Footer } from '@/components/footer';
import { useSiteSettings, useCategories } from '@/hooks/use-site-data';
import { HeaderWrapper } from './header-wrapper';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';
import { MobileNav } from './mobile-nav';
import { MobileBottomNav } from './mobile-bottom-nav';
import { MainSidebar } from './main-sidebar';
import { SearchSheet } from './search-sheet';

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}


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
  
  const handleSearchClick = () => {
    setIsSearchSheetOpen(true);
  }

  return (
    <Suspense>
      <div className="grid min-h-screen w-full md:grid-cols-[80px_1fr]">
        <MainSidebar 
          categories={categories} 
          loading={categoriesLoading}
          settings={settings}
          settingsLoading={settingsLoading}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <div className="flex flex-col">
          <HeaderWrapper
              settings={settings}
              settingsLoading={settingsLoading}
              categories={categories}
              categoriesLoading={categoriesLoading}
              onMobileMenuClick={() => setIsMobileMenuOpen(true)}
              onSearchClick={handleSearchClick}
          />
          <main className="flex-1 bg-background">
              <div className="pb-20 md:pb-0">
                {children}
              </div>
          </main>
          <Footer settings={settings} />
        </div>
        <ClientOnly>
          <MobileBottomNav 
            onMenuClick={() => setIsMobileMenuOpen(true)} 
            onSearchClick={handleSearchClick}
          />
        </ClientOnly>
      </div>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-full max-w-sm flex flex-col p-0">
            <MobileNav items={categories} onLinkClick={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>
      <SearchSheet open={isSearchSheetOpen} onOpenChange={setIsSearchSheetOpen} />
    </Suspense>
  );
}
