
'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';
import type { SiteSettings, Category } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface HeaderWrapperProps {
    settings?: SiteSettings | null;
    settingsLoading: boolean;
}

function HeaderSkeleton() {
    return (
        <div className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex h-16 items-center justify-between gap-4">
                <Skeleton className="h-8 w-24" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>
        </div>
    )
}

export function HeaderWrapper({ settings, settingsLoading }: HeaderWrapperProps) {
    const pathname = usePathname();

    return (
        <>
            {settingsLoading ? (
                <HeaderSkeleton />
            ) : (
                <Header
                    settings={settings}
                    loading={settingsLoading}
                    pathname={pathname}
                />
            )}
        </>
    );
}
