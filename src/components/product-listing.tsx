
"use client";

import type { Product, Category } from '@/lib/types';
import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Icons } from './icons';
import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { findImage } from '@/lib/placeholder-images';
import { ProductFilters } from './product-filters';
import { CategorySidebar } from './category-sidebar';
import { ProductGrid } from './product-grid';

interface ProductListingProps {
    products: Product[];
    allCategories: Category[];
    suggestedProducts?: Product[];
    totalProducts: number;
    searchParams: { [key: string]: string | string[] | undefined };
}

export function ProductListing({ products, allCategories, suggestedProducts, totalProducts, searchParams }: ProductListingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const selectedCategorySlug = typeof searchParams.category === 'string' ? searchParams.category : null;
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : null;
  const sortBy = typeof searchParams.sortBy === 'string' ? searchParams.sortBy : 'newest';

  const selectedCategory = useMemo(() => {
    if (selectedCategorySlug) {
      const findCat = (cats: Category[]): Category | undefined => {
        for (const cat of cats) {
          if (cat.slug === selectedCategorySlug) return cat;
          if (cat.subCategories) {
            const found = findCat(cat.subCategories);
            if (found) return found;
          }
        }
      }
      return findCat(allCategories)
    }
    return null;
  }, [selectedCategorySlug, allCategories]);

  const pageTitle = searchQuery ? `Recherche: "${searchQuery}"` : selectedCategory?.name || 'Tous les produits';
  
  const categoryImageId = selectedCategory ? `product-${selectedCategory.slug}-1a` : 'banner-1';
  // Fallback if specific category image doesn't exist
  let categoryImage;
  try {
    categoryImage = findImage(categoryImageId);
    if (categoryImage.id === 'not-found') {
        categoryImage = findImage('banner-1'); // Default fallback
    }
  } catch(e) {
    categoryImage = findImage('banner-1');
  }


  const updateSearchParams = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(currentSearchParams.entries()));
    if (value === null || value === '') {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
  };
  
  const handleSortChange = (value: string) => {
    updateSearchParams('sortBy', value);
  };
  
  const clearFilters = () => {
    const paramsToKeep = ['category', 'q', 'sortBy'];
    const newParams = new URLSearchParams();
    
    paramsToKeep.forEach(param => {
        const value = currentSearchParams.get(param);
        if (value) {
            newParams.set(param, value);
        }
    });

    const query = newParams.toString() ? `?${newParams.toString()}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
  };

  const filterNode = (
    <div className="space-y-8">
        <CategorySidebar categories={allCategories} totalProducts={totalProducts}/>
        <ProductFilters />
    </div>
  );

  return (
    <>
      <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-8 bg-muted">
        <Image src={categoryImage.imageUrl} alt={pageTitle} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white text-center drop-shadow-lg px-4">{pageTitle}</h1>
        </div>
      </div>
      
      <main>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <p className="text-sm text-muted-foreground">{products.length} résultat(s)</p>
            
            <div className='flex items-center gap-2'>
                <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className='md:hidden'>
                            <Icons.filter className="mr-2 h-4 w-4" />
                            Filtrer
                        </Button>
                    </SheetTrigger>
                    <SheetContent className='flex flex-col'>
                         <SheetHeader className='-mx-6 px-6 pb-4 border-b'>
                            <SheetTitle>Filtres & Catégories</SheetTitle>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto -mx-6 px-6">
                          {filterNode}
                        </div>
                        <div className="-mx-6 px-6 pt-4 border-t flex justify-between">
                          <Button onClick={clearFilters} variant="ghost" size="sm">Effacer</Button>
                          <Button onClick={() => setIsFiltersOpen(false)} size="sm">Appliquer</Button>
                        </div>
                    </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className='w-auto md:w-[200px] text-sm'>
                    <SelectValue placeholder="Trier par..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Nouveautés</SelectItem>
                    <SelectItem value="price_asc">Prix: Croissant</SelectItem>
                    <SelectItem value="price_desc">Prix: Décroissant</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {products.length === 0 && (
            <div className="text-center py-16 col-span-full space-y-8">
              <div>
                <h2 className="text-2xl font-semibold">Aucun produit trouvé</h2>
                <p className="mt-2 text-muted-foreground">Essayez d'ajuster vos filtres ou votre recherche.</p>
              </div>
              {suggestedProducts && suggestedProducts.length > 0 && (
                <ProductGrid 
                  title="Nos meilleures ventes pourraient vous plaire"
                  products={suggestedProducts}
                  gridClass='grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                />
              )}
            </div>
          )}
        </main>
    </>
  );
}
