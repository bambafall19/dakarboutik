
"use client";

import { useSearchParams } from 'next/navigation';
import type { Product, Category } from '@/lib/types';
import { ProductFilters } from '@/components/product-filters';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Icons } from './icons';
import { useMemo } from 'react';
import { getCategoryBySlug } from '@/lib/data';

interface ProductListingProps {
    products: Product[];
    allCategories: Category[];
    brands: string[];
}

export function ProductListing({ products, allCategories, brands }: ProductListingProps) {
  const searchParams = useSearchParams();

  const selectedCategorySlugs = searchParams.get('category')?.split(',') || [];
  
  const selectedCategoryName = useMemo(() => {
    if (selectedCategorySlugs.length === 1) {
      const cat = getCategoryBySlug(selectedCategorySlugs[0]);
      return cat?.name || 'Produits';
    }
    return 'Tous les produits';
  }, [selectedCategorySlugs]);

  const filterNode = (
    <ProductFilters
        allCategories={allCategories}
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
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        <aside className="hidden md:block md:col-span-1">
          {filterNode}
        </aside>
        <main>
          <div className="flex justify-between items-center mb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{selectedCategoryName}</h1>
                <p className="text-muted-foreground mt-1">{products.length} résultat(s)</p>
            </div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="md:hidden">
                        <Icons.filter className="mr-2 h-4 w-4" />
                        Filtrer
                    </Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col w-full sm:max-w-xs">
                    <SheetHeader>
                        <SheetTitle>Filtres</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto -mx-6 px-6">
                      {filterNode}
                    </div>
                </SheetContent>
            </Sheet>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
