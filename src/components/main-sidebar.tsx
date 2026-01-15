
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { CategoryIcons, Icons } from './icons';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';
import type { Category, SiteSettings } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { User, Menu, ChevronRight } from 'lucide-react';
import { Separator } from './ui/separator';

interface MainSidebarProps {
    categories: Category[];
    loading: boolean;
    onMenuClick: () => void;
}

export function MainSidebar({ categories, loading, onMenuClick }: MainSidebarProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentCategorySlug = searchParams.get('category');
    
    return (
        <aside className="hidden md:block w-[280px] border-r pr-4">
            <nav className="flex flex-col gap-1 py-4">
                {loading ? (
                    <div className='w-full space-y-2 px-2'>
                        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                ) : (
                    <>
                        {categories.map((category) => {
                            const isActive = currentCategorySlug === category.slug;
                            const Icon = CategoryIcons[category.slug] || Icons.layoutGrid;
                            const hasSubCategories = category.subCategories && category.subCategories.length > 0;

                            return (
                                <Link key={category.id} href={`/products?category=${category.slug}`} className="w-full flex justify-center">
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={cn("w-full h-10 justify-between px-3", isActive && "text-primary font-bold")}
                                    >
                                        <div className='flex items-center gap-2'>
                                            <Icon className="h-5 w-5" />
                                            <span>{category.name}</span>
                                        </div>
                                        {hasSubCategories && <ChevronRight className="h-4 w-4" />}
                                    </Button>
                                </Link>
                            )
                        })}
                    </>
                )}
            </nav>
        </aside>
    )
}
