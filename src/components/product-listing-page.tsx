
'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts, useCategories } from '@/hooks/use-site-data';
import { ProductListing } from './product-listing';
import { ProductListingSkeleton } from './product-listing-skeleton';
import { CategorySidebar } from './category-sidebar';
import { ProductFilters } from './product-filters';
import { QuickFilters } from './quick-filters';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { LayoutGrid, SlidersHorizontal, Flame, Sparkles, Tag } from 'lucide-react';

export function ProductListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { products: allProducts, loading: productsLoading } = useProducts();
  const { categories } = useCategories();
  const [visibleCount, setVisibleCount] = useState(12);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const currentQuery = searchParams.toString();
  const categorySlug = searchParams.get('category');
  const currentBrands = (searchParams.get('brands') || '').split(',').filter(Boolean);
  const priceParam = searchParams.get('priceRange') || '';
  const priceMin = Number(priceParam.split('-')[0]);
  const priceMax = Number(priceParam.split('-')[1]);
  const currentPriceRange = useMemo<[number, number]>(
    () =>
      priceParam && !isNaN(priceMin) && !isNaN(priceMax)
        ? [priceMin, priceMax]
        : [0, 10000000],
    [priceParam, priceMin, priceMax]
  );
  const searchQuery = searchParams.get('q');
  const onSale = searchParams.get('on_sale') === 'true';
  const bestsellerOnly = searchParams.get('bestseller') === 'true';
  const sortBy = searchParams.get('sortBy') || 'newest';

  const basePath = '/products';

  // Produits de la catégorie courante (avant filtres)
  const categoryProducts = useMemo(() => {
    if (!categorySlug) return allProducts;
    return allProducts.filter(p => p.category === categorySlug);
  }, [allProducts, categorySlug]);

  // Application des filtres (catégorie, marques, prix, recherche, promos, best-sellers)
  const filteredProducts = useMemo(() => {
    let result = categoryProducts;

    if (currentBrands.length > 0) {
      result = result.filter(p => !!p.brand && currentBrands.includes(p.brand));
    }

    if (currentPriceRange[0] > 0 || currentPriceRange[1] < 10000000) {
      result = result.filter(p => {
        const price = p.salePrice ?? p.price;
        return price >= currentPriceRange[0] && price <= currentPriceRange[1];
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        (p.description || '').toLowerCase().includes(query) ||
        (p.brand || '').toLowerCase().includes(query)
      );
    }

    if (onSale) {
      result = result.filter(p => typeof p.salePrice === 'number' && p.salePrice > 0 && p.salePrice < p.price);
    }

    if (bestsellerOnly) {
      result = result.filter(p => p.isBestseller);
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'price_asc') {
        return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
      }
      if (sortBy === 'price_desc') {
        return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    categoryProducts,
    currentBrands,
    currentPriceRange,
    searchQuery,
    onSale,
    bestsellerOnly,
    sortBy,
  ]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const canShowMore = visibleCount < filteredProducts.length;

  const currentCategory = categories.find(c => c.slug === categorySlug) || null;

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    categoryProducts.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [categoryProducts]);

  const brandCounts = useMemo(() => {
    const counts: { [brand: string]: number } = {};
    categoryProducts.forEach(p => {
      if (p.brand) counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, [categoryProducts]);

  const onSaleCount = useMemo(
    () => categoryProducts.filter(p => typeof p.salePrice === 'number' && p.salePrice > 0 && p.salePrice < p.price).length,
    [categoryProducts]
  );

  const totalCategoriesCount = categories.filter(c => !c.parentId).length;

  const pageTitle = currentCategory ? currentCategory.name : 'Tous nos produits';
  const description = currentCategory
    ? `Découvrez notre sélection ${currentCategory.name.toLowerCase()} : produits authentiques, prix justes et livraison rapide à Dakar.`
    : undefined;

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  // Réinitialise la pagination quand les filtres changent
  const [previousQuery, setPreviousQuery] = useState(currentQuery);
  if (previousQuery !== currentQuery) {
    setPreviousQuery(currentQuery);
    setVisibleCount(12);
  }

  if (productsLoading) {
    return <ProductListingSkeleton />;
  }

  const filterSections = (
    <>
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-headline text-xs font-bold uppercase tracking-[0.16em] text-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Flame className="h-3.5 w-3.5" />
          </span>
          À la une
        </h3>
        <QuickFilters />
      </div>

      <div className="border-t border-border/60 pt-5">
        <h3 className="mb-3 flex items-center gap-2 font-headline text-xs font-bold uppercase tracking-[0.16em] text-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <LayoutGrid className="h-3.5 w-3.5" />
          </span>
          Catégories
        </h3>
        <CategorySidebar
          categories={categories}
          currentCategorySlug={categorySlug}
          basePath={basePath}
          currentQuery={currentQuery}
        />
      </div>

      <div className="border-t border-border/60 pt-5">
        <ProductFilters
          availableBrands={availableBrands}
          currentBrands={currentBrands}
          currentPriceRange={currentPriceRange}
          currentQuery={currentQuery}
          brandCounts={brandCounts}
        />
      </div>
    </>
  );

  return (
    <div className="container py-4 md:py-8">
      {/* Barre mobile : filtres rapides + ouverture des filtres */}
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="h-11 shrink-0 rounded-full border-border/70 bg-card px-4 font-semibold shadow-sm"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4 text-primary" />
              Filtres
              {(currentBrands.length > 0 || currentPriceRange[0] > 0 || currentPriceRange[1] < 10000000 || categorySlug) && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {currentBrands.length + (currentPriceRange[0] > 0 || currentPriceRange[1] < 10000000 ? 1 : 0) + (categorySlug ? 1 : 0)}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-3xl p-0">
            <SheetHeader className="sticky top-0 z-10 border-b border-border/60 bg-background/95 px-5 py-4 backdrop-blur">
              <SheetTitle className="flex items-center gap-2 font-headline text-lg font-extrabold">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Affiner la sélection
              </SheetTitle>
              <SheetDescription className="sr-only">
                Filtrez les produits par catégorie, marque, prix et promotions.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 px-5 py-5">{filterSections}</div>
            <div className="sticky bottom-0 border-t border-border/60 bg-background/95 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur">
              <Button
                className="h-12 w-full rounded-full font-semibold"
                onClick={() => setIsFilterSheetOpen(false)}
              >
                Voir les résultats
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
          {[
            { label: 'Meilleures ventes', icon: Flame, query: { bestseller: 'true' } },
            { label: 'Nouveautés', icon: Sparkles, query: { sortBy: 'newest' } },
            { label: 'Promotions', icon: Tag, query: { on_sale: 'true' } },
          ].map((chip) => {
            const isActive = (() => {
              const current = new URLSearchParams(currentQuery);
              current.delete('category');
              const target = new URLSearchParams();
              Object.entries(chip.query).forEach(([k, v]) => target.set(k, v));
              return current.toString() === target.toString();
            })();
            return (
              <button
                key={chip.label}
                onClick={() => {
                  const params = new URLSearchParams();
                  Object.entries(chip.query).forEach(([k, v]) => params.set(k, v));
                  router.push(`${basePath}?${params.toString()}`, { scroll: false });
                }}
                className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition ${
                  isActive
                    ? 'border-primary/30 bg-primary text-primary-foreground'
                    : 'border-border/70 bg-card text-muted-foreground'
                }`}
              >
                <chip.icon className="h-3.5 w-3.5" />
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Rail de filtres (desktop) */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24 space-y-5 rounded-3xl border border-border/60 bg-card/70 p-5 shadow-[0_24px_60px_-45px_rgba(16,42,35,0.7)] backdrop-blur">
            {filterSections}
          </div>
        </aside>

        {/* Résultats */}
        <main className="lg:col-span-9">
          <ProductListing
            products={visibleProducts}
            suggestedProducts={allProducts.filter(p => p.isBestseller).slice(0, 3)}
            pageTitle={pageTitle}
            category={currentCategory}
            sortBy={sortBy}
            basePath={basePath}
            currentQuery={currentQuery}
            totalProductsCount={filteredProducts.length}
            canShowMore={canShowMore}
            onShowMore={handleShowMore}
            currentBrands={currentBrands}
            currentPriceRange={currentPriceRange}
            searchQuery={searchQuery}
            onSale={onSale}
            totalCategoriesCount={totalCategoriesCount}
            onSaleCount={onSaleCount}
            brandCount={availableBrands.length}
            description={description}
          />
        </main>
      </div>
    </div>
  );
}
