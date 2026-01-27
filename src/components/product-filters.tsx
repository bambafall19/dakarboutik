'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Slider } from './ui/slider';
import React, { useState, useEffect, useCallback } from 'react';
import { Price } from './price';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface ProductFiltersProps {
  availableBrands: string[];
  currentBrands: string[];
  currentPriceRange: [number, number];
  basePath: string;
  currentQuery: string;
}

export function ProductFilters({ 
  availableBrands,
  currentBrands,
  currentPriceRange,
  basePath,
  currentQuery,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [priceRange, setPriceRange] = useState<[number, number]>(currentPriceRange);

  const handlePriceCommit = (value: [number, number]) => {
      const params = new URLSearchParams(currentQuery);
      if (value[0] > 0 || value[1] < 1000000) {
        params.set('priceRange', `${value[0]}-${value[1]}`);
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
  
  useEffect(() => {
    setPriceRange(currentPriceRange);
  }, [currentPriceRange]);

  return (
    <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground px-1.5 mb-2">Filtres</h3>
        <Accordion type="multiple" defaultValue={['price', 'brand']} className="w-full">
            <AccordionItem value="price">
                <AccordionTrigger className="font-semibold text-sm uppercase hover:no-underline">Prix</AccordionTrigger>
                <AccordionContent>
                    <div className="p-2">
                        <Slider 
                            min={0}
                            max={1000000}
                            step={10000}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            onValueCommit={handlePriceCommit}
                        />
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                            <Price price={priceRange[0]} currency="FCA" />
                            <Price price={priceRange[1]} currency="FCA" />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
            {availableBrands.length > 0 && (
                 <AccordionItem value="brand">
                    <AccordionTrigger className="font-semibold text-sm uppercase hover:no-underline">Marques</AccordionTrigger>
                    <AccordionContent>
                        <div className="p-2 space-y-2 max-h-48 overflow-y-auto">
                            {availableBrands.map(brand => (
                                <div key={brand} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`brand-${brand}`} 
                                        checked={currentBrands.includes(brand)}
                                        onCheckedChange={() => handleBrandChange(brand)}
                                    />
                                    <Label htmlFor={`brand-${brand}`} className="font-normal text-sm">
                                        {brand}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            )}
        </Accordion>
    </div>
  );
}
