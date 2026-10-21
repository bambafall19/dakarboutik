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
import { AdminError } from '@/components/admin/admin-error';

export default function SettingsPage() {
  const { settings, loading, error, refetch } = useSiteSettings();

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
      <h1 className="font-headline text-3xl font-extrabold mb-8">Réglages du site</h1>
      <div className="max-w-2xl">
        {loading ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : error ? (
          <AdminError description={error.message} onRetry={refetch} />
        ) : (
          <SettingsForm settings={settings} onSaved={refetch} />
        )}
      </div>
    </div>
  );
}
