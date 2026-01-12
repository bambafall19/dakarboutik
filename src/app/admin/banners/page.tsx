'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { BannerForm } from '@/components/admin/banner-form';
import { useBanners } from '@/hooks/use-site-data';
import { Skeleton } from '@/components/ui/skeleton';

export default function BannersPage() {
  const { banners, loading } = useBanners();
  const mainBanner = banners.find(b => b.id === 'banner1');

  return (
    <div className="py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Gestion des Bannières</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-bold mb-8">Gestion des Bannières</h1>
      <div className="max-w-2xl">
        {loading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <BannerForm banner={mainBanner} />
        )}
      </div>
    </div>
  );
}
