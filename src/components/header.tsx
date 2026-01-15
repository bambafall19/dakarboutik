

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
import { Headset, User } from 'lucide-react';
import { AnnouncementBar } from './announcement-bar';
import { Separator } from './ui/separator';

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
       <div className='border-b'>
        <div className="container flex h-10 items-center justify-between text-sm text-muted-foreground">
            <div className='flex items-center gap-4'>
                <span>Vente flash : Jusqu'à -50%</span>
            </div>
            <div className='flex items-center gap-4'>
                <Link href="#" className='hover:text-foreground'>Localiser un magasin</Link>
                <Separator orientation="vertical" className='h-4' />
                <Link href="#" className='hover:text-foreground'>Suivre ma commande</Link>
            </div>
        </div>
       </div>
      {/* Main Header */}
      <div className="border-b">
        <div className="container flex h-24 items-center">
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
            
              <div className="flex-1 max-w-2xl relative">
                  <input 
                      placeholder="Rechercher des produits..." 
                      className="pl-4 pr-32 h-12 w-full rounded-md border-2 border-primary bg-white text-black" 
                      onClick={onSearchClick}
                      readOnly
                  />
                  <Button size="lg" className='absolute right-0 top-0 h-full rounded-l-none rounded-r-md px-8'>
                    <Icons.search className="h-6 w-6 text-black" />
                  </Button>
              </div>

              <div className="flex items-center gap-2">
                  <ThemeToggle />
                   <Button variant="ghost" className="h-12 rounded-lg px-3 flex items-center gap-2">
                    <Icons.heart className="h-7 w-7 text-muted-foreground" />
                    <div>
                        <span className='text-xs font-medium text-muted-foreground'>Favoris</span>
                        <p className='font-bold text-sm text-foreground'>Ma Liste</p>
                    </div>
                  </Button>
                  
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" className="h-12 rounded-lg px-3 flex items-center gap-2">
                            <div className='relative'>
                                <Icons.shoppingBag className="h-7 w-7 text-muted-foreground" />
                                {totalItems > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-black">
                                    {totalItems}
                                </span>
                                )}
                            </div>
                           <div>
                                <span className='text-xs font-medium text-muted-foreground'>Panier</span>
                                <Price price={totalPrice} currency="XOF" className="text-sm text-foreground" />
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
            <div className="flex items-center gap-6 text-nav-foreground font-medium">
                <Link href="#" className='hover:text-primary transition-colors'>À propos</Link>
                <Link href="#" className='hover:text-primary transition-colors'>Contact</Link>
                <Link href="/sav" className='hover:text-primary transition-colors'>Garantie & SAV</Link>
            </div>
        </div>
      </div>
    </header>
  );
}
