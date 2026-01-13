
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Category } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface MainSidebarProps {
    categories: Category[];
    loading: boolean;
}

export function MainSidebar({ categories, loading }: MainSidebarProps) {
  const pathname = usePathname();

  const renderCategoryTree = (categories: Category[]) => {
    return categories.map(category => {
      const hasSubCategories = category.subCategories && category.subCategories.length > 0;
      const isSelected = pathname === `/products?category=${category.slug}`;
      const Icon = category.icon;

      if (hasSubCategories) {
        return (
          <AccordionItem value={category.slug} key={category.id} className="border-b-0">
            <AccordionTrigger className={cn("hover:no-underline text-base", isSelected && "text-primary hover:text-primary")}>
                <span className="flex items-center gap-3">
                    {Icon && <Icon className="h-5 w-5" />}
                    {category.name}
                </span>
            </AccordionTrigger>
            <AccordionContent className="pl-8">
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
            href={`/products?category=${category.slug}`}
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-base",
                isSelected && "bg-muted text-primary font-semibold"
            )}
        >
            {Icon && <Icon className="h-5 w-5" />}
            {category.name}
        </Link>
      );
    });
  };

  const SidebarSkeleton = () => (
    <div className="px-4 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
    </div>
  )

  return (
    <div className="hidden border-r bg-card lg:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-6">
            <Logo />
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="grid items-start px-4 text-sm font-medium">
            <Accordion type="multiple" className="w-full">
                {loading ? <SidebarSkeleton /> : renderCategoryTree(categories)}
            </Accordion>
          </nav>
        </div>
      </div>
    </div>
  );
}
