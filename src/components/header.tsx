
'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { CartDrawer } from '@/components/cart-drawer';
import { Icons } from '@/components/icons';
import { getCategories } from '@/lib/data';
import { useState } from 'react';
import { Separator } from './ui/separator';
import type { SiteSettings } from '@/lib/types';

const categories = getCategories();

interface HeaderProps {
  settings?: SiteSettings;
}

export function Header({ settings }: HeaderProps) {
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logoUrl = settings?.logoUrl;
  const announcementMessage = settings?.announcementMessage;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      {announcementMessage && (
        <div className="bg-primary text-primary-foreground text-center text-sm p-2">
          {announcementMessage}
        </div>
      )}
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Mobile Menu - Hidden on desktop */}
          <div className="flex items-center md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                      <Icons.menu />
                      <span className="sr-only">Ouvrir le menu</span>
                  </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="pr-0">
                  <div className="flex flex-col h-full">
                      <div className="p-4">
                      <Logo imageUrl={logoUrl} />
                      </div>
                      <Separator />
                      <nav className="flex flex-col gap-4 p-4">
                      {categories.map((category) => (
                          <Link
                          key={category.id}
                          href={`/products?category=${category.slug}`}
                          className="font-medium text-foreground/80 hover:text-foreground"
                          onClick={() => setIsMobileMenuOpen(false)}
                          >
                          {category.name}
                          </Link>
                      ))}
                      </nav>
                  </div>
                  </SheetContent>
              </Sheet>
          </div>
          <Logo imageUrl={logoUrl} />
        </div>
        
        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center justify-center gap-6 text-sm font-medium text-muted-foreground">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="hover:text-primary transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center justify-end space-x-2">
          <div className="relative flex-1 justify-end hidden sm:flex max-w-xs">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              className="pl-9 bg-background"
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Icons.logo className="h-5 w-5" />
                <span className="sr-only">Ouvrir le panier</span>
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <CartDrawer />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
