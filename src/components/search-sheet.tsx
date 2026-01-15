
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Icons } from './icons';
import { Button } from './ui/button';
import { useRecentProducts } from '@/hooks/use-recent-products';
import { ProductCard } from './product-card';
import { ScrollArea } from './ui/scroll-area';
import { useCategories, useProducts } from '@/hooks/use-site-data';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function SearchSheetContent({ open, onOpenChange }: SearchSheetProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);

    const { recentProducts } = useRecentProducts();
    const { categories } = useCategories();
    const { products } = useProducts();

    const suggestedSlugs = ['telephonie', 'informatique', 'audio', 'accessoires'];
    const suggestedCategories = categories.filter(c => suggestedSlugs.includes(c.slug));
    
    const searchResults = useMemo(() => {
        if (debouncedQuery.length < 2) return [];
        return products.filter(p => 
            p.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            (p.brand && p.brand.toLowerCase().includes(debouncedQuery.toLowerCase()))
        ).slice(0, 10); // Limit results for performance
    }, [debouncedQuery, products]);

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

    const showSuggestions = query.length < 2;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0 top-20 translate-y-0 sm:max-w-2xl">
                 <DialogTitle className="sr-only">Panneau de recherche</DialogTitle>
                <div className="flex items-center gap-2 border-b p-4">
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
                <ScrollArea className="max-h-[calc(100vh-10rem)]">
                    <div className="p-6 space-y-8">
                        {showSuggestions ? (
                            <>
                                {recentProducts.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-4">Récemment consultés</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {recentProducts.slice(0,2).map(product => (
                                                <ProductCard key={product.id} product={product} variant="horizontal" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {suggestedCategories.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-4">Suggestions</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {suggestedCategories.map(category => (
                                                <Button key={category.id} variant="outline" asChild className="justify-start">
                                                    <Link href={`/products?category=${category.slug}`} onClick={() => onOpenChange(false)}>
                                                        {category.name}
                                                    </Link>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div>
                                {searchResults.length > 0 ? (
                                    <>
                                        <h3 className="font-semibold mb-4">Résultats de la recherche</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {searchResults.map(product => (
                                                 <ProductCard key={product.id} product={product} variant="horizontal" />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">Aucun produit trouvé pour "{debouncedQuery}"</p>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

export function SearchSheet(props: SearchSheetProps) {
    // Wrap with Suspense because useSearchParams is used in parent components
    return (
        <Suspense fallback={null}>
            <SearchSheetContent {...props} />
        </Suspense>
    )
}
