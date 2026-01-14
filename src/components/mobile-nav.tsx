
'use client';

import Link from 'next/link';
import { CategoryIcons } from './icons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import type { Category } from '@/lib/types';
import { Logo } from './logo';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { SheetTitle } from './ui/sheet';
import { Blocks, ChevronRight, X } from 'lucide-react';

interface MobileNavProps {
  items: Category[];
  onLinkClick: () => void;
}

export function MobileNav({ items, onLinkClick }: MobileNavProps) {
  const renderCategoryLinks = (categories: Category[], level = 0) => {
    return categories.map((cat) => {
      const hasSubCategories = cat.subCategories && cat.subCategories.length > 0;
      const Icon = CategoryIcons[cat.slug] || Blocks;

      if (hasSubCategories) {
        return (
          <AccordionItem key={cat.id} value={cat.slug} className="border-b-0">
            <AccordionTrigger className="py-3 text-base font-medium hover:no-underline px-4">
                <span className="flex items-center gap-4">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                    {cat.name}
                </span>
            </AccordionTrigger>
            <AccordionContent className="pl-6 border-l ml-6">
                <div className="flex flex-col">
                    {renderCategoryLinks(cat.subCategories, level + 1)}
                </div>
            </AccordionContent>
          </AccordionItem>
        );
      }
      
      return (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className="flex items-center gap-4 py-3 text-base px-4"
          onClick={onLinkClick}
          style={{ paddingLeft: level > 0 ? `${level * 1.5 + 1}rem` : undefined }}
        >
          {level === 0 && <Icon className="h-6 w-6 text-muted-foreground" />}
          <span className={level > 0 ? 'font-normal text-sm' : 'font-medium'}>{cat.name}</span>
        </Link>
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background sticky top-0 z-10">
        <SheetTitle className="sr-only">Menu Principal</SheetTitle>
        <div className='flex justify-between items-center'>
          <Logo onClick={onLinkClick} />
           <Button variant="ghost" size="icon" onClick={onLinkClick}>
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <Accordion type="multiple" className="flex flex-col py-4">
          {renderCategoryLinks(items)}
        </Accordion>
      </ScrollArea>
      
    </div>
  );
}
