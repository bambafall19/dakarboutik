

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
import { Icons } from './icons';
import { Button } from './ui/button';

interface MainNavProps {
  items: Category[];
}

const navLinks = [
    { name: 'Super Deals', href: '/products?onSale=true' },
    { name: 'Nouveautés', href: '/products?sortBy=newest' },
    { name: 'Marques', href: '/brands' },
]

export function MainNav({ items }: MainNavProps) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
            <Button className='h-14 rounded-none'>
                <Icons.menu className='mr-2' />
                Toutes les catégories
            </Button>
        </NavigationMenuItem>
        {navLinks.map((item) => (
            <NavigationMenuItem key={item.name}>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "h-14 bg-transparent text-base font-semibold hover:text-primary focus:text-primary data-[active]:text-primary text-nav-foreground")}>
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
