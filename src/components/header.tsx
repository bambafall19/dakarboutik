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
import { Heart, Search, Menu, Trophy } from 'lucide-react';
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

export function Header({
  settings,
  loading,
  categories,
  onMobileMenuClick,
  onSearchClick,
}: HeaderProps) {
  const { totalItems, totalPrice } = useCart();
  const { totalItems: wishlistTotal } = useWishlist();

  return (
    <header className="sticky top-0 z-40 w-full">
      <AnnouncementBar settings={settings} loading={loading} />

      <div className="container pt-3">
        <div className="flex h-16 items-center gap-3 rounded-2xl border border-border/60 bg-background/85 px-3 shadow-sm shadow-black/5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
          {/* Mobile: menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuClick}
            className="h-10 w-10 shrink-0 rounded-full lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Logo loading={loading} imageUrl={settings?.logoUrl} hideTextOnMobile={true} />

          {/* Badge Sénégal Champion 2025 */}
          <Link
            href="/products?on_sale=true"
            className="group ml-1 hidden shrink-0 items-center gap-1.5 rounded-full border border-accent/40 bg-gradient-to-r from-accent/15 to-accent/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-accent transition hover:border-accent hover:from-accent/25 xl:flex"
          >
            <Trophy className="h-3.5 w-3.5 transition group-hover:scale-110" />
            Sénégal Champion 2025
          </Link>

          {/* Center: Search */}
          <button
            type="button"
            onClick={onSearchClick}
            className="group relative hidden h-10 flex-1 items-center gap-3 rounded-full border border-transparent bg-secondary/70 px-4 text-left text-sm text-muted-foreground transition hover:border-primary/30 hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
          >
            <Search className="h-[18px] w-[18px] shrink-0 text-primary transition group-hover:scale-110" />
            <span className="flex-1 truncate">Rechercher un produit, une marque...</span>
            <kbd className="hidden items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground lg:flex">
              ⌘K
            </kbd>
          </button>

          {/* Right: actions */}
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchClick}
              className="h-10 w-10 rounded-full md:hidden"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              asChild
              size="icon"
              className="relative hidden h-10 w-10 rounded-full sm:flex"
            >
              <Link href="/favoris" aria-label="Favoris">
                <Heart className="h-5 w-5" />
                {wishlistTotal > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                    {wishlistTotal}
                  </span>
                )}
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="secondary"
                  className="ml-1 flex h-10 items-center gap-2 rounded-full bg-primary px-3.5 text-primary-foreground hover:bg-primary/90"
                >
                  <span className="relative">
                    <Icons.shoppingBag className="h-5 w-5" />
                    {totalItems > 0 && (
                      <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                        {totalItems}
                      </span>
                    )}
                  </span>
                  <span className="hidden text-xs font-semibold sm:inline">
                    <Price price={totalPrice} currency="FCA" />
                  </span>
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col">
                <CartDrawer />
              </SheetContent>
            </Sheet>

            <div className="hidden items-center sm:flex">
              <ThemeToggle />
              <SnowToggleButton />
            </div>
          </div>
        </div>

        {/* Category Nav (desktop) */}
        <div className="mt-2 hidden justify-center lg:flex">
          <MainNav items={categories} />
        </div>
      </div>
    </header>
  );
}
