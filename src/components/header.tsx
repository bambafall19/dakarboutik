
'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { CartDrawer } from '@/components/cart-drawer';
import { Icons } from '@/components/icons';
import type { SiteSettings } from '@/lib/types';
import { useCategories } from '@/hooks/use-site-data';
import { MainNav } from './main-nav';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  settings?: SiteSettings | null;
  loading: boolean;
}

export function Header({ settings, loading }: HeaderProps) {
  const { totalItems } = useCart();
  const { categories } = useCategories();
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
        }, 500); // Corresponds to the fade-out duration
      }, 5000); // Change message every 5 seconds
      return () => clearInterval(interval);
    }
  }, [announcementMessages.length]);

  const currentAnnouncement = announcementMessages[currentMessageIndex];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      {currentAnnouncement && !loading && (
        <div className="bg-primary text-primary-foreground text-center text-sm p-2.5 transition-opacity duration-500">
           <span
            className={cn(
              'transition-opacity duration-500 ease-in-out',
              isFading ? 'opacity-0' : 'opacity-100'
            )}
          >
            {currentAnnouncement}
          </span>
        </div>
      )}
      <div className="container flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Logo loading={loading} imageUrl={settings?.logoUrl} />
          <div className="hidden lg:flex">
            <MainNav items={categories} />
          </div>
        </div>

        <div className="flex-1 hidden md:flex max-w-xs">
          <div className="relative w-full mx-auto flex">
            <div className="relative flex-1">
              <Input
                placeholder="Rechercher un produit..."
                className="focus-visible:ring-primary"
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              >
                <Icons.search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/login">
              <Icons.user className="h-5 w-5" />
              <span className="sr-only">Mon compte</span>
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Icons.shoppingBag className="h-5 w-5" />
                <span className="sr-only">Ouvrir le panier</span>
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
      </div>
    </header>
  );
}
