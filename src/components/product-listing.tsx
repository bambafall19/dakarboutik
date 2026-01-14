
"use client";

import type { Product, Category } from '@/lib/types';
import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Icons } from './icons';
import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { findImage } from '@/lib/placeholder-images';
import { ProductFilters } from './product-filters';
import { CategorySidebar } from './category-sidebar';
import { ProductGrid } from './product-grid';

interface ProductListingProps {
    products: Product[];
    suggestedProducts?: Product[];
    searchParams: { [key: string]: string | null };
}

export function ProductListing({ products, suggestedProducts, searchParams }: ProductListingProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const { category: selectedCategorySlug, q: searchQuery, sortBy = 'newest' } = searchParams;

  const pageTitle = searchQuery ? `Recherche: "${searchQuery}"` : 'Tous les produits';
  
  const categoryImageId = selectedCategorySlug ? `product-${selectedCategorySlug}-1a` : 'banner-1';
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
    const current = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
        if (v) {
            current.set(k, v);
        }
    }
    

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
  
  return (
    <>
      <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-8 bg-muted">
        <Image src={categoryImage.imageUrl} alt={pageTitle} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white text-center drop-shadow-lg px-4">{pageTitle}</h1>
        </div>
      </div>
      
      <div>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <p className="text-sm text-muted-foreground">{products.length} résultat(s)</p>
            
            <div className='flex items-center gap-2'>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
        </div>
    </>
  );
}
