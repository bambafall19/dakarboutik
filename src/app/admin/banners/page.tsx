
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
  const topSubBanner = banners.find(b => b.id === 'banner-laptops');
  const bottomSubBanner = banners.find(b => b.id === 'banner-accessories');
  const promoBanner1 = banners.find(b => b.id === 'promo-banner-1');
  const promoBanner2 = banners.find(b => b.id === 'promo-banner-2');
  const announcement1 = banners.find(b => b.id === 'announcement-1');
  const announcement2 = banners.find(b => b.id === 'announcement-2');
  const announcement3 = banners.find(b => b.id === 'announcement-3');


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
      
      <div className="space-y-12">
        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-[400px] w-full max-w-2xl" />
            <Skeleton className="h-[400px] w-full max-w-2xl" />
            <Skeleton className="h-[400px] w-full max-w-2xl" />
          </div>
        ) : (
          <>
            {announcement1 && <BannerForm banner={announcement1} title="Barre d'annonce - Image 1" description="Première image de la barre d'annonces défilante." />}
            {announcement2 && <BannerForm banner={announcement2} title="Barre d'annonce - Image 2" description="Deuxième image de la barre d'annonces défilante." />}
            {announcement3 && <BannerForm banner={announcement3} title="Barre d'annonce - Image 3" description="Troisième image de la barre d'annonces défilante." />}
            {mainBanner && <BannerForm banner={mainBanner} title="Bannière Principale (Hero)" description="Modifiez le contenu de la grande bannière sur la page d'accueil." />}
            {topSubBanner && <BannerForm banner={topSubBanner} title="Sous-bannière Supérieure (Hero)" description="Bannière secondaire dans la section hero." />}
            {bottomSubBanner && <BannerForm banner={bottomSubBanner} title="Sous-bannière Inférieure (Hero)" description="Bannière secondaire dans la section hero." />}
            {promoBanner1 && <BannerForm banner={promoBanner1} title="Bannière Promotionnelle 1" description="Bannière affichée sous les catégories." />}
            {promoBanner2 && <BannerForm banner={promoBanner2} title="Bannière Promotionnelle 2" description="Bannière affichée sous les catégories." />}
          </>
        )}
      </div>
    </div>
  );
}
