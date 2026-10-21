import { AppShell } from '@/components/app-shell';
import { SiteDataProvider } from '@/context/site-data-context';
import { getSiteSettings } from '@/lib/site-settings-server';
import { getCategories } from '@/lib/data-firebase';

export default async function AppShellServer({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategories()]);

  return (
    <SiteDataProvider settings={settings} categories={categories}>
      <AppShell>{children}</AppShell>
    </SiteDataProvider>
  );
}
