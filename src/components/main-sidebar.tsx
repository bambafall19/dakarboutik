
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    const searchParams = usePathname();
    const currentCategorySlug = searchParams.split('/products/')[1]?.split('/')[0] || '';
    
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
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <Skeleton className="h-12 w-12 rounded-lg" />
                    </>
                 )}
                 {!loading && categories.map((category) => {
                    const Icon = CategoryIcons[category.slug] || Icons.smartphone;
                    const isActive = pathname.includes(`/products?category=${category.slug}`);

                    return (
                        <TooltipProvider key={category.id}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href={`/products?category=${category.slug}`}>
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            size="icon"
                                            className={cn("h-12 w-12 rounded-lg", isActive && "text-primary")}
                                        >
                                            <Icon className="h-6 w-6" />
                                        </Button>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>{category.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )
                 })}
            </nav>
        </aside>
    )
}
