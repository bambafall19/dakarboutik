

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

interface MainNavProps {
  items: Category[];
}

export function MainNav({ items }: MainNavProps) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/products" passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-nav-foreground hover:bg-white/10 focus:bg-white/10")}>
              BOUTIQUE
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        {items.map((item) => (
          <NavigationMenuItem key={item.id}>
            {item.subCategories && item.subCategories.length > 0 ? (
              <>
                 <NavigationMenuTrigger className="bg-transparent text-nav-foreground hover:bg-white/10 focus:bg-white/10">{item.name.toUpperCase()}</NavigationMenuTrigger>
                 <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {item.subCategories.map((subItem) => {
                      const Icon = CategoryIcons[subItem.slug] || React.Fragment;
                      return (
                        <ListItem
                          key={subItem.name}
                          title={subItem.name}
                          href={`/products?category=${subItem.slug}`}
                        >
                          <Icon />
                        </ListItem>
                      );
                    })}
                  </ul>
                 </NavigationMenuContent>
              </>
            ) : (
              <Link href={`/products?category=${item.slug}`} passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-nav-foreground hover:bg-white/10 focus:bg-white/10")}>
                  {item.name.toUpperCase()}
                </NavigationMenuLink>
              </Link>
            )}
          </NavigationMenuItem>
        ))}
         <NavigationMenuItem>
          <Link href="/sav" passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-nav-foreground hover:bg-white/10 focus:bg-white/10")}>
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
