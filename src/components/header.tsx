
'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { CartDrawer } from '@/components/cart-drawer';
import { Icons } from '@/components/icons';
import type { SiteSettings } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  settings?: SiteSettings | null;
  loading: boolean;
  pathname: string;
  onOpenMobileMenu: () => void;
}

export function Header({ settings, loading, pathname }: HeaderProps) {
  const { totalItems } = useCart();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const announcementMessages = useMemo(() => {
    if (!settings) return [];
    return [
      settings.announcementMessage1,
      settings.announcementMessage2,
      settings.announcementMessage3,
    ].filter((msg): msg is string => !!msg);
  }, [settings]);

  useEffect(() => {
    if (announcementMessages.length > 1) {
      const interval = setInterval(() => {
        setIsFading(true);
        setTimeout(() => {
          setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % announcementMessages.length);
          setIsFading(false);
        }, 500);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [announcementMessages.length]);

  const currentAnnouncement = announcementMessages[currentMessageIndex];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      {/* Announcement bar for desktop */}
      {currentAnnouncement && !loading && (
        <div className="bg-primary text-primary-foreground text-center text-sm p-2 transition-opacity duration-500 hidden md:block">
          <span className={cn('transition-opacity duration-500 ease-in-out', isFading ? 'opacity-0' : 'opacity-100')}>
            {currentAnnouncement}
          </span>
        </div>
      )}

      {/* Main Header */}
      <div className="container flex h-16 items-center">
        {/* Mobile Header: Centered Logo and Cart */}
        <div className="flex md:hidden items-center justify-between w-full">
          <div className="w-10"></div> {/* Spacer to balance the cart button */}
          <Logo loading={loading} imageUrl={settings?.logoUrl} hideTextOnMobile />
          <Sheet>
            <SheetTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Icons.shoppingBag className="h-6 w-6" />
                <span className="sr-only">Ouvrir le panier</span>
                {totalItems > 0 && (
                <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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
        
        {/* Desktop Header: Logo, Search, Account, Cart */}
        <div className="hidden md:flex items-center justify-between w-full gap-4">
          <Logo loading={loading} imageUrl={settings?.logoUrl} />
          
          <div className="relative flex-1 max-w-lg">
              <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input 
                placeholder="Rechercher un produit..." 
                className="pl-10 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                onClick={onOpenMobileMenu} // This will now open the search sheet
                readOnly
              />
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="items-center gap-2">
                  <Icons.user className="h-6 w-6"/>
                  <span className="text-sm font-medium">Compte</span>
              </Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                  <Icons.shoppingBag className="h-6 w-6" />
                  <span className="sr-only">Ouvrir le panier</span>
                  {totalItems > 0 && (
                  <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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
    </header>
  );
}
