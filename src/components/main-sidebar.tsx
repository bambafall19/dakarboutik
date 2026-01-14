
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { CategoryIcons } from './icons';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';
import type { Category, SiteSettings } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { LayoutGrid } from 'lucide-react';
import { Logo } from './logo';

interface MainSidebarProps {
    categories: Category[];
    loading: boolean;
    settings?: SiteSettings | null;
    settingsLoading: boolean;
    onMenuClick: () => void;
}

export function MainSidebar({ categories, loading, settings, settingsLoading, onMenuClick }: MainSidebarProps) {
    const searchParams = useSearchParams();
    const currentCategorySlug = searchParams.get('category');

    const featuredSlugs = ['informatique', 'telephonie', 'accessoires', 'audio'];
    const featuredCategories = categories.filter(c => featuredSlugs.includes(c.slug));
    
    return (
        <aside className="hidden md:flex flex-col items-center gap-4 py-4 border-r bg-background">
             <div className="flex h-14 items-center justify-center border-b px-4 w-full">
                <Logo 
                    onMenuClick={onMenuClick} 
                    imageUrl={settings?.logoUrl} 
                    loading={settingsLoading} 
                    hideTextOnMobile={true} 
                />
            </div>

            <nav className="flex flex-col items-center gap-2 mt-4">
                 {loading ? (
                    <div className='w-full space-y-2 px-2'>
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                    </div>
                 ) : (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                 <Button
                                    variant={"ghost"}
                                    className="w-10 h-10"
                                    onClick={onMenuClick}
                                >
                                    <LayoutGrid className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Menu</p>
                            </TooltipContent>
                        </Tooltip>

                        {featuredCategories.map((category) => {
                            const isActive = currentCategorySlug === category.slug;
                            const Icon = CategoryIcons[category.slug] || LayoutGrid;

                            return (
                                <Tooltip key={category.id}>
                                    <TooltipTrigger asChild>
                                        <Link href={`/products?category=${category.slug}`} className="w-full flex justify-center">
                                            <Button
                                                variant={isActive ? "secondary" : "ghost"}
                                                className={cn("w-10 h-10", isActive && "text-primary")}
                                                size="icon"
                                            >
                                                <Icon className="h-5 w-5" />
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p>{category.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )
                        })}
                     </TooltipProvider>
                 )}
            </nav>
        </aside>
    )
}
