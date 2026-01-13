
'use client';

import { useCategories } from '@/hooks/use-site-data';
import { Card, CardContent } from '@/components/ui/card';
import { CategorySidebar } from './category-sidebar';
import { Skeleton } from './ui/skeleton';

export function HomeSidebar() {
    const { categories, loading } = useCategories();

    if (loading) {
        return (
             <Card>
                <CardContent className="pt-6 space-y-8">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="sticky top-24">
            <Card>
                <CardContent className="pt-6">
                    <CategorySidebar categories={categories} />
                </CardContent>
            </Card>
        </div>
    )
}
