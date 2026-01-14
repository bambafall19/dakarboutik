
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Icons, CategoryIcons } from './icons';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { LayoutGrid } from 'lucide-react';
import { Logo } from './logo';

interface MainSidebarProps {
    categories: Category[];
    loading: boolean;
    onMenuClick: () => void;
}

export function MainSidebar({ categories, loading, onMenuClick }: MainSidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentCategorySlug = searchParams.get('category');

    const featuredSlugs = ['informatique', 'telephonie', 'accessoires', 'audio'];
    const featuredCategories = categories.filter(c => featuredSlugs.includes(c.slug));
    
    return (
        <aside className="hidden md:flex flex-col items-center gap-4 py-4 border-r bg-background">
            <Link href="/" className="flex items-center justify-center">
                <Logo />
            </Link>

            <nav className="flex flex-col items-center gap-2 mt-4 w-full">
                 {loading && (
                    <div className='px-2 w-full space-y-2'>
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                 )}
                 {!loading && (
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={"ghost"}
                                    className={cn("w-full h-12 flex-col gap-1")}
                                    onClick={onMenuClick}
                                >
                                    <Icons.menu className="h-6 w-6" />
                                    <span className="text-xs font-normal">Menu</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Toutes les catégories</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                 )}
                 {!loading && featuredCategories.map((category) => {
                    const isActive = currentCategorySlug === category.slug;
                    const Icon = CategoryIcons[category.slug] || LayoutGrid;

                    return (
                        <Link key={category.id} href={`/products?category=${category.slug}`} className="w-full px-2">
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            className={cn("w-full h-12 flex-col gap-1", isActive && "text-primary")}
                                        >
                                            <Icon className="h-6 w-6" />
                                            <span className="text-xs font-normal">{category.name}</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p>{category.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Link>
                    )
                 })}
            </nav>
        </aside>
    )
}
