'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import React from 'react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  availableBrands: string[];
  currentBrands: string[];
  currentPriceRange: [number, number];
  basePath: string;
  currentQuery: string;
}

const priceRanges = [
    { label: "Tous", min: 0, max: 10000000 },
    { label: "0 - 600.000 CFA", min: 0, max: 600000 },
    { label: "600.000 - 1.200.000 CFA", min: 600000, max: 1200000 },
    { label: "1.200.000 - 3.000.000 CFA", min: 1200000, max: 3000000 },
    { label: "Plus de 3.000.000 CFA", min: 3000000, max: 10000000 },
];

export function ProductFilters({ 
  availableBrands,
  currentBrands,
  currentPriceRange,
  basePath,
  currentQuery,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handlePriceChange = (min: number, max: number) => {
    const params = new URLSearchParams(currentQuery);
    if (min > 0 || max < 10000000) {
      params.set('priceRange', `${min}-${max}`);
    } else {
      params.delete('priceRange');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  const handleBrandChange = (brand: string) => {
    const params = new URLSearchParams(currentQuery);
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand];

    if (newBrands.length > 0) {
      params.set('brands', newBrands.join(','));
    } else {
      params.delete('brands');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  const isDefaultPrice = currentPriceRange[0] === 0 && (currentPriceRange[1] === 10000000);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-3 font-headline text-sm font-bold uppercase tracking-wider text-foreground">
          Prix
        </h3>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map(range => {
            const isActive = (range.label === 'Tous' && isDefaultPrice) || (currentPriceRange[0] === range.min && currentPriceRange[1] === range.max);
            return (
              <button
                key={range.label}
                onClick={() => handlePriceChange(range.min, range.max)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </div>

      {availableBrands.length > 0 && (
        <div>
          <h3 className="mb-3 font-headline text-sm font-bold uppercase tracking-wider text-foreground">
            Marques
          </h3>
          <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
            {availableBrands.map(brand => {
              const checked = currentBrands.includes(brand);
              return (
                <label
                  key={brand}
                  htmlFor={`brand-${brand}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition',
                    checked ? 'bg-primary/5 text-foreground' : 'text-muted-foreground hover:bg-secondary'
                  )}
                >
                  <Checkbox 
                    id={`brand-${brand}`} 
                    checked={checked}
                    onCheckedChange={() => handleBrandChange(brand)}
                  />
                  <span className="flex-1">{brand}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
