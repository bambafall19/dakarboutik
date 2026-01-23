'use client';

import Link from 'next/link';
import { CategoryIcons, Icons } from './icons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import type { Category } from '@/lib/types';
import { Logo } from './logo';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { SheetTitle } from './ui/sheet';
import { Headset, Truck, X, Heart, Info, Mail } from 'lucide-react';
import { Separator } from './ui/separator';
import { ThemeToggle } from './theme-toggle';

interface MobileNavProps {
  items: Category[];
  onLinkClick: () => void;
}

export function MobileNav({ items, onLinkClick }: MobileNavProps) {
  const renderCategoryLinks = (categories: Category[], level = 0) => {
    return categories.map((cat) => {
      const Icon = CategoryIcons[cat.slug] || Icons.chevronRight;
      const hasSubCategories = cat.subCategories && cat.subCategories.length > 0;

      if (hasSubCategories) {
        return (
          <AccordionItem key={cat.id} value={cat.slug} className="border-b-0">
            <AccordionTrigger className="py-3 text-base font-medium hover:no-underline px-4">
                <span className="flex items-center gap-4">
                    <Icon className="h-5 w-5" />
                    {cat.name}
                </span>
            </AccordionTrigger>
            <AccordionContent className="pl-6 border-l ml-6">
                <div className="flex flex-col">
                    {renderCategoryLinks(cat.subCategories!, level + 1)}
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
          style={{ paddingLeft: level > 0 ? `calc(${level} * 1.5rem + 1rem)` : '1rem' }}
        >
          <Icon className="h-5 w-5" />
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
          <Logo onClick={onLinkClick} hideTextOnMobile={true} />
           <Button variant="ghost" size="icon" onClick={onLinkClick}>
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="flex flex-col p-4">
            <Link
                href="/"
                className="flex items-center gap-4 py-3 text-base font-medium"
                onClick={onLinkClick}
            >
                <Icons.home className="h-5 w-5" />
                Accueil
            </Link>
            <Link
                href="/products"
                className="flex items-center gap-4 py-3 text-base font-medium"
                onClick={onLinkClick}
            >
                <Icons.layoutGrid className="h-5 w-5" />
                Toute la boutique
            </Link>
        </nav>
        <div className="px-4">
          <Separator />
        </div>
        <Accordion type="multiple" className="flex flex-col py-4">
          {renderCategoryLinks(items)}
        </Accordion>
        <div className="px-4">
          <Separator />
        </div>
        <nav className="flex flex-col gap-1 p-4">
            <Link
                href="/favoris"
                className="flex items-center gap-4 py-3 text-base font-medium"
                onClick={onLinkClick}
            >
                <Heart className="h-5 w-5" />
                Mes favoris
            </Link>
            <Link
                href="/suivi"
                className="flex items-center gap-4 py-3 text-base font-medium"
                onClick={onLinkClick}
            >
                <Truck className="h-5 w-5" />
                Suivi de Commande
            </Link>
            <Link
                href="/sav"
                className="flex items-center gap-4 py-3 text-base font-medium"
                onClick={onLinkClick}
            >
                <Headset className="h-5 w-5" />
                Garantie & SAV
            </Link>
            <Link
                href="/a-propos"
                className="flex items-center gap-4 py-3 text-base font-medium"
                onClick={onLinkClick}
            >
                <Info className="h-5 w-5" />
                À Propos
            </Link>
            <Link
                href="/contact"
                className="flex items-center gap-4 py-3 text-base font-medium"
                onClick={onLinkClick}
            >
                <Mail className="h-5 w-5" />
                Contact
            </Link>
        </nav>
      </ScrollArea>
      
      <div className="p-4 border-t mt-auto bg-background">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Changer de thème</span>
            <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
