'use client';

import { Suspense, useState, useEffect } from 'react';
import { Footer } from '@/components/footer';
import { useSiteSettings, useCategories } from '@/hooks/use-site-data';
import { HeaderWrapper } from './header-wrapper';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetDescription } from './ui/sheet';
import { MobileNav } from './mobile-nav';
import { MobileBottomNav } from './mobile-bottom-nav';
import { SearchSheet } from './search-sheet';
import { WhatsAppButton } from './whatsapp-button';
import { CookieConsentBanner } from './cookie-consent-banner';
import { useSnow } from '@/hooks/use-snow';
import Snowfall from './snowfall';
import { MaintenanceBanner } from './maintenance-banner';

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
  const { isSnowing } = useSnow();

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
      <div className="min-h-screen w-full">
        {isSnowing && <Snowfall />}
        <MaintenanceBanner settings={settings} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
        >
          Aller au contenu principal
        </a>
        <HeaderWrapper
            settings={settings}
            settingsLoading={settingsLoading}
            categories={categories}
            categoriesLoading={categoriesLoading}
            onMobileMenuClick={() => setIsMobileMenuOpen(true)}
            onSearchClick={handleSearchClick}
        />
        <main id="main-content">
            <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">
                {children}
            </div>
        </main>
        <div className="hidden md:block">
          <Footer settings={settings} />
        </div>
        <WhatsAppButton />
        <CookieConsentBanner />
        <ClientOnly>
          <div className="md:hidden">
            <MobileBottomNav 
              onMenuClick={() => setIsMobileMenuOpen(true)} 
            />
          </div>
        </ClientOnly>
      </div>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-full max-w-sm flex flex-col p-0">
            <SheetDescription className="sr-only">
              Menu principal : raccourcis boutique, catégories, support et informations légales.
            </SheetDescription>
            <MobileNav items={categories} settings={settings} onLinkClick={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>
      <SearchSheet open={isSearchSheetOpen} onOpenChange={setIsSearchSheetOpen} />
    </Suspense>
  );
}
