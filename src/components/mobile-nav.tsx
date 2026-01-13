
'use client';

import Link from 'next/link';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Icons } from './icons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import type { Category } from '@/lib/types';
import { Logo } from './logo';
import { Separator } from './ui/separator';

interface MobileNavProps {
  items: Category[];
  onLinkClick: () => void;
}

export function MobileNav({ items, onLinkClick }: MobileNavProps) {
  const renderCategoryLinks = (categories: Category[], isSub: boolean = false) => {
    return categories.map((cat) => {
      const hasSubCategories = cat.subCategories && cat.subCategories.length > 0;

      if (hasSubCategories) {
        return (
          <AccordionItem key={cat.id} value={cat.slug}>
            <AccordionTrigger className="py-3 text-base hover:no-underline">
                <span className="flex items-center gap-3">
                    {cat.name}
                </span>
            </AccordionTrigger>
            <AccordionContent className="pl-8 border-l ml-3">
                {renderCategoryLinks(cat.subCategories, true)}
            </AccordionContent>
          </AccordionItem>
        );
      }
      
      return (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className="flex items-center gap-3 py-3 text-base"
          onClick={onLinkClick}
        >
          {cat.name}
        </Link>
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b -mt-6 -mx-6 mb-4 bg-background sticky top-0 z-10">
        <Logo onClick={onLinkClick} />
      </div>

      <div className="relative mb-4">
        <Input placeholder="Rechercher..." className="pr-10" />
        <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
          <Icons.search className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto -mr-4 pr-4">
        <Accordion type="multiple">
          {renderCategoryLinks(items)}
        </Accordion>
      </div>
      
      <Separator className='my-4' />
      
       <div className="mt-auto">
        <Link href="/login" className="flex items-center gap-3 py-2 text-base" onClick={onLinkClick}>
            <Icons.user className="h-5 w-5 text-muted-foreground" />
            Espace Admin
        </Link>
      </div>

    </div>
  );
}
