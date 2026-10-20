'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { CategoryIcons } from './icons';
import { LayoutGrid, Tag, ArrowRight, Package, Wrench, MessageCircle } from 'lucide-react';

interface MainNavProps {
  items: Category[];
}

const pillClass =
  'inline-flex h-9 items-center rounded-full bg-transparent px-3.5 text-[13px] font-semibold text-foreground/75 transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 data-[state=open]:bg-primary/10 data-[state=open]:text-primary';

export function MainNav({ items }: MainNavProps) {
  return (
    <NavigationMenu className="max-w-none">
      <NavigationMenuList className="gap-0.5 rounded-full border border-border/60 bg-background/85 px-1.5 py-1 shadow-sm shadow-black/5 backdrop-blur-xl">
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), pillClass)}>
            <Link href="/products">Boutique</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className={cn(navigationMenuTriggerStyle(), pillClass, 'gap-2')}>
            <LayoutGrid className="h-4 w-4" />
            Catégories
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[420px] gap-1 p-3 md:w-[560px] md:grid-cols-2 lg:w-[660px]">
              {items.map((item) => {
                const Icon = CategoryIcons[item.slug] || React.Fragment;
                return (
                  <ListItem
                    key={item.id}
                    title={item.name}
                    href={`/products?category=${item.slug}`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary [&>svg]:h-5 [&>svg]:w-5">
                      <Icon />
                    </span>
                  </ListItem>
                );
              })}
              <li className="md:col-span-2">
                <Link
                  href="/products"
                  className="mt-1 flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Voir toute la boutique
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), pillClass, 'gap-2')}>
            <Link href="/products?on_sale=true">
              <Tag className="h-4 w-4" />
              Promotions
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), pillClass, 'gap-2')}>
            <Link href="/suivi">
              <Package className="h-4 w-4" />
              Suivi
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), pillClass, 'gap-2')}>
            <Link href="/sav">
              <Wrench className="h-4 w-4" />
              Garantie & SAV
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), pillClass, 'gap-2')}>
            <Link href="/contact">
              <MessageCircle className="h-4 w-4" />
              Contact
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'flex select-none items-center gap-3 rounded-xl p-2.5 leading-none no-underline outline-none transition-colors hover:bg-accent/15 focus:bg-accent/15',
            className
          )}
          {...props}
        >
          {children}
          <div className="text-sm font-semibold leading-none">{title}</div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
