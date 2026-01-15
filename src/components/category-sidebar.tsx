
'use client';

import type { Category } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { Badge } from './ui/badge';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategorySidebarProps {
  categories: Category[];
  totalProducts: number;
  currentCategorySlug: string | null;
  basePath: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export function CategorySidebar({ categories, totalProducts, currentCategorySlug, basePath, searchParams }: CategorySidebarProps) {
  
  const defaultOpen = useMemo(() => {
    if (!currentCategorySlug) return [];
    
    const findPath = (cats: Category[], slug: string, path: string[] = []): string[] | null => {
      for (const cat of cats) {
        if (cat.slug === slug) return [...path, cat.slug];
        if (cat.subCategories) {
          const result = findPath(cat.subCategories, slug, [...path, cat.slug]);
          if (result) return result;
        }
      }
      return null;
    }
    
    const path = findPath(categories, currentCategorySlug);
    // Only open the direct parent, not the full tree
    return path ? path.slice(0, path.length -1) : [];

  }, [categories, currentCategorySlug]);

  const createCategoryUrl = (slug: string | null) => {
    const current = new URLSearchParams();
    for (const key in searchParams) {
        if (key !== 'category' && searchParams[key]) {
            current.set(key, searchParams[key] as string);
        }
    }
    if (slug) {
        current.set('category', slug);
    }
    return `${basePath}?${current.toString()}`;
  }

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map(category => {
      const hasSubCategories = category.subCategories && category.subCategories.length > 0;
      const isSelected = currentCategorySlug === category.slug;

      const linkContent = (
        <div className="flex items-center justify-between w-full">
            <span className={cn(isSelected && "font-bold", "text-xs md:text-sm")}>{category.name}</span>
            <Badge variant={isSelected ? "default" : "secondary"} className={cn("rounded-full h-5 w-auto px-1.5 min-w-[20px] flex items-center justify-center text-xs", isSelected && "bg-primary")}>
                {category.productCount || 0}
            </Badge>
        </div>
      );

      if (hasSubCategories) {
        return (
          <AccordionItem value={category.slug} key={category.id} className="border-b-0">
            <AccordionTrigger className={cn("hover:no-underline py-1.5", isSelected && "text-primary hover:text-primary")}>
                <div className="flex items-center justify-between w-full pr-1">
                    <span className={cn(isSelected && "font-bold", "text-xs md:text-sm")}>{category.name}</span>
                    <div className='flex items-center gap-2'>
                        <Badge variant={isSelected ? "default" : "secondary"} className={cn("rounded-full h-5 w-auto px-1.5 min-w-[20px] flex items-center justify-center text-xs", isSelected && "bg-primary")}>
                            {category.productCount || 0}
                        </Badge>
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pl-2 md:pl-4">
              <div className="flex flex-col">
                {renderCategoryTree(category.subCategories!, level + 1)}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      }
      
      return (
        <Link 
            key={category.id} 
            href={createCategoryUrl(category.slug)}
            scroll={false}
            className={cn(
                "flex items-center justify-between w-full p-1.5 rounded-md hover:bg-accent",
                isSelected && "bg-accent text-primary font-semibold"
            )}
        >
            {linkContent}
        </Link>
      );
    });
  };

  return (
    <div className='flex flex-col gap-2'>
        <h3 className="font-semibold text-base md:text-lg">Catégories</h3>
        <Link 
          href={createCategoryUrl(null)}
          scroll={false}
          className={cn('flex items-center justify-between w-full p-1.5 rounded-md hover:bg-accent', !currentCategorySlug && 'bg-accent text-primary font-semibold')}>
          <span className={cn(!currentCategorySlug && "font-bold", "text-xs md:text-sm")}>Tous les produits</span>
          <Badge variant={!currentCategorySlug ? "default" : "secondary"} className={cn("rounded-full h-5 w-auto px-1.5 min-w-[20px] flex items-center justify-center text-xs", !currentCategorySlug && "bg-primary")}>
              {totalProducts}
          </Badge>
        </Link>
        <Accordion type="multiple" defaultValue={defaultOpen} className="w-full space-y-1">
            {renderCategoryTree(categories)}
        </Accordion>
    </div>
  );
}
