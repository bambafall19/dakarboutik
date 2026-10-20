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
import { Heart } from 'lucide-react';
import { Input } from './ui/input';
import { Price } from './price';
import { useWishlist } from '@/hooks/use-wishlist';
import { ThemeToggle } from './theme-toggle';
import { SnowToggleButton } from './snow-toggle-button';

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
  const { totalItems: wishlistTotal } = useWishlist();

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <AnnouncementBar settings={settings} loading={loading} />
      
      {/* Mobile Header */}
      <div className="md:hidden border-b">
        <div className="container flex h-16 items-center justify-center gap-4">
            <Logo loading={loading} imageUrl={settings?.logoUrl} hideTextOnMobile={false} />
        </div>
      </div>

      {/* Desktop & Tablet Header */}
      <div className="hidden md:block border-b">
        <div className="container flex h-20 items-center gap-4">
            {/* Left: Logo and Menu toggle */}
            <div className="flex items-center gap-2">
                <div className='lg:hidden'>
                  <Button variant="ghost" size="icon" onClick={onMobileMenuClick}>
                      <Icons.menu className="h-6 w-6" />
                  </Button>
                </div>
                <Logo loading={loading} imageUrl={settings?.logoUrl} hideTextOnMobile={true} />
            </div>

            {/* Center: Search Bar */}
            <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-lg">
                    <form className="w-full relative" onSubmit={(e) => { e.preventDefault(); onSearchClick(); }}>
                        <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher un produit..."
                            className="w-full bg-muted pl-10 h-11 text-base rounded-full cursor-pointer"
                            onClick={onSearchClick}
                            readOnly
                        />
                    </form>
                </div>
            </div>
            
            {/* Right: Icons */}
            <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" asChild size="icon" className="relative h-10 w-10">
                    <Link href="/favoris">
                    <Heart className="h-6 w-6" />
                    <span className="sr-only">Favoris</span>
                        {wishlistTotal > 0 && (
                        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
                            {wishlistTotal}
                        </span>
                        )}
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
                        <Price price={totalPrice} currency='FCA' />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="flex flex-col">
                        <CartDrawer />
                    </SheetContent>
                </Sheet>
                <ThemeToggle />
                <SnowToggleButton />
            </div>
        </div>
      </div>
      
       {/* Category Nav */}
      <div className="hidden lg:block bg-nav text-nav-foreground">
          <div className="container flex justify-center">
            <MainNav items={categories} />
          </div>
      </div>
    </header>
  );
}
