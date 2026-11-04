
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts, useCategories } from '@/hooks/use-site-data';
import { ProductListing } from './product-listing';
import { ProductListingSkeleton } from './product-listing-skeleton';
import { CategorySidebar } from './category-sidebar';
import { ProductFilters } from './product-filters';
import { QuickFilters } from './quick-filters';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { LayoutGrid, SlidersHorizontal, Flame, Sparkles, Tag, Sun, Smartphone, Monitor, House, ArrowUpRight } from 'lucide-react';
import { matchesMarketplaceCategory, normalizeMarketplaceText } from '@/lib/marketplace-model';
import type { Category } from '@/lib/types';

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
  const catalogCategories = useMemo(() => {
    const flat = new Map<string, Category>();
    const visit = (items: Category[]) => items.forEach(c => { flat.set(c.slug, c); visit(c.subCategories || []); });
    visit(categories);
    return Array.from(flat.values());
  }, [categories]);
  const matchesOriginalCategory = (product: (typeof allProducts)[number], slug: string) => {
    if (slug === 'solaire' || slug === 'telephones') return matchesMarketplaceCategory(product, slug);
    const selected = catalogCategories.find(c => c.slug === slug);
    let current = catalogCategories.find(c => c.slug === product.category);
    const seen = new Set<string>();
    while (current && !seen.has(current.id)) {
      if (current.slug === slug) return true;
      seen.add(current.id);
      current = catalogCategories.find(c => c.id === current?.parentId);
    }
    return product.category === slug || !!selected?.subCategories?.some(c => c.slug === product.category);
  };
  const productGroup = (product: (typeof allProducts)[number]) => {
    if (matchesMarketplaceCategory(product, 'solaire')) return 'solaire';
    if (matchesMarketplaceCategory(product, 'telephones')) return 'telephones';
    if (matchesOriginalCategory(product, 'maison-meubles-and-jardin')) return 'maison-complete';
    if (matchesOriginalCategory(product, 'electronique-and-technologies')) return 'tech-complete';
    return 'autres-produits';
  };
  const groupDefinitions = [
    { slug: 'solaire', name: 'Solaire & énergie', detail: 'Batteries, onduleurs et panneaux', icon: Sun, tone: 'bg-amber-100 text-amber-800' },
    { slug: 'telephones', name: 'Téléphones & accessoires', detail: 'Smartphones et accessoires mobiles', icon: Smartphone, tone: 'bg-sky-100 text-sky-800' },
    { slug: 'tech-complete', name: 'Informatique & électronique', detail: 'Ordinateurs, réseaux, audio et sécurité', icon: Monitor, tone: 'bg-violet-100 text-violet-800' },
    { slug: 'maison-complete', name: 'Maison & électroménager', detail: 'Électroménager, meubles et jardin', icon: House, tone: 'bg-rose-100 text-rose-800' },
    { slug: 'autres-produits', name: 'Autres produits', detail: 'Découvrez le reste du catalogue', icon: LayoutGrid, tone: 'bg-slate-100 text-slate-800' },
  ];
  const matchesCategory = (product: (typeof allProducts)[number], slug: string) => groupDefinitions.some(c => c.slug === slug) ? productGroup(product) === slug : matchesOriginalCategory(product, slug);
  const browseCategories = groupDefinitions.map(c => ({ ...c, count: allProducts.filter(p => matchesCategory(p, c.slug)).length })).filter(c => c.count > 0);
  const categoryUrl = (slug: string) => {
    const params = new URLSearchParams();
    if (slug) params.set('category', slug);
    if (searchQuery) params.set('q', searchQuery);
    return `${basePath}?${params.toString()}`;
  };

  // Produits de la catégorie courante (avant filtres)
  const categoryProducts = (() => {
    if (!categorySlug) return allProducts;
    return allProducts.filter(p => matchesCategory(p, categorySlug));
  })();

  // Application des filtres (catégorie, marques, prix, recherche, promos, best-sellers)
  const filteredProducts = (() => {
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
      const words = normalizeMarketplaceText(searchQuery).split(/\s+/).filter(Boolean);
      result = result.filter(p => {
        const text = normalizeMarketplaceText(`${p.title} ${p.description || ''} ${p.brand || ''} ${p.category} ${catalogCategories.find(c => c.slug === p.category)?.name || ''}`);
        return words.every(word => text.includes(word));
      });
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
  })();

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const canShowMore = visibleCount < filteredProducts.length;

  const currentCategory = catalogCategories.find(c => c.slug === categorySlug) || (browseCategories.find(c => c.slug === categorySlug) ? { id: categorySlug!, slug: categorySlug!, name: browseCategories.find(c => c.slug === categorySlug)!.name } : null);

  const availableBrands = (() => {
    const brands = new Set<string>();
    categoryProducts.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  })();

  const brandCounts = (() => {
    const counts: { [brand: string]: number } = {};
    categoryProducts.forEach(p => {
      if (p.brand) counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  })();

  const onSaleCount = categoryProducts.filter(p => typeof p.salePrice === 'number' && p.salePrice > 0 && p.salePrice < p.price).length;

  const totalCategoriesCount = browseCategories.length;

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
          categories={browseCategories.map(c => ({ id: c.slug, slug: c.slug, name: c.name, productCount: c.count }))}
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
      <section aria-labelledby="official-store-title" className="official-hero relative hidden sm:block mb-6 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-yellow-100 p-5 text-slate-900 sm:p-8">
        <div aria-hidden="true" className="hero-glow pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-yellow-300/30 blur-2xl" />
        <div className="relative grid items-center gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="hero-intro">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800"><Sparkles size={15} aria-hidden="true" /> Votre sélection DakarBoutik</span>
            <h2 id="official-store-title" className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">Boutique officielle <span className="text-emerald-700">DakarBoutik</span></h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">Trouvez votre prochain coup de cœur. Commandez au panier ou contactez-nous sur WhatsApp depuis la fiche produit.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="#catalog-search" className="group inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm motion-safe:transition-transform motion-safe:hover:-translate-y-1">Explorer les produits <ArrowUpRight className="motion-safe:transition-transform motion-safe:group-hover:translate-x-1" size={18} aria-hidden="true" /></a>
              <Link href="/boutiques" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-900 motion-safe:transition-transform motion-safe:hover:-translate-y-1">Boutiques partenaires <ArrowUpRight size={17} aria-hidden="true" /></Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3" aria-label="Les univers DakarBoutik">{browseCategories.slice(0,4).map((c,index) => <Link key={c.slug} href={categoryUrl(c.slug) + '#catalog-search'} className="hero-tile group flex min-w-0 items-center gap-3 rounded-2xl border border-white bg-white/85 p-3 shadow-sm hover:border-emerald-300 sm:p-4" style={{animationDelay:`${index * 100}ms`}}><span className={`shrink-0 rounded-xl p-2 ${c.tone}`}><c.icon size={22} aria-hidden="true" /></span><span className="min-w-0"><span className="block text-xs font-bold sm:text-sm">{c.name}</span><span className="mt-1 block text-xs text-slate-500">{c.count} produits</span></span></Link>)}</div>
        </div>
        <style jsx>{`
          @keyframes store-enter { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes store-glow { from { transform: translate(-30px, 15px) scale(.85); } to { transform: translate(0, 0) scale(1); } }
          @media (prefers-reduced-motion: no-preference) {
            .hero-intro { animation: store-enter .6s ease-out both; }
            .official-hero :global(.hero-tile) { animation: store-enter .6s ease-out both; transition: transform .2s, box-shadow .2s; }
            .official-hero :global(.hero-tile:hover) { transform: translateY(-3px); box-shadow: 0 8px 20px -12px #047857; }
            .hero-glow { animation: store-glow 4s ease-out both; }
          }
        `}</style>
      </section>
      <section id="catalog-search" aria-label="Rechercher et parcourir les catégories" className="mb-6 scroll-mt-44 rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold">Quel produit recherchez-vous ?</h2>
        <form key={searchQuery || ''} role="search" className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={e => {
          e.preventDefault();
          const query = String(new FormData(e.currentTarget).get('search') || '').trim();
          const params = new URLSearchParams(currentQuery);
          if (query) params.set('q', query); else params.delete('q');
          router.push(`${basePath}?${params.toString()}`, { scroll: false });
        }}>
          <label className="min-w-0 flex-1"><span className="sr-only">Rechercher dans les produits DakarBoutik</span><input name="search" type="search" defaultValue={searchQuery || ''} placeholder="Batterie, onduleur, téléphone, marque…" className="h-12 w-full rounded-xl border border-slate-300 px-4 text-base" /></label>
          <Button type="submit" className="h-12 rounded-xl px-6">Rechercher</Button>
        </form>
        <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold">Explorez nos univers</p><p className="mt-1 text-xs text-slate-500">Des catégories regroupées pour trouver plus vite.</p></div><Link href={categoryUrl('')} scroll={false} aria-current={!categorySlug ? 'page' : undefined} className={`rounded-full border px-4 py-2 text-sm font-semibold ${!categorySlug ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-emerald-200 text-emerald-800'}`}>Tous les produits · {allProducts.length}</Link></div>
        <nav aria-label="Catégories du catalogue" className="flex gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
          {browseCategories.map(c => <Link key={c.slug} href={categoryUrl(c.slug)} scroll={false} aria-current={categorySlug === c.slug ? 'page' : undefined} className={`group shrink-0 sm:shrink min-w-0 rounded-2xl border p-3 motion-safe:transition-all sm:p-4 ${categorySlug === c.slug ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md'}`}><div className="hidden sm:flex mb-3 items-center justify-between gap-2"><span className={`rounded-xl p-2.5 ${c.tone}`}><c.icon size={23} aria-hidden="true" /></span><span className="text-xs font-medium text-slate-500">{c.count} produits</span></div><span className="block text-sm font-bold text-slate-900 sm:text-base">{c.name}</span><span className="mt-1 hidden text-xs leading-relaxed text-slate-500 sm:block">{c.detail}</span><span className="hidden sm:flex mt-3 items-center gap-1 text-xs font-semibold text-emerald-800">{categorySlug === c.slug ? 'Sélectionné' : 'Découvrir'}<ArrowUpRight size={14} aria-hidden="true" /></span></Link>)}
        </nav>
        {(searchQuery || categorySlug || currentQuery) && <Link href="/products" scroll={false} className="mt-4 inline-block text-sm font-semibold text-emerald-800 underline">Effacer la recherche et les filtres</Link>}
      </section>
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
