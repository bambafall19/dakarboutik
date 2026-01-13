
'use client';

import type { Category } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Link from 'next/link';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import React, { useMemo } from 'react';

interface CategorySidebarProps {
  categories: Category[];
}

export function CategorySidebar({ categories }: CategorySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCategorySlug = searchParams.get('category');
  
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
    return findPath(categories, selectedCategorySlug) || [];

  }, [categories, selectedCategorySlug]);

  const createCategoryUrl = (slug: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('category', slug);
    return `${pathname}?${current.toString()}`;
  }

  const renderCategoryTree = (categories: Category[]) => {
    return categories.map(category => {
      const hasSubCategories = category.subCategories && category.subCategories.length > 0;
      const isSelected = selectedCategorySlug === category.slug;

      if (hasSubCategories) {
        return (
          <AccordionItem value={category.slug} key={category.id}>
            <AccordionTrigger className={cn("hover:no-underline", isSelected && "text-primary hover:text-primary")}>
                {category.name}
            </AccordionTrigger>
            <AccordionContent className="pl-4">
              <div className="flex flex-col gap-1">
                {renderCategoryTree(category.subCategories!)}
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
                "block p-2 rounded-md hover:bg-accent",
                isSelected && "bg-accent text-primary font-semibold"
            )}
        >
            {category.name}
        </Link>
      );
    });
  };

  return (
    <div className='flex flex-col gap-2'>
        <h3 className="font-semibold text-lg">Catégories</h3>
        <Link 
          href="/products" 
          scroll={false}
          className={cn('block p-2 rounded-md hover:bg-accent', !selectedCategorySlug && 'bg-accent font-semibold')}>
          Tous les produits
        </Link>
        <Accordion type="multiple" defaultValue={defaultOpen} className="w-full">
            {renderCategoryTree(categories)}
        </Accordion>
    </div>
  );
}
