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
    <Accordion type="multiple" defaultValue={['price', 'brand']} className="w-full">
        <AccordionItem value="price" className="border-b-0">
            <AccordionTrigger className="font-semibold text-base hover:no-underline py-0">Filtrer par prix</AccordionTrigger>
            <AccordionContent>
                <div className="pt-2 space-y-1">
                    {priceRanges.map(range => {
                        const isActive = (range.label === 'Tous' && isDefaultPrice) || (currentPriceRange[0] === range.min && currentPriceRange[1] === range.max);
                        return (
                            <button
                                key={range.label}
                                onClick={() => handlePriceChange(range.min, range.max)}
                                className={cn("w-full text-left px-2 py-1.5 rounded-md hover:bg-accent text-sm text-muted-foreground", {
                                    'text-primary font-semibold': isActive
                                })}
                            >
                                {range.label === 'Tous' ? <span className="text-blue-600">Tous</span> : range.label}
                            </button>
                        )
                    })}
                </div>
            </AccordionContent>
        </AccordionItem>
        {availableBrands.length > 0 && (
             <AccordionItem value="brand" className="border-b-0">
                <AccordionTrigger className="font-semibold text-base hover:no-underline py-2">Marques</AccordionTrigger>
                <AccordionContent>
                    <div className="pt-2 space-y-2 max-h-48 overflow-y-auto">
                        {availableBrands.map(brand => (
                            <div key={brand} className="flex items-center space-x-2 p-1.5">
                                <Checkbox 
                                    id={`brand-${brand}`} 
                                    checked={currentBrands.includes(brand)}
                                    onCheckedChange={() => handleBrandChange(brand)}
                                />
                                <Label htmlFor={`brand-${brand}`} className="font-normal text-sm text-muted-foreground">
                                    {brand}
                                </Label>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        )}
    </Accordion>
  );
}
