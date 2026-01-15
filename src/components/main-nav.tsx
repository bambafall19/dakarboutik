

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
import { LayoutGrid } from 'lucide-react';

interface MainNavProps {
  items: Category[];
}

export function MainNav({ items }: MainNavProps) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/products" legacyBehavior passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-nav-foreground hover:bg-white/10 focus:bg-white/10 text-xs")}>
              BOUTIQUE
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent text-nav-foreground hover:bg-white/10 focus:bg-white/10 text-xs">
                <LayoutGrid className="h-4 w-4 mr-2" />
                CATÉGORIES
            </NavigationMenuTrigger>
            <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {items.map((item) => {
                    const Icon = CategoryIcons[item.slug] || React.Fragment;
                    return (
                    <ListItem
                        key={item.id}
                        title={item.name}
                        href={`/products?category=${item.slug}`}
                    >
                        <Icon />
                    </ListItem>
                    );
                })}
            </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>

         <NavigationMenuItem>
          <Link href="/sav" legacyBehavior passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-nav-foreground hover:bg-white/10 focus:bg-white/10 text-xs")}>
              GARANTIE & SAV
            </NavigationMenuLink>
          </Link>
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
        <Link
          href={props.href!}
          ref={ref}
          className={cn(
            'flex select-none items-center gap-3 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          {children}
          <div className="text-sm font-medium leading-none">{title}</div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
