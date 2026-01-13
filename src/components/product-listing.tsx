
"use client";

import { useSearchParams } from 'next/navigation';
import type { Product, Category } from '@/lib/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Icons } from './icons';
import { useMemo, useState } from 'react';
import { getCategoryBySlug } from '@/lib/data-helpers';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ProductFilters } from './product-filters';
import { CategorySidebar } from './category-sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { usePathname, useRouter } from 'next/navigation';


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
      // Need to search in nested categories
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
    // Keep category and sort
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
       <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{selectedCategoryName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] gap-8">
        <aside className="hidden md:block md:col-span-1">
          <CategorySidebar categories={allCategories} />
        </aside>
        <main>
          <div className="flex justify-between items-center mb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{selectedCategoryName}</h1>
                <p className="text-muted-foreground mt-1">{products.length} résultat(s)</p>
            </div>
            <div className='flex items-center gap-2'>
              <div className='hidden md:flex items-center gap-2'>
                <p className='text-sm text-muted-foreground'>Trier par</p>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder="Trier par..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Nouveautés</SelectItem>
                    <SelectItem value="price_asc">Prix: Croissant</SelectItem>
                    <SelectItem value="price_desc">Prix: Décroissant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                       <div className="p-4 border-t flex justify-end">
                        <Button onClick={clearFilters} variant="ghost" size="sm" className='mr-2'>Effacer</Button>
                        <Button onClick={() => setIsFiltersOpen(false)} size="sm">Appliquer</Button>
                      </div>
                  </PopoverContent>
              </Popover>

              <Sheet>
                  <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="md:hidden">
                          <Icons.menu className="h-5 w-5" />
                      </Button>
                  </SheetTrigger>
                  <SheetContent className="flex flex-col w-full sm:max-w-xs">
                      <SheetHeader>
                          <SheetTitle>Catégories</SheetTitle>
                      </SheetHeader>
                      <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
                        <CategorySidebar categories={allCategories} />
                      </div>
                  </SheetContent>
              </Sheet>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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
      </div>
    </>
  );
}
