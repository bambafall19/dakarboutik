
'use client';

import { useRouter } from 'next/navigation';
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
  basePath: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export function ProductFilters({ 
  availableBrands,
  currentBrands,
  currentPriceRange,
  basePath,
  searchParams,
}: ProductFiltersProps) {
  const router = useRouter();

  const [priceRange, setPriceRange] = useState<[number, number]>(currentPriceRange);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(currentBrands);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>(priceRange);

  // Update internal state if props change
  useEffect(() => {
    setPriceRange(currentPriceRange);
    setSelectedBrands(currentBrands);
  }, [currentPriceRange, currentBrands]);

  // Debounce price range slider to avoid too many re-renders
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 500);

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

  // Effect to push changes to URL
  useEffect(() => {
    const current = new URLSearchParams();
    for (const key in searchParams) {
        if (!['brands', 'priceRange'].includes(key) && searchParams[key]) {
            current.set(key, searchParams[key] as string);
        }
    }

    if (debouncedPriceRange[0] > 0 || debouncedPriceRange[1] < 1000000) {
      current.set('priceRange', `${debouncedPriceRange[0]}-${debouncedPriceRange[1]}`);
    }

    if (selectedBrands.length > 0) {
      current.set('brands', selectedBrands.join(','));
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';

    // Only push router if the query params have actually changed
    // This deep comparison is necessary because searchParams object identity changes
    const oldQuery = new URLSearchParams();
    for (const key in searchParams) {
        if(searchParams[key]) {
            oldQuery.set(key, searchParams[key] as string);
        }
    }

    if (current.toString() !== oldQuery.toString()) {
      router.push(`${basePath}${query}`, { scroll: false });
    }
  }, [debouncedPriceRange, selectedBrands, basePath, router, searchParams]);

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
