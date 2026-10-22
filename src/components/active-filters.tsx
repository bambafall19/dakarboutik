
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { X, SlidersHorizontal } from 'lucide-react';
import type { Category } from '@/lib/types';

interface ActiveFiltersProps {
  currentCategory?: Category | null;
  currentBrands: string[];
  currentPriceRange: [number, number];
  searchQuery: string | null;
  onSale: boolean;
}

const formatCfa = (value: number) => new Intl.NumberFormat('fr-SN').format(value);

export function ActiveFilters({
  currentCategory,
  currentBrands,
  currentPriceRange,
  searchQuery,
  onSale,
}: ActiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRemoveFilter = (key: string, valueToRemove?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key === 'brands' && valueToRemove) {
      const brands = params.get('brands')?.split(',') || [];
      const newBrands = brands.filter(b => b !== valueToRemove);
      if (newBrands.length > 0) {
        params.set('brands', newBrands.join(','));
      } else {
        params.delete('brands');
      }
    } else {
      params.delete(key);
    }
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const activeFilters = [];

  if (searchQuery) {
    activeFilters.push({ key: 'q', value: searchQuery, label: `Recherche : "${searchQuery}"` });
  }

  if (currentCategory) {
    activeFilters.push({ key: 'category', value: currentCategory.slug, label: currentCategory.name });
  }

  currentBrands.forEach(brand => {
    activeFilters.push({ key: 'brands', value: brand, label: brand });
  });
  
  if (onSale) {
     activeFilters.push({ key: 'on_sale', value: 'true', label: 'En promotion' });
  }

  const isDefaultPriceRange = currentPriceRange[0] === 0 && currentPriceRange[1] === 10000000;
  if (!isDefaultPriceRange) {
     activeFilters.push({ key: 'priceRange', value: `${currentPriceRange[0]}-${currentPriceRange[1]}`, label: `${formatCfa(currentPriceRange[0])} - ${formatCfa(currentPriceRange[1])} FCFA` });
  }


  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="my-5 flex flex-wrap items-center gap-2">
      <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filtres
      </span>
      {activeFilters.map(filter => (
        <span
          key={filter.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 py-1.5 pl-3.5 pr-1.5 text-xs font-semibold text-foreground"
        >
          {filter.label}
          <button
            onClick={() => handleRemoveFilter(filter.key, filter.value)}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary transition hover:bg-primary hover:text-primary-foreground"
            aria-label={`Retirer le filtre ${filter.label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
       <button onClick={() => router.push(pathname, { scroll: false })} className="ml-1 text-xs font-bold text-primary underline-offset-4 hover:underline">
          Tout effacer
       </button>
    </div>
  );
}
