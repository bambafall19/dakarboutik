

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
import { Headset } from 'lucide-react';
import { AnnouncementBar } from './announcement-bar';

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
  
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-lg">
       <AnnouncementBar settings={settings} />
      {/* Main Header */}
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
                  {(settings?.supportPhone || settings?.supportEmail) && (
                    <Button variant="ghost" size="icon" asChild className="h-10 w-10">
                       <a href={`tel:${settings.supportPhone}`}>
                         <Headset className="h-6 w-6 text-primary" />
                       </a>
                    </Button>
                  )}
                   <ThemeToggle />
                </div>
            </div>
            
            {/* Desktop Header: Logo, Nav, Search, Account, Cart */}
            <div className="hidden md:flex items-center justify-between w-full gap-4">
               <div className='flex items-center gap-4'>
                 <Button variant="ghost" size="icon" onClick={onMobileMenuClick} className="h-10 w-10">
                    <Icons.menu className="h-6 w-6" />
                </Button>
                <Logo loading={loading} imageUrl={settings?.logoUrl} />
               </div>
            
              <div className="flex-1 max-w-lg relative">
                  <Icons.search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input 
                      placeholder="Recherche de produits..." 
                      className="pl-12 h-12 w-full rounded-full border border-input bg-white text-black px-3 py-2" 
                      onClick={onSearchClick}
                      readOnly
                  />
              </div>

              {(settings?.supportPhone || settings?.supportEmail) && (
                <div className="flex items-center gap-3">
                  <Headset className="h-10 w-10 text-primary" />
                  <div>
                    {settings.supportPhone && (
                      <a href={`tel:${settings.supportPhone}`} className="font-semibold text-sm hover:underline">
                        Support {settings.supportPhone}
                      </a>
                    )}
                    {settings.supportEmail && (
                      <a href={`mailto:${settings.supportEmail}`} className="text-xs text-muted-foreground block hover:underline">
                        Email: {settings.supportEmail}
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <Button variant="ghost" className="h-12 rounded-lg px-4 flex-col gap-1 items-center justify-center">
                    <Icons.heart className="h-6 w-6 text-muted-foreground" />
                    <span className='text-xs font-medium text-muted-foreground'>Favoris</span>
                  </Button>
                  
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button className="h-12 rounded-lg bg-nav text-nav-foreground px-4">
                          <div className='relative mr-2'>
                            <Icons.shoppingBag className="h-6 w-6" />
                             {totalItems > 0 && (
                              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                  {totalItems}
                              </span>
                            )}
                          </div>
                          <span className='font-bold'><Price price={totalPrice} currency="XOF" className="text-lg text-nav-foreground" /></span>
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
            <div className="flex items-center gap-6 text-nav-foreground font-medium">
                <Link href="#" className='hover:text-white transition-colors'>À propos</Link>
                <Link href="#" className='hover:text-white transition-colors'>Contact</Link>
                <Link href="/sav" className='hover:text-white transition-colors'>Garantie & SAV</Link>
            </div>
        </div>
      </div>
    </header>
  );
}
