
"use client";

import { useState, useMemo } from 'react';
import type { Product, SimpleCategory, Category } from '@/lib/types';
import { ProductFilters } from '@/components/product-filters';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ProductCard } from './product-card';
import { getCategories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Icons } from './icons';

interface ProductListingProps {
    products: Product[];
    categories: SimpleCategory[];
    brands: string[];
    initialCategory?: string;
}

export function ProductListing({ products: allProducts, categories: simpleCategories, brands, initialCategory }: ProductListingProps) {
  const [filters, setFilters] = useState({
    category: initialCategory || '',
    brand: '',
    priceRange: [0, 1000000] as [number, number],
    sortBy: 'newest',
  });

  const categories = useMemo(() => getCategories(), []);

  const filteredProducts = useMemo(() => {
    let products: Product[] = allProducts;

    if (filters.category) {
      const selectedCategory = categories.find(c => c.slug === filters.category);
      const categorySlugs = [
        filters.category,
        ...(selectedCategory?.subCategories?.map(sc => sc.slug) || [])
      ];
      products = products.filter(p => categorySlugs.includes(p.category));
    }
    
    if (filters.brand) {
      products = products.filter(p => p.brand === filters.brand);
    }
    
    products = products.filter(p => {
      const price = p.salePrice ?? p.price;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    switch (filters.sortBy) {
      case 'price_asc':
        products.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price_desc':
        products.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case 'newest':
      default:
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return products;
  }, [allProducts, filters, categories]);

  const selectedCategoryName = categories.find(c => c.slug === filters.category)?.name || 'Tous les produits';
  
  const filterNode = (
    <ProductFilters
        categories={categories}
        brands={brands}
        filters={filters}
        onFilterChange={setFilters}
    />
  );

  return (
    <div className="container py-8">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="hidden md:block md:col-span-1">
          {filterNode}
        </aside>
        <main className="md:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{selectedCategoryName}</h1>
                <p className="text-muted-foreground mt-1">{filteredProducts.length} résultat(s)</p>
            </div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="md:hidden">
                        <Icons.filter className="mr-2 h-4 w-4" />
                        Filtrer
                    </Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Filtres</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto -mx-6 px-6">
                      {filterNode}
                    </div>
                </SheetContent>
            </Sheet>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold">Aucun produit trouvé</h2>
              <p className="mt-2 text-muted-foreground">Essayez d'ajuster vos filtres.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
