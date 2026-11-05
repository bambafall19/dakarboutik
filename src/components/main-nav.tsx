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
import { LayoutGrid, Tag, ArrowRight, Wrench, MessageCircle } from 'lucide-react';

interface MainNavProps {
  items: Category[];
}

const pillClass =
  'inline-flex h-9 items-center rounded-full bg-transparent px-3.5 text-[13px] font-semibold text-foreground/75 transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 data-[state=open]:bg-primary/10 data-[state=open]:text-primary';

export function MainNav({ items }: MainNavProps) {
  return (
    <NavigationMenu className="max-w-none">
      <NavigationMenuList className="gap-0.5 rounded-full border border-border/60 bg-background/85 px-1.5 py-1 shadow-sm shadow-black/5 backdrop-blur-xl">
        {[
          ['/', 'Accueil'],
          ['/products', 'Produits DakarBoutik'],
          ['/boutiques', 'Boutiques partenaires'],
          ['/products?on_sale=true', 'Promotions'],
          ['/commercant', 'Espace commerçant'],
        ].map(([href, label]) => <NavigationMenuItem key={href}>
          <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), pillClass)}>
            <Link href={href}>{label}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>)}
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
