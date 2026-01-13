
'use client';

import Link from 'next/link';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Icons, CategoryIcons } from './icons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import type { Category } from '@/lib/types';
import { Logo } from './logo';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

interface MobileNavProps {
  items: Category[];
  onLinkClick: () => void;
}

export function MobileNav({ items, onLinkClick }: MobileNavProps) {
  const renderCategoryLinks = (categories: Category[], isSub: boolean = false) => {
    return categories.map((cat) => {
      const hasSubCategories = cat.subCategories && cat.subCategories.length > 0;
      const Icon = CategoryIcons[cat.slug] || null;

      if (hasSubCategories) {
        return (
          <AccordionItem key={cat.id} value={cat.slug} className="border-b-0">
            <AccordionTrigger className="py-3 text-base font-medium hover:no-underline">
                <span className="flex items-center gap-4">
                    {Icon ? <Icon className="h-6 w-6 text-muted-foreground" /> : <div className="h-6 w-6" />}
                    {cat.name}
                </span>
            </AccordionTrigger>
            <AccordionContent className="pl-6 border-l ml-5">
                <div className="flex flex-col gap-1">
                    {renderCategoryLinks(cat.subCategories, true)}
                </div>
            </AccordionContent>
          </AccordionItem>
        );
      }
      
      return (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className="flex items-center gap-4 py-3 text-base"
          onClick={onLinkClick}
        >
          {isSub ? null : (Icon ? <Icon className="h-6 w-6 text-muted-foreground" /> : <div className="h-6 w-6" />)}
          <span className={isSub ? 'font-normal' : 'font-medium'}>{cat.name}</span>
        </Link>
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b -mx-6 mb-2 bg-background sticky top-0 z-10">
        <Logo onClick={onLinkClick} />
      </div>

      <div className="relative mb-4">
        <Input placeholder="Rechercher..." className="pr-10 h-11" />
        <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9">
          <Icons.search className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      <ScrollArea className="flex-1 -mr-4 pr-4">
        <Accordion type="multiple" className="flex flex-col gap-1">
          {renderCategoryLinks(items)}
        </Accordion>
      </ScrollArea>
      
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
