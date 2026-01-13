
'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { CartDrawer } from '@/components/cart-drawer';
import { Icons } from '@/components/icons';
import type { SiteSettings, Category } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Price } from './price';

interface HeaderProps {
  settings?: SiteSettings | null;
  loading: boolean;
  categories: Category[];
  pathname: string;
}

export function Header({ settings, loading, pathname }: HeaderProps) {
  const { totalItems, totalPrice } = useCart();
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
      {currentAnnouncement && !loading && (
        <div className="bg-primary text-primary-foreground text-center text-sm p-2 transition-opacity duration-500">
          <span className={cn('transition-opacity duration-500 ease-in-out', isFading ? 'opacity-0' : 'opacity-100')}>
            {currentAnnouncement}
          </span>
        </div>
      )}
      <div className="container flex h-20 items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden lg:block">
                <Logo loading={loading} imageUrl={settings?.logoUrl} />
            </div>
        </div>

        <div className="flex-1 flex justify-center px-4">
            <div className="relative w-full max-w-xl">
                <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Rechercher..."
                    className="w-full bg-muted pl-10 h-11 text-base"
                />
            </div>
        </div>

        <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" className="hidden lg:flex items-center gap-2">
                <Icons.user className="h-6 w-6"/>
                <span className="text-sm font-medium">Compte</span>
            </Button>
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="outline" className="relative h-12 w-12 md:w-auto md:px-4 rounded-full">
                    <Icons.shoppingBag className="h-6 w-6" />
                    <span className="sr-only">Ouvrir le panier</span>
                    {totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {totalItems}
                    </span>
                    )}
                    <Price price={totalPrice} currency='XOF' className="ml-2 hidden md:flex" />
                </Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col">
                    <CartDrawer />
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
