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
    <div>
      <h3 className="mb-3 font-headline text-sm font-bold uppercase tracking-wider text-foreground">
        Catégories
      </h3>
      <div className="space-y-0.5">
        <Link
          href={createCategoryUrl(null)}
          scroll={false}
          className={cn(
            'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
            isAllActive
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          <span className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            isAllActive ? 'bg-white/15' : 'bg-secondary text-primary'
          )}>
            <LayoutGrid className="h-4 w-4" />
          </span>
          <span className="flex-1">Tous les produits</span>
          {isAllActive && <Check className="h-4 w-4" />}
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
                'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <span className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg [&>svg]:h-4 [&>svg]:w-4',
                isActive ? 'bg-white/15' : 'bg-secondary text-primary'
              )}>
                <Icon />
              </span>
              <span className="flex-1 truncate">{category.name}</span>
              {typeof category.productCount === 'number' && category.productCount > 0 && (
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  isActive ? 'bg-white/15 text-primary-foreground' : 'bg-secondary text-muted-foreground'
                )}>
                  {category.productCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
