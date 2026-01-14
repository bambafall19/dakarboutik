
import { Suspense } from 'react';
import { ProductListing } from '@/components/product-listing';
import { ProductListingSkeleton } from '@/components/product-listing-skeleton';
import { getAllChildCategorySlugs, buildCategoryHierarchy } from '@/lib/data-helpers';
import type { Product, Category } from '@/lib/types';
import { CategorySidebar } from '@/components/category-sidebar';
import { ProductFilters } from '@/components/product-filters';
import { Card, CardContent } from '@/components/ui/card';
import { getProducts, getCategories } from '@/lib/data-firebase';

// This is the Server Component that fetches data and handles filtering logic.
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Safely extract search parameters on the server
  const categoryFilter = typeof searchParams.category === 'string' ? searchParams.category : null;
  const brandFilter = typeof searchParams.brands === 'string' ? searchParams.brands.split(',').filter(Boolean) : [];
  const priceRangeFilter = typeof searchParams.priceRange === 'string' ? searchParams.priceRange : null;
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : null;
  const sortBy = typeof searchParams.sortBy === 'string' ? searchParams.sortBy : 'newest';

  const [allProducts, rawCategories] = await Promise.all([getProducts(), getCategories()]);

  const categories = buildCategoryHierarchy(rawCategories);

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

  const currentSearchParams = {
    category: categoryFilter,
    brands: brandFilter.join(','),
    priceRange: priceRangeFilter,
    q: searchQuery,
    sortBy: sortBy,
  };

  return (
    <div className="py-2">
      <Suspense fallback={<ProductListingSkeleton />}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="hidden md:block md:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardContent className="pt-6 space-y-8">
                  <CategorySidebar categories={categories} totalProducts={totalProducts} searchParams={currentSearchParams} />
                  <ProductFilters searchParams={currentSearchParams} />
                </CardContent>
              </Card>
            </div>
          </aside>
          <main className="md:col-span-3">
            <ProductListing
              products={filteredProducts}
              allCategories={categories}
              totalProducts={totalProducts}
              suggestedProducts={bestsellers}
              searchParams={currentSearchParams}
            />
          </main>
        </div>
      </Suspense>
    </div>
  );
}
