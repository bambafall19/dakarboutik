
"use client";

import type { Product, Category } from '@/lib/types';
import { ProductCard } from './product-card';
import { findImage } from '@/lib/placeholder-images';
import { SortDropdown } from './sort-dropdown';
import { useSiteSettings } from '@/hooks/use-site-data';
import { ActiveFilters } from './active-filters';
import { Button } from './ui/button';
import { SearchX } from 'lucide-react';

interface ProductListingProps {
    products: Product[];
    suggestedProducts?: Product[];
    pageTitle: string;
    category?: Category | null;
    sortBy: string;
    basePath: string;
    currentQuery: string;
    totalProductsCount: number;
    canShowMore: boolean;
    onShowMore: () => void;
    currentBrands: string[];
    currentPriceRange: [number, number];
    searchQuery: string | null;
    onSale: boolean;
}

const categoryBannerImages: { [key: string]: string } = {
    'telephonie': 'product-phone-1a',
    'informatique': 'banner-laptops',
    'audio': 'banner-headphones',
    'accessoires': 'banner-accessories',
    'electricite-energie-and-securite': 'product-electricite-energie-and-securite-1a',
    'electronique-and-technologies': 'product-electronique-and-technologies-1a',
};


export function ProductListing({ 
    products, 
    suggestedProducts, 
    pageTitle, 
    category, 
    sortBy, 
    basePath, 
    currentQuery,
    totalProductsCount,
    canShowMore,
    onShowMore,
    currentBrands,
    currentPriceRange,
    searchQuery,
    onSale
}: ProductListingProps) {
  const { settings } = useSiteSettings();
  
  let categoryImage;
  
  if (category?.bannerImageUrl) {
    categoryImage = { imageUrl: category.bannerImageUrl, description: pageTitle, id: category.id, imageHint: 'banner' };
  } else if (category) {
    const imageId = category.slug ? categoryBannerImages[category.slug] : 'banner-all-products';
    try {
        categoryImage = findImage(imageId || 'banner1');
        if (categoryImage.id === 'not-found') {
        categoryImage = findImage('banner1');
        }
    } catch (e) {
        categoryImage = findImage('banner1');
    }
  } else {
    // "All products" page
    if (settings.allProductsBannerUrl) {
      categoryImage = { imageUrl: settings.allProductsBannerUrl, description: pageTitle, id: 'all-products-banner-custom', imageHint: 'banner' };
    } else {
      categoryImage = findImage('banner-all-products');
    }
  }
  
  return (
    <>
      <div className="relative mb-6 h-40 overflow-hidden rounded-2xl bg-muted md:h-56">
        <img src={categoryImage.imageUrl} alt={pageTitle} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <span className="mb-2 rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
              Boutique
            </span>
            <h1 className="font-headline text-2xl font-extrabold text-white drop-shadow-lg md:text-4xl">{pageTitle}</h1>
        </div>
      </div>
      
      <div className="mb-5 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm sm:flex-row">
        <p className="text-sm text-muted-foreground">
          <span className="font-headline font-bold text-foreground">{totalProductsCount}</span>{' '}
          produit{totalProductsCount > 1 ? 's' : ''}
        </p>
        <SortDropdown 
          sortBy={sortBy}
          basePath={basePath}
          currentQuery={currentQuery}
        />
      </div>

       <ActiveFilters
        currentCategory={category}
        currentBrands={currentBrands}
        currentPriceRange={currentPriceRange}
        searchQuery={searchQuery}
        onSale={onSale}
        basePath={basePath}
      />
      
      {products.length > 0 ? (
         <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map(product => (
            <ProductCard key={product.id} product={product} />
            ))}
        </div>
      ) : (
        <div className="col-span-full space-y-8 py-16 text-center">
          <div className="flex flex-col items-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 ring-1 ring-primary/10">
              <SearchX className="h-8 w-8 text-primary/60" />
            </span>
            <h2 className="mt-5 font-headline text-xl font-bold">Aucun produit trouvé</h2>
            <p className="mt-2 text-sm text-muted-foreground">Essayez d&apos;ajuster vos filtres ou votre recherche.</p>
          </div>
          {suggestedProducts && suggestedProducts.length > 0 && (
            <div>
              <h3 className="mb-6 font-headline text-xl font-bold">Nos meilleures ventes</h3>
               <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-3">
                {suggestedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {canShowMore && (
        <div className="mt-12 text-center">
            <Button onClick={onShowMore} size="lg" className="rounded-full bg-primary px-8 hover:bg-primary/90">
              Afficher plus de produits
            </Button>
        </div>
      )}
    </>
  );
}
