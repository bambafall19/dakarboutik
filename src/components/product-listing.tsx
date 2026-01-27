
"use client";

import type { Product, Category } from '@/lib/types';
import { ProductCard } from './product-card';
import { findImage } from '@/lib/placeholder-images';
import { SortDropdown } from './sort-dropdown';
import { useSiteSettings } from '@/hooks/use-site-data';
import { ActiveFilters } from './active-filters';
import { Button } from './ui/button';

interface ProductListingProps {
    products: Product[];
    suggestedProducts?: Product[];
    pageTitle: string;
    category: Category | null;
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
      <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-8 bg-muted">
        <img src={categoryImage.imageUrl} alt={pageTitle} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white text-center drop-shadow-lg px-4">{pageTitle}</h1>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <p className="text-sm text-muted-foreground">{totalProductsCount} résultat(s)</p>
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
         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
            <ProductCard key={product.id} product={product} />
            ))}
        </div>
      ) : (
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

      {canShowMore && (
        <div className="text-center mt-12">
            <Button onClick={onShowMore} variant="outline" size="lg">Afficher plus</Button>
        </div>
      )}
    </>
  );
}
