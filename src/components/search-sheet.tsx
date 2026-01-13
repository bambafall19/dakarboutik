
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Icons } from './icons';
import { Button } from './ui/button';
import { useRecentProducts } from '@/hooks/use-recent-products';
import { ProductCard } from './product-card';
import { ScrollArea } from './ui/scroll-area';
import { useCategories } from '@/hooks/use-site-data';
import Link from 'next/link';
import { Separator } from './ui/separator';

interface SearchSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchSheet({ open, onOpenChange }: SearchSheetProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const { recentProducts } = useRecentProducts();
    const { categories } = useCategories();

    const topLevelCategories = categories.slice(0, 4);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/products?q=${query.trim()}`);
            onOpenChange(false);
        }
    };

    useEffect(() => {
        if (!open) {
            setQuery('');
        }
    }, [open]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-full flex flex-col">
                <div className="flex items-center gap-2 border-b -mx-6 px-4 pb-4">
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-10 w-10">
                        <Icons.arrowRight className="h-5 w-5 rotate-180" />
                    </Button>
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher un produit..."
                            className="w-full bg-muted pl-10 h-11 text-base"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </form>
                </div>
                <ScrollArea className="flex-1 -mx-6">
                    <div className="p-6 space-y-8">
                        {recentProducts.length > 0 && (
                             <div>
                                <h3 className="font-semibold mb-4">Récemment consultés</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {recentProducts.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <Separator />
                        {topLevelCategories.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-4">Catégories populaires</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {topLevelCategories.map(category => (
                                        <Button key={category.id} variant="outline" asChild className="justify-start">
                                            <Link href={`/products?category=${category.slug}`} onClick={() => onOpenChange(false)}>
                                                {category.name}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
