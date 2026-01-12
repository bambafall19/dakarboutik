
'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { CartDrawer } from '@/components/cart-drawer';
import { Icons } from '@/components/icons';
import type { SiteSettings } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/use-site-data';
import { MainNav } from './main-nav';

interface HeaderProps {
  settings?: SiteSettings | null;
  loading: boolean;
}

export function Header({ settings, loading }: HeaderProps) {
  const { totalItems } = useCart();
  const { categories } = useCategories();

  const logoUrl = settings?.logoUrl;
  const announcementMessage = settings?.announcementMessage;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      {announcementMessage && !loading && (
        <div className="bg-secondary text-secondary-foreground text-center text-xs p-2">
          {announcementMessage}
        </div>
      )}
      <div className="container flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Logo imageUrl={logoUrl} />
          <div className="hidden lg:flex">
            <MainNav items={categories} />
          </div>
        </div>

        <div className="flex-1 hidden md:flex max-w-xs">
          <div className="relative w-full mx-auto flex">
            <div className="relative flex-1">
              <Input
                placeholder="Rechercher un produit..."
                className="focus-visible:ring-primary"
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              >
                <Icons.search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/login">
              <Icons.user className="h-5 w-5" />
              <span className="sr-only">Mon compte</span>
            </Link>
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
