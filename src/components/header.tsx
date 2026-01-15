

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
import { AnnouncementBar } from './announcement-bar';
import { User, Heart } from 'lucide-react';
import { useUser } from '@/firebase';
import { Input } from './ui/input';

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
    <header className="sticky top-0 z-40 w-full">
      <AnnouncementBar settings={settings} loading={loading} />
      
      {/* Main Header */}
      <div className="border-b bg-background">
        <div className="container flex h-20 items-center justify-between gap-8">
            <div className="flex items-center gap-8">
                <Logo loading={loading} imageUrl={settings?.logoUrl} />
            </div>
            
            <form className="hidden lg:block flex-1 max-w-xl">
                <div className="relative">
                    <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Rechercher un produit..." className="pl-10 h-11" onFocus={onSearchClick} />
                </div>
            </form>
            
             <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" className="lg:hidden" onClick={onSearchClick}>
                    <Icons.search className="h-5 w-5" />
                  </Button>
                   <Button variant="ghost" size="icon" asChild>
                    <Link href={user ? "/admin" : "/login"}>
                      <User className="h-5 w-5" />
                    </Link>
                  </Button>
                   <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Icons.shoppingBag className="h-6 w-6" />
                        {totalItems > 0 && (
                            <span className="absolute -right-2 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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
      
      {/* Navigation Bar */}
      <nav className="bg-nav text-nav-foreground hidden md:block">
        <div className="container">
          <MainNav items={categories} />
        </div>
      </nav>
      
       {/* Mobile Header */}
      <div className="md:hidden p-4 bg-background border-b flex items-center justify-between">
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

    </header>
  );
}
