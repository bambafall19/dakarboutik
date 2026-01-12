
'use client';

import { useSiteSettings } from '@/hooks/use-site-data';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { usePathname } from 'next/navigation';
import { HeroSection } from './hero-section';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useSiteSettings();
  const pathname = usePathname();

  const logoUrl = settings?.logoUrl;
  const isHomePage = pathname === '/';

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header settings={settings} loading={loading} />
      {isHomePage && <HeroSection />}
      <main className="flex-1 container">{children}</main>
      <Footer logoUrl={logoUrl} />
    </div>
  );
}
