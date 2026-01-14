

"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Slider } from './ui/slider';
import React, { useState, useEffect } from 'react';
import { Price } from './price';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface ProductFiltersProps {
  availableBrands: string[];
  currentBrands: string[];
  currentPriceRange: [number, number];
  currentCategory: string | null;
  currentSortBy: string;
  currentQuery: string | null;
}

export function ProductFilters({ 
  availableBrands, 
  currentBrands, 
  currentPriceRange, 
  currentCategory,
  currentSortBy,
  currentQuery
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [priceRange, setPriceRange] = useState<[number, number]>(currentPriceRange);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(currentBrands);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>(priceRange);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [priceRange]);
  
  const handleBrandChange = (brand: string) => {
    const newSelectedBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(newSelectedBrands);
  };


  useEffect(() => {
    const current = new URLSearchParams();

    if (currentCategory) current.set('category', currentCategory);
    if (currentSortBy) current.set('sortBy', currentSortBy);
    if (currentQuery) current.set('q', currentQuery);
    
    if (debouncedPriceRange[0] > 0 || debouncedPriceRange[1] < 1000000) {
        current.set('priceRange', `${debouncedPriceRange[0]}-${debouncedPriceRange[1]}`);
    }

    if (selectedBrands.length > 0) {
        current.set('brands', selectedBrands.join(','));
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
  }, [debouncedPriceRange, selectedBrands, pathname, router, currentCategory, currentSortBy, currentQuery]);

  return (
    <div className="flex flex-col gap-4">
        <Accordion type="multiple" defaultValue={['price', 'brand']} className="w-full">
            <AccordionItem value="price">
                <AccordionTrigger className="font-semibold text-base md:text-lg">Prix</AccordionTrigger>
                <AccordionContent>
                    <div className="p-2">
                        <Slider 
                            min={0}
                            max={1000000}
                            step={10000}
                            value={priceRange}
                            onValueChange={(value) => setPriceRange(value as [number, number])}
                        />
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                            <Price price={priceRange[0]} currency="XOF" />
                            <Price price={priceRange[1]} currency="XOF" />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
            {availableBrands.length > 0 && (
                 <AccordionItem value="brand">
                    <AccordionTrigger className="font-semibold text-base md:text-lg">Marques</AccordionTrigger>
                    <AccordionContent>
                        <div className="p-2 space-y-2 max-h-48 overflow-y-auto">
                            {availableBrands.map(brand => (
                                <div key={brand} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`brand-${brand}`} 
                                        checked={selectedBrands.includes(brand)}
                                        onCheckedChange={() => handleBrandChange(brand)}
                                    />
                                    <Label htmlFor={`brand-${brand}`} className="font-normal text-xs md:text-sm">
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
