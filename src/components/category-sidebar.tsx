
'use client';

import type { Category } from '@/lib/types';
import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils';
import { CategoryIcons } from './icons';
import { LayoutGrid, Check } from 'lucide-react';

interface CategorySidebarProps {
  categories: Category[];
  currentCategorySlug: string | null;
  basePath: string;
  currentQuery: string;
}

export function CategorySidebar({ categories, currentCategorySlug, basePath, currentQuery }: CategorySidebarProps) {
  
  const createCategoryUrl = (slug: string | null) => {
    const params = new URLSearchParams(currentQuery);

    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    
    // Reset other filters when changing category
    params.delete('bestseller');
    params.delete('on_sale');
    
    const queryString = params.toString();
    return `${basePath}${queryString ? `?${queryString}` : ''}`;
  };

  const topLevelCategories = categories.filter(c => !c.parentId);
  const isAllActive = !currentCategorySlug;

  return (
    <div className="space-y-1.5">
      <Link
        href={createCategoryUrl(null)}
        scroll={false}
        className={cn(
          'group flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all duration-300',
          isAllActive
            ? 'border-primary/30 bg-primary text-primary-foreground shadow-[0_12px_24px_-16px_rgba(11,110,79,0.9)]'
            : 'border-transparent text-muted-foreground hover:-translate-y-0.5 hover:border-border/70 hover:bg-background/80 hover:text-foreground'
        )}
      >
        <span className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
          isAllActive ? 'bg-white/15 text-accent' : 'bg-primary/8 text-primary group-hover:bg-primary/12'
        )}>
          <LayoutGrid className="h-4 w-4" />
        </span>
        <span className="flex-1 truncate">Tous les produits</span>
        {isAllActive && <Check className="h-4 w-4 text-accent" />}
      </Link>

      {topLevelCategories.map(category => {
        const isActive = currentCategorySlug === category.slug;
        const Icon = CategoryIcons[category.slug] || LayoutGrid;
        return (
          <Link
            key={category.id}
            href={createCategoryUrl(category.slug)}
            scroll={false}
            className={cn(
              'group flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all duration-300',
              isActive
                ? 'border-primary/30 bg-primary text-primary-foreground shadow-[0_12px_24px_-16px_rgba(11,110,79,0.9)]'
                : 'border-transparent text-muted-foreground hover:-translate-y-0.5 hover:border-border/70 hover:bg-background/80 hover:text-foreground'
            )}
          >
            <span className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors [&>svg]:h-4 [&>svg]:w-4',
              isActive ? 'bg-white/15 text-accent' : 'bg-primary/8 text-primary group-hover:bg-primary/12'
            )}>
              <Icon />
            </span>
            <span className="flex-1 truncate">{category.name}</span>
            {typeof category.productCount === 'number' && category.productCount > 0 && (
              <span className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums',
                isActive ? 'bg-white/15 text-primary-foreground' : 'bg-secondary text-muted-foreground'
              )}>
                {category.productCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
