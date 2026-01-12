
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const logoUrl = settings?.logoUrl;
  const announcementMessage = settings?.announcementMessage;

  const NavLinks = () => (
    <>
    {categories.map((category) => (
      <Link
        key={category.id}
        href={`/products?category=${category.slug}`}
        className="hover:text-primary transition-colors"
      >
        {category.name}
      </Link>
    ))}
    </>
  );

  const NavLinksSkeleton = () => (
    <>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-28" />
    </>
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
    <>
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-5 w-40" />
    </>
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
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Left section: Mobile Menu and Desktop Logo */}
        <div className="flex items-center gap-2">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Icons.menu />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
               <div className="p-4">
                  <Logo imageUrl={logoUrl} onClick={() => setIsMobileMenuOpen(false)} />
                </div>
                <Separator />
                <nav className="flex flex-col gap-4 p-4">
                  {categoriesLoading ? <MobileNavLinksSkeleton /> : <MobileNavLinks />}
                </nav>
            </SheetContent>
          </Sheet>
          <div className="hidden md:block">
            <Logo imageUrl={logoUrl} />
          </div>
        </div>
        
        {/* Mobile Logo & Search */}
         <div className="flex flex-1 items-center justify-center md:hidden">
            {isSearchOpen ? (
                 <div className="relative w-full max-w-sm">
                    <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un produit..."
                        className="pl-9 bg-background"
                        autoFocus
                        onBlur={() => setIsSearchOpen(false)}
                    />
                </div>
            ) : (
                <Logo imageUrl={logoUrl} />
            )}
        </div>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm font-medium text-muted-foreground">
          {categoriesLoading ? <NavLinksSkeleton /> : <NavLinks />}
        </nav>
        
        {/* Right section: Search and Cart */}
        <div className="flex items-center justify-end gap-2">
          <div className="relative flex-1 justify-end hidden sm:flex max-w-xs">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              className="pl-9 bg-background"
            />
          </div>

           <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(true)}>
                <Icons.search className="h-5 w-5" />
                <span className="sr-only">Rechercher</span>
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
