
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

interface MainNavProps {
  items: Category[];
}

export function MainNav({ items }: MainNavProps) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {items.map((item) => (
            <NavigationMenuItem key={item.id}>
              {item.subCategories && item.subCategories.length > 0 ? (
                <>
                  <NavigationMenuTrigger className="h-14 bg-transparent text-base hover:bg-white/10 focus:bg-white/10 data-[active]:bg-white/10 data-[state=open]:bg-white/10">
                    {item.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                      {item.subCategories.map((component) => (
                        <ListItem
                          key={component.name}
                          title={component.name}
                          href={`/products?category=${component.slug}`}
                        >
                          {component.subCategories && (
                            <div className='flex flex-wrap gap-2 mt-2'>
                              {component.subCategories.map(sub => (
                                <Link key={sub.id} href={`/products?category=${sub.slug}`} className='text-xs text-muted-foreground hover:text-primary'>{sub.name}</Link>
                              ))}
                            </div>
                          )}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "h-14 bg-transparent text-base hover:bg-white/10 focus:bg-white/10 data-[active]:bg-white/10")}>
                  <Link href={`/products?category=${item.slug}`}>
                    {item.name}
                  </Link>
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  HTMLLIElement,
  {
    className?: string;
    title: string;
    href: string;
    children?: React.ReactNode;
  }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li
      ref={ref}
      className={cn(
        'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        className
      )}
      {...props}
    >
      <NavigationMenuLink asChild>
        <Link href={href} className="font-medium leading-none">{title}</Link>
      </NavigationMenuLink>
      {children && <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
        {children}
      </div>}
    </li>
  );
});
ListItem.displayName = 'ListItem';
