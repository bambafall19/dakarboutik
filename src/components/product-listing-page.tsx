'use client';

import { ProductListing } from '@/components/product-listing';
import { getAllChildCategorySlugs, getCategoryBySlug, getCategoriesWithCounts } from '@/lib/data-helpers';
import type { Product, Category } from '@/lib/types';
import { CategorySidebar } from '@/components/category-sidebar';
import { ProductFilters } from '@/components/product-filters';
import { useProducts, useCategories } from '@/hooks/use-site-data';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ProductListingSkeleton } from './product-listing-skeleton';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const ITEMS_PER_PAGE = 12;

export function ProductListingPage() {
  const searchParams = useSearchParams();

  const categoryFilter = searchParams.get('category');
  const brandFilter = searchParams.get('brands')?.split(',') || [];
  const priceRangeFilter = searchParams.get('priceRange');
  const searchQuery = searchParams.get('q');
  const sortBy = searchParams.get('sortBy') || 'newest';
  const onSaleFilter = searchParams.get('on_sale') === 'true';
  
  const { products: allProducts, loading: productsLoading } = useProducts();
  const { rawCategories, loading: categoriesLoading } = useCategories();
  
  const loading = productsLoading || categoriesLoading;

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const currentQueryString = searchParams.toString();
  
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [currentQueryString]);

  const categories = useMemo(() => {
    if (loading || !rawCategories || !allProducts) return [];
    return getCategoriesWithCounts(rawCategories, allProducts);
  }, [loading, rawCategories, allProducts]);

  const currentCategory = useMemo(() => {
    return categoryFilter && rawCategories ? getCategoryBySlug(categoryFilter, rawCategories) : null;
  }, [categoryFilter, rawCategories]);

  const pageTitle = useMemo(() => {
    if (onSaleFilter) return 'Promotions';
    return currentCategory?.name || 'Tous les produits';
  }, [currentCategory, onSaleFilter]);

  const availableBrands = useMemo(() => {
    if (loading || !allProducts) return [];
    return [...new Set(allProducts.map(p => p.brand).filter(Boolean) as string[])].sort();
  }, [loading, allProducts]);

  const selectedPriceRange: [number, number] = useMemo(() => {
    let range: [number, number] = [0, 1000000];
    if (priceRangeFilter) {
      const [min, max] = priceRangeFilter.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        range = [min, max];
      }
    }
    return range;
  }, [priceRangeFilter]);

  const filteredProducts = useMemo(() => {
    if (loading || !allProducts || !rawCategories) return [];
    
    let filtered: Product[] = [...allProducts];

    if (searchQuery) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }
    
    if (onSaleFilter) {
      filtered = filtered.filter(p => p.salePrice && p.salePrice > 0);
    }

    if (categoryFilter) {
        const allSelectedSlugs = getAllChildCategorySlugs(categoryFilter, rawCategories);
        const uniqueSlugs = [...new Set(allSelectedSlugs)];
        filtered = filtered.filter((p) => uniqueSlugs.includes(p.category));
    }
      
    if (brandFilter.length > 0) {
      filtered = filtered.filter((p) => p.brand && brandFilter.includes(p.brand));
    }

    filtered = filtered.filter(p => {
      const price = p.salePrice ?? p.price;
      return price >= selectedPriceRange[0] && price <= selectedPriceRange[1];
    });

    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  }, [loading, allProducts, rawCategories, searchQuery, categoryFilter, brandFilter, selectedPriceRange, sortBy, onSaleFilter]);
  
  const productsToShow = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const canShowMore = visibleCount < filteredProducts.length;
  
  const bestsellers = useMemo(() => allProducts?.filter(p => p.isBestseller).slice(0, 4) || [], [allProducts]);
  const totalProducts = useMemo(() => allProducts?.length || 0, [allProducts]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  if (loading) {
    return <ProductListingSkeleton />;
  }

  const filterNode = (
    <div className="space-y-8">
      <CategorySidebar 
        categories={categories} 
        totalProducts={totalProducts}
        currentCategorySlug={categoryFilter}
        basePath="/products"
        currentQuery={currentQueryString}
      />
      <ProductFilters 
        availableBrands={availableBrands}
        currentBrands={brandFilter}
        currentPriceRange={selectedPriceRange}
        basePath="/products"
        currentQuery={currentQueryString}
      />
    </div>
  );

  return (
    <div className="py-2 container">
      <div className='md:hidden mb-4'>
        <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filtres et Catégories
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className='p-0'>
             <SheetHeader className='p-4 border-b'>
                <SheetTitle>Filtres</SheetTitle>
              </SheetHeader>
            <div className="p-4 overflow-y-auto" onClick={() => setIsMobileFiltersOpen(false)}>
              {filterNode}
            </div>
          </SheetContent>
        </Sheet>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
        <aside className="hidden md:block md:col-span-1">
            <div className="sticky top-24">
                {filterNode}
            </div>
        </aside>
        
        <main className="md:col-span-3">
            <ProductListing
                products={productsToShow}
                suggestedProducts={bestsellers}
                pageTitle={pageTitle}
                category={currentCategory}
                sortBy={sortBy}
                basePath="/products"
                currentQuery={currentQueryString}
                totalProductsCount={filteredProducts.length}
                onShowMore={() => setVisibleCount(v => v + ITEMS_PER_PAGE)}
                canShowMore={canShowMore}
                currentBrands={brandFilter}
                currentPriceRange={selectedPriceRange}
                searchQuery={searchQuery}
                onSale={onSaleFilter}
            />
        </main>
      </div>
    </div>
  );
}
