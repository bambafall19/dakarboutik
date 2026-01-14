
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Icons, CategoryIcons } from './icons';
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
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentCategorySlug = searchParams.get('category');

    const featuredSlugs = ['informatique', 'telephonie', 'accessoires', 'audio'];
    const featuredCategories = categories.filter(c => featuredSlugs.includes(c.slug));
    
    return (
        <aside className="hidden md:flex flex-col items-center gap-4 py-4 border-r bg-background">
             <div className="flex h-14 items-center justify-center border-b px-4 w-full">
                <Logo 
                    onMenuClick={onMenuClick} 
                    hideTextOnMobile={true} 
                    imageUrl={settings?.logoUrl} 
                    loading={settingsLoading} 
                />
            </div>

            <nav className="flex flex-col items-start gap-2 mt-4 w-full px-2">
                 {loading ? (
                    <div className='w-full space-y-2'>
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                 ) : (
                    <>
                        <Button
                            variant={"ghost"}
                            className={cn("w-full h-10 justify-start text-base font-normal gap-3")}
                            onClick={onMenuClick}
                        >
                            <LayoutGrid className="h-5 w-5" />
                            <span className="text-sm font-medium">Menu</span>
                        </Button>

                        {featuredCategories.map((category) => {
                            const isActive = currentCategorySlug === category.slug;
                            const Icon = CategoryIcons[category.slug] || LayoutGrid;

                            return (
                                <Link key={category.id} href={`/products?category=${category.slug}`} className="w-full">
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={cn("w-full h-10 justify-start text-base font-normal gap-3", isActive && "text-primary")}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="text-sm font-medium">{category.name}</span>
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
