

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
import { User, Heart, Headset, Sun, Moon, LayoutGrid } from 'lucide-react';
import { useUser } from '@/firebase';
import { Input } from './ui/input';
import { Price } from './price';

interface HeaderProps {
  settings?: SiteSettings | null;
  loading: boolean;
  categories: Category[];
  categoriesLoading: boolean;
  onMobileMenuClick: () => void;
  onSearchClick: () => void;
}

export function Header({ settings, loading, categories, onMobileMenuClick, onSearchClick }: HeaderProps) {
  const { totalItems, totalPrice } = useCart();
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <AnnouncementBar settings={settings} loading={loading} />
      
      {/* Main Header */}
      <div className="border-b">
        <div className="container flex h-20 items-center justify-between gap-8">
            <div className="flex items-center gap-4">
                <div className='lg:hidden'>
                  <Button variant="ghost" size="icon" onClick={onMobileMenuClick}>
                      <Icons.menu className="h-6 w-6" />
                  </Button>
                </div>
                <Logo loading={loading} imageUrl={settings?.logoUrl} />
            </div>
            
            <div className="hidden lg:flex flex-1 max-w-lg">
                <form className="w-full relative">
                    <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Rechercher un produit..."
                        className="w-full bg-muted pl-10 h-11 text-base rounded-full"
                        onFocus={onSearchClick}
                    />
                </form>
            </div>
            
             <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" asChild className="hidden lg:flex flex-col h-auto px-2 py-1 gap-1 text-xs font-normal">
                  <Link href={user ? "/admin" : "/login"}>
                    <User className="h-5 w-5" />
                    <span>Compte</span>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="hidden lg:flex flex-col h-auto px-2 py-1 gap-1 text-xs font-normal">
                  <Link href="#">
                    <Heart className="h-5 w-5" />
                    <span>Favoris</span>
                  </Link>
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                      <Button variant="ghost" className="relative rounded-full h-auto p-2 flex flex-col gap-1 text-xs font-normal">
                      <Icons.shoppingBag className="h-6 w-6" />
                      {totalItems > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                              {totalItems}
                          </span>
                      )}
                      <Price price={totalPrice} currency='XOF' />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="flex flex-col">
                      <CartDrawer />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Mobile Icons */}
               <div className="flex items-center justify-end gap-1 lg:hidden">
                  <Button variant="ghost" size="icon" onClick={onSearchClick}>
                    <Icons.search className="h-5 w-5" />
                  </Button>
              </div>
        </div>
      </div>
      
       {/* Category Nav */}
      <div className="hidden lg:flex bg-nav text-nav-foreground">
          <div className="container">
            <MainNav items={categories} />
          </div>
      </div>
    </header>
  );
}
