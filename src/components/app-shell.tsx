'use client';

import { useSiteSettings } from '@/hooks/use-site-data';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useSiteSettings();

  const logoUrl = settings?.logoUrl;

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header settings={settings} loading={loading} />
      <main className="flex-1">{children}</main>
      <Footer logoUrl={logoUrl} />
    </div>
  );
}
