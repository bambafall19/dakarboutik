"use client";

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { CartDrawer } from '@/components/cart-drawer';
import { Icons } from '@/components/icons';
import { getCategories } from '@/lib/data';
import { useState } from 'react';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, User } from 'lucide-react';

const categories = getCategories();

export function Header() {
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between text-sm text-muted-foreground h-8">
          <p className="hidden md:block">Download BeliBeli App</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-primary">Mitra BeliBeli</Link>
            <Link href="#" className="hover:text-primary">About BeliBeli</Link>
            <Link href="#" className="hover:text-primary">BeliBeli Care</Link>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-40 w-full border-b bg-card">
        <div className="container flex h-16 items-center">
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icons.menu />
                  <span className="sr-only">Ouvrir le menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <div className="flex flex-col h-full">
                  <div className="p-4">
                    <Logo />
                  </div>
                  <Separator />
                  <nav className="flex flex-col gap-4 p-4">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?category=${category.slug}`}
                        className="font-medium text-foreground/80 hover:text-foreground"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="mr-6 flex">
            <Logo />
          </div>

          <div className="flex-1 flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex">
                  All Category <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categories.map((category) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link href={`/products?category=${category.slug}`}>{category.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative flex-1">
              <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search product or brand here..." className="pl-9 bg-background" />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="icon" className="relative">
              <Icons.heart className="h-5 w-5" />
              <span className="sr-only">Wishlist</span>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Icons.logo className="h-5 w-5" />
                  <span className="sr-only">Ouvrir le panier</span>
                  {totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <CartDrawer />
              </SheetContent>
            </Sheet>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" className="hidden md:flex gap-2">Promo</Button>
            <Button variant="ghost" className="hidden md:flex gap-2">Sign Up</Button>
            <Button>Login</Button>
          </div>
        </div>
      </header>
    </>
  );
}