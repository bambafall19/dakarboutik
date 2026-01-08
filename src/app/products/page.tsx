"use client";

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, getCategories } from '@/lib/data';
import type { Product } from '@/lib/types';
import { ProductGrid } from '@/components/product-grid';
import { ProductFilters } from '@/components/product-filters';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const allProducts = getProducts();
const allCategories = getCategories();
const allBrands = [...new Set(allProducts.map(p => p.brand))];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: '',
    priceRange: [0, 1000000] as [number, number],
    sortBy: 'newest',
  });

  const filteredProducts = useMemo(() => {
    let products: Product[] = allProducts;

    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
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
  }, [filters]);

  const selectedCategoryName = allCategories.find(c => c.slug === filters.category)?.name || 'Tous les produits';

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
          <ProductFilters
            categories={allCategories}
            brands={allBrands}
            filters={filters}
            onFilterChange={setFilters}
          />
        </aside>
        <main className="md:col-span-3">
          <h1 className="text-3xl font-bold tracking-tight mb-4">{selectedCategoryName}</h1>
          <p className="text-muted-foreground mb-6">{filteredProducts.length} résultat(s)</p>
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
