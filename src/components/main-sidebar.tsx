'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { CategoryIcons, Icons } from './icons';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';
import type { Category, SiteSettings } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Home, User, Menu } from 'lucide-react';
import { Logo } from './logo';
import { Separator } from './ui/separator';

interface MainSidebarProps {
    categories: Category[];
    loading: boolean;
    settings?: SiteSettings | null;
    settingsLoading: boolean;
    onMenuClick: () => void;
}

export function MainSidebar({ categories, loading, settings, settingsLoading, onMenuClick }: MainSidebarProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentCategorySlug = searchParams.get('category');

    const featuredSlugs = ['informatique', 'telephonie', 'accessoires', 'audio'];
    const featuredCategories = categories.filter(c => featuredSlugs.includes(c.slug));
    
    return (
        <aside className="hidden md:flex flex-col items-center gap-4 py-4 border-r bg-background">
             <div className="flex h-14 items-center justify-center px-4 w-full">
                
            </div>

            <nav className="flex flex-col items-center gap-2 mt-4 flex-1">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={"ghost"}
                                className="w-12 h-12 rounded-full bg-red-700 hover:bg-red-800 text-white"
                                onClick={onMenuClick}
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Toutes les catégories</p>
                        </TooltipContent>
                    </Tooltip>
                    
                    <Separator className='my-4 w-8' />
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Link href="/" className="w-full flex justify-center">
                                <Button
                                    variant={pathname === '/' ? "secondary" : "ghost"}
                                    className={cn("w-10 h-10", pathname === '/' && "text-primary")}
                                    size="icon"
                                >
                                    <Home className="h-5 w-5" />
                                </Button>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Accueil</p>
                        </TooltipContent>
                    </Tooltip>


                    {loading ? (
                        <div className='w-full space-y-2 px-2 mt-2'>
                            <Skeleton className="h-10 w-10 mx-auto" />
                            <Skeleton className="h-10 w-10 mx-auto" />
                            <Skeleton className="h-10 w-10 mx-auto" />
                            <Skeleton className="h-10 w-10 mx-auto" />
                        </div>
                    ) : (
                        <>
                            {featuredCategories.map((category) => {
                                const isActive = currentCategorySlug === category.slug;
                                const Icon = CategoryIcons[category.slug] || Icons.layoutGrid;

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
                        </>
                    )}
                 </TooltipProvider>
            </nav>
            <div className="mt-auto flex flex-col items-center gap-4">
                 <TooltipProvider>
                    <Tooltip>
                         <TooltipTrigger asChild>
                             <Link href="/login" className="w-full flex justify-center">
                                <Button
                                    variant="ghost"
                                    className={cn("w-10 h-10", pathname === '/login' && "text-primary")}
                                    size="icon"
                                >
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Compte</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            </div>
        </aside>
    )
}
