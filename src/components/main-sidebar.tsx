
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Icons, CategoryIcons } from './icons';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface MainSidebarProps {
    categories: Category[];
    loading: boolean;
    onMenuClick: () => void;
}

export function MainSidebar({ categories, loading, onMenuClick }: MainSidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentCategorySlug = searchParams.get('category');
    
    return (
        <aside className="hidden md:flex flex-col items-center gap-4 py-4 border-r bg-background">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={onMenuClick}
                        >
                            <Icons.menu className="h-6 w-6" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>Toutes les catégories</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <nav className="flex flex-col items-center gap-2 mt-4">
                 {loading && (
                    <>
                        <Skeleton className="h-10 w-20 rounded-lg" />
                        <Skeleton className="h-10 w-20 rounded-lg" />
                        <Skeleton className="h-10 w-20 rounded-lg" />
                        <Skeleton className="h-10 w-20 rounded-lg" />
                    </>
                 )}
                 {!loading && categories.map((category) => {
                    const isActive = currentCategorySlug === category.slug;

                    return (
                        <Link key={category.id} href={`/products?category=${category.slug}`} className="w-full px-2">
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn("w-full justify-start", isActive && "text-primary")}
                            >
                                <span className='truncate'>{category.name}</span>
                            </Button>
                        </Link>
                    )
                 })}
            </nav>
        </aside>
    )
}
