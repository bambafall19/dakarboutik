'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { Category } from '@/lib/types';

interface ActiveFiltersProps {
  currentCategory?: Category | null;
  currentBrands: string[];
  currentPriceRange: [number, number];
  searchQuery: string | null;
  onSale: boolean;
  basePath: string;
}

export function ActiveFilters({
  currentCategory,
  currentBrands,
  currentPriceRange,
  searchQuery,
  onSale,
  basePath,
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
    activeFilters.push({ key: 'q', value: searchQuery, label: `Recherche: "${searchQuery}"` });
  }

  if (currentCategory) {
    activeFilters.push({ key: 'category', value: currentCategory.slug, label: `Catégorie: ${currentCategory.name}` });
  }

  currentBrands.forEach(brand => {
    activeFilters.push({ key: 'brands', value: brand, label: `Marque: ${brand}` });
  });
  
  if (onSale) {
     activeFilters.push({ key: 'on_sale', value: 'true', label: 'En promotion' });
  }

  const isDefaultPriceRange = currentPriceRange[0] === 0 && currentPriceRange[1] === 1000000;
  if (!isDefaultPriceRange) {
     activeFilters.push({ key: 'priceRange', value: `${currentPriceRange[0]}-${currentPriceRange[1]}`, label: `Prix: ${currentPriceRange[0].toLocaleString('fr-SN')} - ${currentPriceRange[1].toLocaleString('fr-SN')} FCA` });
  }


  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Filtres actifs :</span>
      {activeFilters.map(filter => (
        <Badge key={filter.label} variant="secondary" className="rounded-full border-primary/20 bg-primary/5 py-1 pl-3 pr-1 text-sm font-medium text-foreground">
          {filter.label}
          <button
            onClick={() => handleRemoveFilter(filter.key, filter.value)}
            className="ml-1.5 rounded-full p-0.5 transition hover:bg-primary/15"
            aria-label={`Retirer le filtre ${filter.label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
       <button onClick={() => router.push(pathname, { scroll: false })} className="text-sm font-semibold text-primary hover:underline">
          Tout effacer
        </button>
    </div>
  );
}
