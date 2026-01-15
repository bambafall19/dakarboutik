

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
import { Price } from './price';
import { ThemeToggle } from './theme-toggle';
import { AnnouncementBar } from './announcement-bar';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-lg">
      <AnnouncementBar />
      <div className="border-b">
        <div className="container flex h-20 items-center">
            {/* Mobile Header: Menu, Logo, Cart */}
             <div className="grid md:hidden grid-cols-3 items-center w-full">
                <div className="flex justify-start">
                    <Button variant="ghost" size="icon" onClick={onMobileMenuClick} className="h-10 w-10">
                        <Icons.menu className="h-6 w-6" />
                    </Button>
                </div>
                <div className="flex justify-center">
                    <Logo loading={loading} imageUrl={settings?.logoUrl} />
                </div>
                <div className="flex items-center justify-end">
                  <ThemeToggle />
                </div>
            </div>
            
            {/* Desktop Header: Logo, Nav, Search, Account, Cart */}
            <div className="hidden md:flex items-center justify-between w-full gap-8">
               <Logo loading={loading} imageUrl={settings?.logoUrl} />
              
              <div className="flex-1 max-w-sm relative" onClick={onSearchClick}>
                  <input placeholder="Rechercher un produit..." className="pl-4 pr-12 h-10 w-full rounded-md border bg-muted" readOnly />
                  <Icons.search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="h-12 rounded-lg px-3 flex items-center gap-2">
                            <div className='relative'>
                                <Icons.shoppingBag className="h-6 w-6 text-muted-foreground" />
                                {totalItems > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                    {totalItems}
                                </span>
                                )}
                            </div>
                           <div className='text-left'>
                                <span className='text-xs font-medium text-muted-foreground'>Panier</span>
                                <Price price={totalPrice} currency="XOF" className="text-sm font-bold text-foreground" />
                           </div>
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
       {/* Bottom bar */}
       <div className="bg-nav border-b hidden md:block">
        <div className="container flex h-14 items-center justify-between text-sm">
            <MainNav items={categories} />
        </div>
      </div>
    </header>
  );
}
