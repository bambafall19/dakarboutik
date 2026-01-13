
'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

interface MainNavProps {
  items: Category[];
}

const navLinks = [
    { name: 'Catégories', href: '/products' },
    { name: 'Offres', href: '/products?onSale=true' },
    { name: 'Nouveautés', href: '/products?sortBy=newest' },
    { name: 'Livraison', href: '/shipping-info' },
]

export function MainNav({ items }: MainNavProps) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navLinks.map((item) => (
            <NavigationMenuItem key={item.name}>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "h-14 bg-transparent text-base font-semibold hover:text-primary focus:text-primary data-[active]:text-primary text-foreground/80")}>
                  <Link href={item.href}>
                    {item.name}
                  </Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
