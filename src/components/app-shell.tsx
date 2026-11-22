'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
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
import { internalTestEnabled, setInternalTestEnabled } from '@/lib/engagement-client';

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


function InternalTestBanner({ pathname }: { pathname: string }) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const sync = () => setActive(internalTestEnabled());
    sync();
    window.addEventListener('pageshow', sync);
    return () => window.removeEventListener('pageshow', sync);
  }, [pathname]);

  function deactivate() {
    try {
      setInternalTestEnabled(false);
      setActive(false);
    } catch {
      setError(true);
    }
  }

  return active ? (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-b border-amber-300 bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-950">
      <span role="status">Test interne actif · visites et clics exclus des statistiques dans cet onglet</span>
      <button
        type="button"
        onClick={deactivate}
        aria-label="Désactiver le mode Test interne"
        className="min-h-11 rounded-md border border-amber-700 bg-white px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Désactiver
      </button>
      {error && <p role="alert" className="w-full text-center">Impossible de désactiver le mode Test interne.</p>}
    </div>
  ) : null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { categories, loading: categoriesLoading } = useCategories();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const menuOpener = useRef<HTMLElement | null>(null);
  const helpAfterMenuClose = useRef(false);
  const { isSnowing } = useSnow();

  useEffect(() => {
    helpAfterMenuClose.current = false;
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const openMobileMenu = () => {
    menuOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    helpAfterMenuClose.current = false;
    setIsMobileMenuOpen(true);
  };

  const openHelpAfterMenu = () => {
    helpAfterMenuClose.current = true;
    setIsMobileMenuOpen(false);
  };

  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/login';

  if (isAdmin || isLogin || pathname === '/acces-boutique' || pathname === '/recuperer-acces') {
    return <>{children}</>;
  }
  if (pathname.startsWith('/boutiques') || pathname === '/forfaits' || pathname === '/favoris') {
    return <><InternalTestBanner pathname={pathname} />{children}<WhatsAppButton /></>;
  }
  if (pathname.startsWith('/commercant')) {
    return <>{children}<WhatsAppButton /></>;
  }

  const handleSearchClick = () => {
    setIsSearchSheetOpen(true);
  }

  return (
    <Suspense>
      <div className="min-h-screen w-full">
        {isSnowing && <Snowfall />}
        <InternalTestBanner pathname={pathname} />
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
            onMobileMenuClick={openMobileMenu}
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
              onMenuClick={openMobileMenu}
            />
          </div>
        </ClientOnly>
      </div>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent animated={false} side="left" className="w-[calc(100%-1rem)] max-w-sm flex flex-col gap-0 p-0 [&>button]:hidden motion-reduce:animate-none motion-reduce:transition-none"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            // The sheet is unmounted here: its focus trap and pointer lock are released.
            if (menuOpener.current?.isConnected) menuOpener.current.focus({ preventScroll: true });
            if (helpAfterMenuClose.current) {
              helpAfterMenuClose.current = false;
              window.dispatchEvent(new Event('dakarboutik:open-help'));
            }
          }}>
            <SheetDescription className="sr-only">
              Menu principal : raccourcis boutique, catégories, support et informations légales.
            </SheetDescription>
            <MobileNav items={categories} settings={settings} onLinkClick={() => setIsMobileMenuOpen(false)} onHelpClick={openHelpAfterMenu} />
        </SheetContent>
      </Sheet>
      <SearchSheet open={isSearchSheetOpen} onOpenChange={setIsSearchSheetOpen} />
    </Suspense>
  );
}
