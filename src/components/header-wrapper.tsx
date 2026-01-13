
'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';
import { MobileNav } from './mobile-nav';
import { Header } from './header';
import type { SiteSettings, Category } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface HeaderWrapperProps {
    settings?: SiteSettings | null;
    settingsLoading: boolean;
    categories: Category[];
}

function HeaderSkeleton() {
    return (
        <div className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex h-20 items-center justify-between gap-4">
                <Skeleton className="h-8 w-8 lg:hidden" />
                <Skeleton className="hidden h-8 w-32 lg:block" />
                <Skeleton className="h-11 flex-1 max-w-xl" />
                <div className="flex items-center gap-2">
                    <Skeleton className="hidden h-10 w-24 lg:block" />
                    <Skeleton className="h-12 w-12 rounded-full" />
                </div>
            </div>
        </div>
    )
}

export function HeaderWrapper({ settings, settingsLoading, categories }: HeaderWrapperProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                {settingsLoading ? (
                    <HeaderSkeleton />
                ) : (
                    <Header
                        settings={settings}
                        loading={settingsLoading}
                        categories={categories}
                        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
                        pathname={pathname}
                    />
                )}
                <SheetContent side="left" className="w-full max-w-sm">
                    <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                    <MobileNav items={categories} onLinkClick={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
            </Sheet>
        </>
    );
}
