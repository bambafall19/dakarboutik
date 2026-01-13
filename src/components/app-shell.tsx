
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useSiteSettings, useCategories } from '@/hooks/use-site-data';
import { MainSidebar } from './main-sidebar';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';
import { MobileNav } from './mobile-nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { categories, loading: categoriesLoading } = useCategories();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <MainSidebar 
          categories={categories} 
          loading={categoriesLoading} 
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <div className="flex flex-col">
          <Header
            settings={settings}
            loading={settingsLoading}
            categories={categories}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />
          <main className="flex-1 bg-background">
            <div className="container py-6">{children}</div>
          </main>
          <Footer settings={settings} />
        </div>
      </div>
      <SheetContent side="left" className="w-full max-w-sm">
        <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
        <MobileNav items={categories} onLinkClick={() => setIsMobileMenuOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
