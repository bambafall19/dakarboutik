'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';

interface MainSidebarProps {
    categories: Category[];
    loading: boolean;
    onOpenMobileMenu: () => void;
}

export function MainSidebar({ categories, loading, onOpenMobileMenu }: MainSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategorySlug = searchParams.get('category');


  const SidebarSkeleton = () => (
    <div className="px-4 space-y-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-10 rounded-full" />)}
    </div>
  )

  return (
    <div className="hidden border-r bg-card lg:flex flex-col items-center">
        <div className="flex h-20 items-center justify-center border-b w-full">
            <Button size="icon" className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={onOpenMobileMenu}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
            </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-6">
            <TooltipProvider>
                <div className="flex flex-col items-center gap-4">
                    {loading ? <SidebarSkeleton /> : (
                        categories.map(category => {
                            const Icon = category.icon;
                            const isSelected = activeCategorySlug === category.slug;
                            return (
                                <Tooltip key={category.id}>
                                    <TooltipTrigger asChild>
                                        <Link 
                                            href={`/products?category=${category.slug}`}
                                            className={cn(
                                                "flex items-center justify-center h-12 w-12 rounded-full transition-colors duration-200",
                                                isSelected 
                                                    ? "bg-primary/10 text-primary" 
                                                    : "text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            {Icon ? <Icon className="h-6 w-6" /> : null}
                                            <span className="sr-only">{category.name}</span>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p>{category.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )
                        })
                    )}
                </div>
            </TooltipProvider>
        </nav>
    </div>
  );
}
