'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { CartDrawer } from '@/components/cart-drawer';
import { Icons } from '@/components/icons';
import type { SiteSettings } from '@/lib/types';
import { useCategories } from '@/hooks/use-site-data';
import { Skeleton } from './ui/skeleton';
import { SidebarTrigger } from './ui/sidebar';

interface HeaderProps {
  settings?: SiteSettings | null;
  loading: boolean;
}

export function Header({ settings, loading }: HeaderProps) {
  const { totalItems } = useCart();
  const { categories, loading: categoriesLoading } = useCategories();

  const logoUrl = settings?.logoUrl;
  const announcementMessage = settings?.announcementMessage;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      {loading ? (
        <Skeleton className="h-8 w-full" />
      ) : (
        announcementMessage && (
          <div className="bg-primary text-primary-foreground text-center text-sm p-2">
            {announcementMessage}
          </div>
        )
      )}
      <div className="container flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden"/>
          <div className="hidden md:block">
            <Logo imageUrl={logoUrl} />
          </div>
        </div>

        <div className="flex-1">
          <div className="relative w-full max-w-xl mx-auto">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit, une marque ou une catégorie..."
              className="pl-9 bg-muted border-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon">
            <Icons.user className="h-5 w-5" />
            <span className="sr-only">Mon compte</span>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Icons.shoppingBag className="h-5 w-5" />
                <span className="sr-only">Ouvrir le panier</span>
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <CartDrawer />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
