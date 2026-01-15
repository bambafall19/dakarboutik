
"use client";

import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';
import { findImage } from '@/lib/placeholder-images';
import { SortDropdown } from './sort-dropdown';

interface ProductListingProps {
    products: Product[];
    suggestedProducts?: Product[];
    pageTitle: string;
    categorySlug: string | null;
    sortBy: string;
    basePath: string;
    currentQuery: string;
}

export function ProductListing({ products, suggestedProducts, pageTitle, categorySlug, sortBy, basePath, currentQuery }: ProductListingProps) {
  
  const categoryImageId = categorySlug ? `product-${categorySlug}-1a` : 'banner1';
  let categoryImage;
  try {
    categoryImage = findImage(categoryImageId);
    if (categoryImage.id === 'not-found') {
        categoryImage = findImage('banner1'); // Default fallback
    }
  } catch(e) {
    categoryImage = findImage('banner1');
  }
  
  return (
    <>
      <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-8 bg-muted">
        <img src={categoryImage.imageUrl} alt={pageTitle} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white text-center drop-shadow-lg px-4">{pageTitle}</h1>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <p className="text-sm text-muted-foreground">{products.length} résultat(s)</p>
        <SortDropdown 
          sortBy={sortBy}
          basePath={basePath}
          currentQuery={currentQuery}
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
            <div>
              <h3 className="text-xl font-semibold mb-4">Nos meilleures ventes</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {suggestedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
