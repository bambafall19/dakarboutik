

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
    <header className="sticky top-0 z-40 w-full">
      <AnnouncementBar settings={settings} loading={loading} />
      
      {/* Main Header */}
      <div className="border-b bg-background">
        <div className="container flex h-20 items-center justify-between gap-8">
            <div className="flex items-center gap-2">
                <Button variant="outline" className="hidden lg:flex" onClick={onMobileMenuClick}>
                  <LayoutGrid className="h-5 w-5 mr-2" />
                  Catégories
                </Button>
                <div className='hidden lg:block'>
                  <Logo loading={loading} imageUrl={settings?.logoUrl} />
                </div>
                <div className='lg:hidden'>
                  <Logo loading={loading} imageUrl={settings?.logoUrl} hideTextOnMobile={true} />
                </div>
            </div>
            
            <div className='hidden lg:flex'>
               <MainNav items={categories} />
            </div>
            
             <div className="hidden lg:flex items-center justify-end gap-4">
                  <div className='flex items-center gap-3'>
                    <Headset className='h-8 w-8 text-primary' />
                    <div>
                        <p className='text-sm font-semibold'>Support {settings?.supportPhone}</p>
                        <p className='text-xs text-muted-foreground'>Email: {settings?.supportEmail}</p>
                    </div>
                  </div>
                   <Button variant="ghost" asChild className="flex flex-col h-auto px-2 py-1 gap-1 text-xs font-normal">
                    <Link href="#">
                      <Heart className="h-5 w-5" />
                      <span>Favoris</span>
                    </Link>
                  </Button>
                   <Button variant="ghost" size="icon" onClick={onSearchClick}>
                    <Icons.search className="h-5 w-5" />
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                       <Button variant="default" className="relative rounded-full h-11 px-5 bg-foreground text-background hover:bg-foreground/90">
                        <Icons.shoppingBag className="h-5 w-5 mr-2" />
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
                   <Button variant="ghost" size="icon" asChild>
                    <Link href={user ? "/admin" : "/login"}>
                      <User className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Icons.shoppingBag className="h-6 w-6" />
                        {totalItems > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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
      
       {/* Mobile Header */}
      <div className="lg:hidden p-4 bg-background border-b flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onMobileMenuClick}>
              <Icons.menu className="h-6 w-6" />
          </Button>
          <Logo loading={loading} imageUrl={settings?.logoUrl} hideTextOnMobile={true} />
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
