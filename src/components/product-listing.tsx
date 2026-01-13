
"use client";

import { useSearchParams } from 'next/navigation';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Icons } from './icons';
import { useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ProductFilters } from './product-filters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { findImage } from '@/lib/placeholder-images';

interface ProductListingProps {
    products: Product[];
    allCategories: Category[];
    brands: string[];
}

export function ProductListing({ products, allCategories, brands }: ProductListingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const selectedCategorySlug = searchParams.get('category');
  const sortBy = searchParams.get('sortBy') || 'newest';

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

  const selectedCategoryName = selectedCategory?.name || 'Tous les produits';
  const categoryImage = selectedCategory ? findImage(`product-${selectedCategory.slug}-1a`) : findImage('banner-1');

  const updateSearchParams = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
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
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy');
    const newParams = new URLSearchParams();
    if (category) newParams.set('category', category);
    if (sortBy) newParams.set('sortBy', sortBy);

    const query = newParams.toString() ? `?${newParams.toString()}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
  };

  const filterNode = (
    <ProductFilters
        brands={brands}
    />
  );

  return (
    <>
      <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-8">
        <Image src={categoryImage.imageUrl} alt={selectedCategoryName} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white text-center drop-shadow-lg">{selectedCategoryName}</h1>
        </div>
      </div>
      
      <main>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <p className="text-muted-foreground">{products.length} résultat(s)</p>
            
            <div className='flex items-center gap-4'>
                <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            <Icons.filter className="mr-2 h-4 w-4" />
                            Filtrer
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                        <SheetHeader className='p-4 border-b'>
                            <SheetTitle>Filtres</SheetTitle>
                        </SheetHeader>
                        <div className="p-4">
                          {filterNode}
                        </div>
                        <div className="p-4 border-t flex justify-between">
                          <Button onClick={clearFilters} variant="ghost" size="sm">Effacer</Button>
                          <Button onClick={() => setIsFiltersOpen(false)} size="sm">Appliquer</Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className='w-[200px]'>
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
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {products.length === 0 && (
            <div className="text-center py-16 col-span-full">
              <h2 className="text-2xl font-semibold">Aucun produit trouvé</h2>
              <p className="mt-2 text-muted-foreground">Essayez d'ajuster vos filtres.</p>
            </div>
          )}
        </main>
    </>
  );
}
