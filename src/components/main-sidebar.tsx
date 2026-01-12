'use client';

import { useCategories } from '@/hooks/use-site-data';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { Home, LayoutGrid, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { CategoryIcons } from './icons';
import { Logo } from './logo';

export function MainSidebar() {
  const { categories, loading } = useCategories();
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center gap-2 p-4 border-b">
        <Logo />
      </div>
      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/"
                isActive={pathname === '/'}
                tooltip="Accueil"
              >
                <Home />
                <span>Accueil</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/products"
                isActive={pathname === '/products'}
                tooltip="Produits"
              >
                <LayoutGrid />
                <span>Tous les Produits</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Catégories</SidebarGroupLabel>
          <SidebarMenu>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <SidebarMenuSkeleton key={i} showIcon />
                ))
              : categories.map((category) => {
                  const Icon = CategoryIcons[category.slug] || LayoutGrid;
                  return (
                    <SidebarMenuItem key={category.id}>
                      <SidebarMenuButton
                        href={`/products?category=${category.slug}`}
                        isActive={pathname.includes(`category=${category.slug}`)}
                        tooltip={category.name}
                      >
                        <Icon />
                        <span>{category.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
           <SidebarGroupLabel>Administration</SidebarGroupLabel>
           <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin"
                  isActive={pathname.startsWith('/admin')}
                  tooltip="Admin"
                >
                  <Settings />
                  <span>Admin</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
           </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
