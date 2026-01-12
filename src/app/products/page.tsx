
'use client';

import { Suspense, useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ProductListing } from '@/components/product-listing';
import { ProductListingSkeleton } from '@/components/product-listing-skeleton';
import { useProducts, useCategories } from '@/hooks/use-site-data';
import { getSimpleCategories } from '@/lib/data';

// This new component will wrap the logic and be suspended.
function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const simpleCategories = useMemo(() => getSimpleCategories(), []);
  
  // Initialize state from URL search params
  const initialCategory = searchParams.get('category');
  const initialSortBy = searchParams.get('sortBy');
  const initialBrands = searchParams.get('brands');
  const initialPriceRange = searchParams.get('priceRange');

  const [filters, setFilters] = useState(() => {
     let priceRange: [number, number] = [0, 1000000];
     if (initialPriceRange) {
        const [min, max] = initialPriceRange.split('-').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          priceRange = [min, max];
        }
     }

    return {
      categories: initialCategory ? [initialCategory] : [],
      brands: initialBrands ? initialBrands.split(',') : [],
      priceRange: priceRange,
      sortBy: initialSortBy || 'newest',
    }
  });

  // Effect to update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.categories.length > 0) {
      params.set('category', filters.categories.join(','));
    }
    if (filters.brands.length > 0) {
      params.set('brands', filters.brands.join(','));
    }
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000000) {
      params.set('priceRange', `${filters.priceRange[0]}-${filters.priceRange[1]}`);
    }
    if (filters.sortBy !== 'newest') {
      params.set('sortBy', filters.sortBy);
    }
    
    // Using replace to avoid polluting browser history
    router.replace(`${pathname}?${params.toString()}`);

  }, [filters, pathname, router]);

  const brands = useMemo(() => {
    const allBrands = products.map((p) => p.brand).filter(Boolean) as string[];
    return [...new Set(allBrands)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (filters.categories.length > 0) {
      const parentCategories = filters.categories.filter(catSlug => categories.find(c => c.slug === catSlug && c.subCategories && c.subCategories.length > 0));
      const childSlugs = parentCategories.flatMap(catSlug => {
        const cat = categories.find(c => c.slug === catSlug);
        return cat?.subCategories?.flatMap(sub => sub.subCategories ? sub.subCategories.map(s => s.slug) : sub.slug) ?? [];
      });
      const allFilterSlugs = [...filters.categories, ...childSlugs];
      filtered = filtered.filter((p) => allFilterSlugs.includes(p.category));
    }
    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) => p.brand && filters.brands.includes(p.brand));
    }

    filtered = filtered.filter(p => {
      const price = p.salePrice ?? p.price;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    switch (filters.sortBy) {
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
  }, [products, filters, categories]);


  if (productsLoading || categoriesLoading) {
    return <ProductListingSkeleton />;
  }

  return (
    <ProductListing
      products={filteredProducts}
      categories={simpleCategories}
      brands={brands}
      filters={filters}
      onFilterChange={setFilters}
    />
  );
}


export default function ProductsPage() {
  return (
    <div className="py-8">
      <Suspense fallback={<ProductListingSkeleton />}>
        <ProductsPageContent />
      </Suspense>
    </div>
  );
}
