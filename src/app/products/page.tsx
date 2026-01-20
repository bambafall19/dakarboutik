

import { Suspense, use } from 'react';
import { ProductListing } from '@/components/product-listing';
import { getAllChildCategorySlugs, buildCategoryHierarchy, getCategoryBySlug } from '@/lib/data-helpers';
import type { Product, Category } from '@/lib/types';
import { CategorySidebar } from '@/components/category-sidebar';
import { ProductFilters } from '@/components/product-filters';
import { getProducts, getCategories } from '@/lib/data-firebase';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SortDropdown } from '@/components/sort-dropdown';


// This is a server-side only function
function getCategoriesWithCounts(rawCategories: Category[], allProducts: Product[]): Category[] {
  const productCounts: { [categorySlug: string]: number } = {};
  allProducts.forEach(product => {
    productCounts[product.category] = (productCounts[product.category] || 0) + 1;
  });

  const categoryMap: { [id: string]: Category & { children: Category[] } } = {};
  rawCategories.forEach(cat => {
    categoryMap[cat.id] = { ...cat, productCount: 0, children: [] };
  });

  const getChildrenCount = (catId: string): number => {
    const cat = categoryMap[catId];
    if (!cat) return 0;

    // Count products directly in this category
    let total = productCounts[cat.slug] || 0;
    
    // Recursively count products in subcategories
    const children = rawCategories.filter(c => c.parentId === catId);
    for (const child of children) {
        total += getChildrenCount(child.id);
    }
    return total;
  };

  const categoriesWithCounts = rawCategories.map(cat => ({
    ...cat,
    productCount: getChildrenCount(cat.id),
  }));

  return buildCategoryHierarchy(categoriesWithCounts);
}


// This is the Server Component that fetches data and handles filtering logic.
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const sp = use(searchParams);

  // Safely extract search parameters on the server
  const categoryFilter = typeof sp.category === 'string' ? sp.category : null;
  const brandFilter = typeof sp.brands === 'string' ? sp.brands.split(',').filter(Boolean) : [];
  const priceRangeFilter = typeof sp.priceRange === 'string' ? sp.priceRange : null;
  const searchQuery = typeof sp.q === 'string' ? sp.q : null;
  const sortBy = typeof sp.sortBy === 'string' ? sp.sortBy : 'newest';

  const [allProducts, rawCategories] = await Promise.all([getProducts(), getCategories()]);
  
  const categories = getCategoriesWithCounts(rawCategories, allProducts);
  
  const pageTitle = categoryFilter 
    ? getCategoryBySlug(categoryFilter, rawCategories)?.name || (categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)).replace(/-/g, ' ')
    : 'Tous les produits';


  const availableBrands = [...new Set(allProducts.map(p => p.brand).filter(Boolean) as string[])].sort();

  const selectedPriceRange: [number, number] = (() => {
    let range: [number, number] = [0, 1000000];
    if (priceRangeFilter) {
      const [min, max] = priceRangeFilter.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        range = [min, max];
      }
    }
    return range;
  })();

  const filteredProducts = (() => {
    let filtered: Product[] = [...allProducts];

    // Search Query
    if (searchQuery) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }

    // Category
    if (categoryFilter) {
        const allSelectedSlugs = getAllChildCategorySlugs(categoryFilter, rawCategories);
        const uniqueSlugs = [...new Set(allSelectedSlugs)];
        filtered = filtered.filter((p) => uniqueSlugs.includes(p.category));
    }
      
    // Brand
    if (brandFilter.length > 0) {
      filtered = filtered.filter((p) => p.brand && brandFilter.includes(p.brand));
    }

    // Price
    filtered = filtered.filter(p => {
      const price = p.salePrice ?? p.price;
      return price >= selectedPriceRange[0] && price <= selectedPriceRange[1];
    });

    // Sort
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
  })();

  const bestsellers = allProducts?.filter(p => p.isBestseller).slice(0, 4) || [];
  const totalProducts = allProducts?.length || 0;

  const params = new URLSearchParams();
  if (categoryFilter) params.set('category', categoryFilter);
  if (brandFilter.length > 0) params.set('brands', brandFilter.join(','));
  if (priceRangeFilter) params.set('priceRange', priceRangeFilter);
  if (searchQuery) params.set('q', searchQuery);
  if (sortBy) params.set('sortBy', sortBy);
  const currentQueryString = params.toString();
  
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
      {/* Mobile Filter Button */}
      <div className='md:hidden mb-4'>
        <Sheet>
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
            <div className="p-4 overflow-y-auto">
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
                products={filteredProducts}
                suggestedProducts={bestsellers}
                pageTitle={pageTitle}
                categorySlug={categoryFilter}
                sortBy={sortBy}
                basePath="/products"
                currentQuery={currentQueryString}
            />
        </main>
      </div>
    </div>
  );
}
