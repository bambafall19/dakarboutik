

'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { CartDrawer } from '@/components/cart-drawer';
import { Icons } from '@/components/icons';
import type { SiteSettings, Category } from '@/lib/types';
import { MainNav } from './main-nav';
import { ThemeToggle } from './theme-toggle';
import { AnnouncementBar } from './announcement-bar';
import { User, Heart } from 'lucide-react';
import { useUser } from '@/firebase';

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
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm">
      <AnnouncementBar />
      <div className="border-b">
        <div className="container flex h-20 items-center justify-between">
            {/* Mobile Header: Menu, Logo, Cart */}
             <div className="flex md:hidden items-center justify-between w-full">
                <Button variant="ghost" size="icon" onClick={onMobileMenuClick}>
                    <Icons.menu className="h-6 w-6" />
                </Button>
                <Logo loading={loading} imageUrl={settings?.logoUrl} />
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Icons.shoppingBag className="h-6 w-6" />
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
            
            {/* Desktop Header: Nav, Logo, Actions */}
            <div className="hidden md:grid grid-cols-3 items-center w-full gap-8">
               <div className="flex justify-start">
                  <MainNav items={categories} />
               </div>
               
               <div className="flex justify-center">
                <Logo loading={loading} imageUrl={settings?.logoUrl} />
               </div>

              <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={onSearchClick}>
                    <Icons.search className="h-5 w-5" />
                  </Button>
                   <Button variant="ghost" size="icon" asChild>
                    <Link href={user ? "/admin" : "/login"}>
                      <User className="h-5 w-5" />
                    </Link>
                  </Button>
                   <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Icons.shoppingBag className="h-6 w-6" />
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
                  <ThemeToggle />
              </div>
            </div>
        </div>
      </div>
    </header>
  );
}
