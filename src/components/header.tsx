
'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { CartDrawer } from '@/components/cart-drawer';
import { Icons } from '@/components/icons';
import type { SiteSettings, Category } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Phone } from 'lucide-react';
import { MainNav } from './main-nav';

interface HeaderProps {
  settings?: SiteSettings | null;
  loading: boolean;
  categories: Category[];
  categoriesLoading: boolean;
  onMobileMenuClick: () => void;
  onSearchClick: () => void;
}

export function Header({ settings, loading, categories, onMobileMenuClick, onSearchClick }: HeaderProps) {
  const { totalItems } = useCart();
  
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-lg">
      {/* Top bar */}
      <div className="bg-nav text-nav-foreground">
        <div className="container flex h-8 items-center justify-between text-xs">
            <div className="flex items-center gap-2">
                <Phone className="h-3 w-3"/>
                <span>+221 77 123 45 67</span>
            </div>
            <div className="hidden md:block">
                <p>
                    {settings?.announcementMessage1} 
                    <Link href="/products" className="underline ml-2">Acheter</Link>
                </p>
            </div>
             <div>
                Eng / Location
            </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b">
        <div className="container flex h-16 items-center">
            {/* Mobile Header: Menu, Logo, Cart */}
            <div className="flex md:hidden items-center justify-between w-full">
                <Button variant="ghost" size="icon" onClick={onMobileMenuClick}>
                    <Icons.menu className="h-6 w-6" />
                    <span className='sr-only'>Menu</span>
                </Button>
                <Logo loading={loading} imageUrl={settings?.logoUrl} hideTextOnMobile />
                <Sheet>
                    <SheetTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Icons.shoppingBag className="h-6 w-6" />
                        <span className="sr-only">Ouvrir le panier</span>
                        {totalItems > 0 && (
                        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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
            
            {/* Desktop Header: Logo, Nav, Search, Account, Cart */}
            <div className="hidden md:flex items-center justify-between w-full gap-8">
            <Logo loading={loading} imageUrl={settings?.logoUrl} />
            
            <div className="flex-1 flex justify-center">
                <MainNav items={categories} />
            </div>

            <div className="flex items-center gap-2">
                <div className="relative">
                    <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                        placeholder="Rechercher..." 
                        className="pl-10 h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm max-w-[200px]" 
                        onClick={onSearchClick}
                        readOnly
                    />
                </div>
                <Sheet>
                <SheetTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                    <Icons.shoppingBag className="h-6 w-6" />
                    <span className="sr-only">Ouvrir le panier</span>
                    {totalItems > 0 && (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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
        </div>
      </div>
    </header>
  );
}
