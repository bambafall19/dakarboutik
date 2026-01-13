
'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';
import type { SiteSettings, Category } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface HeaderWrapperProps {
    settings?: SiteSettings | null;
    settingsLoading: boolean;
    categories: Category[];
    categoriesLoading: boolean;
    onMobileMenuClick: () => void;
    onSearchClick: () => void;
}

function HeaderSkeleton() {
    return (
        <div className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="h-8 bg-muted" />
            <div className="container flex h-16 items-center justify-between gap-4">
                <Skeleton className="h-8 w-24" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>
        </div>
    )
}

export function HeaderWrapper({ settings, settingsLoading, categories, categoriesLoading, onMobileMenuClick, onSearchClick }: HeaderWrapperProps) {
    const pathname = usePathname();

    return (
        <>
            {settingsLoading || categoriesLoading ? (
                <HeaderSkeleton />
            ) : (
                <Header
                    settings={settings}
                    loading={settingsLoading}
                    categories={categories}
                    categoriesLoading={categoriesLoading}
                    onMobileMenuClick={onMobileMenuClick}
                    onSearchClick={onSearchClick}
                />
            )}
        </>
    );
}
