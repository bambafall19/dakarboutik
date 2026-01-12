'use client';

import { useSiteSettings } from '@/hooks/use-site-data';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import { MainSidebar } from './main-sidebar';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useSiteSettings();
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = ['/login'].includes(pathname);

  // Do not show sidebar/header/footer on auth routes
  if (isAuthRoute) {
    return <main>{children}</main>;
  }

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col',
        !isAdminRoute && 'bg-secondary/20'
      )}
    >
      <Sidebar variant={isAdminRoute ? 'sidebar' : 'inset'} collapsible="icon">
        <SidebarContent>
          <MainSidebar />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header settings={settings} loading={loading} />
        <main className="flex-1 container py-8">{children}</main>
        <Footer logoUrl={settings?.logoUrl} />
      </SidebarInset>
    </div>
  );
}
