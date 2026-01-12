'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { CartDrawer } from '@/components/cart-drawer';
import { Icons } from '@/components/icons';
import { Separator } from './ui/separator';
import type { SiteSettings } from '@/lib/types';
import { useState } from 'react';
import { useCategories } from '@/hooks/use-site-data';
import { Skeleton } from './ui/skeleton';

interface HeaderProps {
  settings?: SiteSettings | null;
  loading: boolean;
}

export function Header({ settings, loading }: HeaderProps) {
  const { totalItems } = useCart();
  const { categories, loading: categoriesLoading } = useCategories();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logoUrl = settings?.logoUrl;
  const announcementMessage = settings?.announcementMessage;

  const NavLinks = () => (
    <>
    {categories.map((category) => (
      <Link
        key={category.id}
        href={`/products?category=${category.slug}`}
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        {category.name}
      </Link>
    ))}
    </>
  );

  const NavLinksSkeleton = () => (
    <div className="flex items-center gap-6">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-28" />
    </div>
  );
  
  const MobileNavLinks = () => (
     <>
      {categories.map((category) => (
        <SheetClose asChild key={category.id}>
          <Link
            href={`/products?category=${category.slug}`}
            className="font-medium text-foreground/80 hover:text-foreground"
          >
            {category.name}
          </Link>
        </SheetClose>
      ))}
     </>
  );

  const MobileNavLinksSkeleton = () => (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-5 w-40" />
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      {loading ? (
        <Skeleton className="h-8 w-full" />
      ) : (
        announcementMessage && (
          <div className="bg-primary text-primary-foreground text-center text-sm p-2">
            {announcementMessage}
          </div>
        )
      )}
      <div className="container">
        <div className="flex h-20 items-center justify-between gap-6">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-2 md:hidden">
             <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icons.menu />
                  <span className="sr-only">Ouvrir le menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                 <div className="p-4 border-b">
                    <Logo imageUrl={logoUrl} onClick={() => setIsMobileMenuOpen(false)} />
                  </div>
                  <nav className="flex flex-col gap-4 p-4">
                    {categoriesLoading ? <MobileNavLinksSkeleton /> : <MobileNavLinks />}
                  </nav>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon">
                <Icons.search className="h-5 w-5" />
                <span className="sr-only">Rechercher</span>
            </Button>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
             <Logo imageUrl={logoUrl} />
             <nav className="flex items-center gap-6">
              {categoriesLoading ? <NavLinksSkeleton /> : <NavLinks />}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 hidden md:flex justify-center">
            <div className="relative w-full max-w-md">
                <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Rechercher un produit..."
                className="pl-9 bg-muted border-none"
                />
            </div>
          </div>
          
          {/* Right section: Actions */}
          <div className="flex items-center justify-end gap-2">
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
             <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Icons.user className="h-5 w-5" />
                  <span className="sr-only">Connexion</span>
             </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
