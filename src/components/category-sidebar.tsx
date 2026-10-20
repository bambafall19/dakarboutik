'use client';

import type { Category } from '@/lib/types';
import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

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

  return (
    <Accordion type="single" collapsible defaultValue="categories" className="w-full">
      <AccordionItem value="categories" className="border-b-0">
        <AccordionTrigger className="font-semibold text-base hover:no-underline py-0">Achetez par catégories</AccordionTrigger>
        <AccordionContent>
          <div className="pt-2 space-y-1">
             <Link 
              href={createCategoryUrl(null)}
              scroll={false}
              className={cn('block px-2 py-1.5 rounded-md hover:bg-accent text-sm text-blue-600', !currentCategorySlug && 'font-bold')}>
              Tous les produits
            </Link>
            {topLevelCategories.map(category => (
               <Link 
                key={category.id} 
                href={createCategoryUrl(category.slug)}
                scroll={false}
                className={cn(
                    "block px-2 py-1.5 rounded-md hover:bg-accent text-sm text-muted-foreground",
                    currentCategorySlug === category.slug && "text-primary font-semibold"
                )}
            >
                {category.name}
               </Link>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
