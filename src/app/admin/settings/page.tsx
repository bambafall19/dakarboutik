'use client';

import { useSiteSettings } from '@/hooks/use-site-data';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SettingsForm } from '@/components/admin/settings-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { settings, loading } = useSiteSettings();

  return (
    <div className="py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Réglages du site</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-bold mb-8">Réglages du site</h1>
      <div className="max-w-2xl">
        {loading ? <Skeleton className="h-96 w-full" /> : <SettingsForm settings={settings} />}
      </div>
    </div>
  );
}
