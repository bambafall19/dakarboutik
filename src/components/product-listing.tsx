
"use client";

import type { Product, Category } from '@/lib/types';
import { ProductCard } from './product-card';
import { findImage } from '@/lib/placeholder-images';
import { SortDropdown } from './sort-dropdown';
import { useSiteSettings } from '@/hooks/use-site-data';
import { ActiveFilters } from './active-filters';
import { Button } from './ui/button';
import { ArrowRight, PackageSearch, Sparkles, Tag, Truck } from 'lucide-react';

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
    totalCategoriesCount: number;
    onSaleCount: number;
    brandCount: number;
    description?: string;
}

const categoryBannerImages: { [key: string]: string } = {
    'telephonie': 'product-phone-1a',
    'informatique': 'banner-laptops',
    'audio': 'banner-headphones',
    'accessoires': 'banner-accessories',
    'electricite-energie-and-securite': 'product-electricite-energie-and-securite-1a',
    'electronique-and-technologies': 'product-electronique-and-technologies-1a',
};

const formatNumber = (value: number) => new Intl.NumberFormat('fr-SN').format(value);

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
    onSale,
    totalCategoriesCount,
    onSaleCount,
    brandCount,
    description,
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
    } catch {
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

  const subtitle = description ?? (
    category
      ? `Découvrez notre sélection ${category.name.toLowerCase()} : produits authentiques, prix justes et livraison rapide à Dakar.`
      : "Toute notre boutique en un seul endroit : électronique, accessoires, audio et plus encore. Des produits authentiques, un service local, des prix justes."
  );

  const stats = [
    { label: `${formatNumber(totalProductsCount)} produit${totalProductsCount > 1 ? 's' : ''}`, icon: PackageSearch },
    { label: `${formatNumber(totalCategoriesCount)} catégorie${totalCategoriesCount > 1 ? 's' : ''}`, icon: Sparkles },
    ...(brandCount > 0 ? [{ label: `${formatNumber(brandCount)} marque${brandCount > 1 ? 's' : ''}`, icon: Tag }] : []),
  ];

  return (
    <>
      {/* ── En-tête éditorial ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 shadow-[0_34px_80px_-56px_rgba(16,42,35,0.9)]">
        <div className="absolute inset-0">
          <img src={categoryImage.imageUrl} alt={pageTitle} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        <div className="relative flex min-h-[230px] flex-col justify-end gap-4 p-5 sm:p-8 md:min-h-[310px] md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-accent-foreground shadow-sm">
              <Sparkles className="h-3 w-3" />
              Boutique
            </span>
            {onSaleCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-destructive-foreground shadow-sm">
                <Tag className="h-3 w-3" />
                {formatNumber(onSaleCount)} en promo
              </span>
            )}
          </div>

          <div>
            <h1 className="text-balance font-headline text-3xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-lg md:text-5xl">
              {pageTitle}
            </h1>
            <p className="mt-2.5 max-w-2xl text-balance text-sm leading-relaxed text-white/80 md:text-base">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {stats.map((stat) => (
              <span
                key={stat.label}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-md"
              >
                <stat.icon className="h-3.5 w-3.5 text-accent" />
                {stat.label}
              </span>
            ))}
            {settings.shippingCostDakar ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-md">
                <Truck className="h-3.5 w-3.5 text-accent" />
                Livraison dès {formatNumber(settings.shippingCostDakar)} FCFA
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Barre de résultats ────────────────────────────────────────── */}
      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-[0_1px_2px_rgba(16,42,35,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-baseline gap-2 text-sm text-muted-foreground">
          <span className="font-headline text-lg font-extrabold tracking-tight text-foreground">
            {formatNumber(totalProductsCount)}
          </span>
          <span>produit{totalProductsCount > 1 ? 's' : ''} disponible{totalProductsCount > 1 ? 's' : ''}</span>
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
      />

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 xl:grid-cols-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="col-span-full space-y-10 py-14 text-center">
          <div className="flex flex-col items-center">
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 ring-1 ring-primary/10">
              <PackageSearch className="h-9 w-9 text-primary/70" />
            </span>
            <h2 className="mt-6 font-headline text-2xl font-extrabold tracking-tight">Aucun produit trouvé</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Essayez d&apos;ajuster vos filtres, d&apos;élargir votre recherche ou de parcourir une autre catégorie.
            </p>
          </div>
          {suggestedProducts && suggestedProducts.length > 0 && (
            <div>
              <h3 className="mb-6 font-headline text-xl font-extrabold tracking-tight">Nos meilleures ventes</h3>
              <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
                {suggestedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {canShowMore && (
        <div className="mt-12 flex justify-center">
          <Button
            onClick={onShowMore}
            size="lg"
            className="group h-12 rounded-full bg-primary px-8 font-semibold text-primary-foreground shadow-[0_18px_36px_-20px_rgba(11,110,79,0.95)] transition hover:bg-primary/90"
          >
            Afficher plus de produits
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      )}
    </>
  );
}
