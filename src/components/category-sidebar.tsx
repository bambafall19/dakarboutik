
'use client';

import type { Category } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import React, { useMemo } from 'react';
import { Badge } from './ui/badge';
import { ChevronDown } from 'lucide-react';

interface CategorySidebarProps {
  categories: Category[];
  totalProducts: number;
  searchParams: { [key: string]: string | null };
}

export function CategorySidebar({ categories, totalProducts, searchParams }: CategorySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const selectedCategorySlug = searchParams.category;
  
  const defaultOpen = useMemo(() => {
    if (!selectedCategorySlug) return [];
    
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
    
    const path = findPath(categories, selectedCategorySlug);
    // Only open the direct parent, not the full tree
    return path ? path.slice(0, path.length -1) : [];

  }, [categories, selectedCategorySlug]);

  const createCategoryUrl = (slug: string) => {
    const current = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
        if (value) {
            current.set(key, value);
        }
    }
    current.set('category', slug);
    return `${pathname}?${current.toString()}`;
  }

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map(category => {
      const hasSubCategories = category.subCategories && category.subCategories.length > 0;
      const isSelected = selectedCategorySlug === category.slug;

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
          href="/products" 
          scroll={false}
          className={cn('flex items-center justify-between w-full p-1.5 rounded-md hover:bg-accent', !selectedCategorySlug && 'bg-accent text-primary font-semibold')}>
          <span className={cn(!selectedCategorySlug && "font-bold", "text-xs md:text-sm")}>Tous les produits</span>
          <Badge variant={!selectedCategorySlug ? "default" : "secondary"} className={cn("rounded-full h-5 w-auto px-1.5 min-w-[20px] flex items-center justify-center text-xs", !selectedCategorySlug && "bg-primary")}>
              {totalProducts}
          </Badge>
        </Link>
        <Accordion type="multiple" defaultValue={defaultOpen} className="w-full space-y-1">
            {renderCategoryTree(categories)}
        </Accordion>
    </div>
  );
}
