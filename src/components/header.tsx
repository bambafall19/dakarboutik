"use client";

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

const categories = getCategories();

export function Header() {
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Mobile Menu */}
        <div className="md:hidden">
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
                  <Logo />
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

        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        
        {/* Desktop Navigation */}
        <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex gap-6 items-center">
                {categories.map((category) => (
                <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                    {category.name}
                </Link>
                ))}
            </nav>
        </div>
          
        <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9" />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Icons.logo className="h-5 w-5" />
                  <span className="sr-only">Ouvrir le panier</span>
                  {totalItems > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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
