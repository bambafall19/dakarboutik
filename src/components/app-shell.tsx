'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useSiteSettings } from '@/hooks/use-site-data';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useSiteSettings();

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header settings={settings} loading={loading} />
      <main className="flex-1">{children}</main>
      <Footer logoUrl={settings?.logoUrl} />
    </div>
  );
}
