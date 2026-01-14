
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Slider } from './ui/slider';
import React, { useState, useEffect } from 'react';
import { Price } from './price';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface ProductFiltersProps {
  searchParams: { [key: string]: string | null };
  availableBrands: string[];
}

export function ProductFilters({ searchParams, availableBrands }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const initialPriceRange = searchParams.priceRange 
    ? searchParams.priceRange.split('-').map(Number) 
    : [0, 1000000];
  
  const initialBrands = searchParams.brands ? searchParams.brands.split(',') : [];

  const [priceRange, setPriceRange] = useState<[number, number]>(initialPriceRange as [number, number]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands);
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
    for (const [key, value] of Object.entries(searchParams)) {
        if (value && key !== 'brands' && key !== 'priceRange') {
            current.set(key, value);
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
    router.push(`${pathname}${query}`, { scroll: false });
  }, [debouncedPriceRange, selectedBrands, pathname, router, searchParams]);

  return (
    <div className="flex flex-col gap-4">
        <Accordion type="multiple" defaultValue={['price']} className="w-full">
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
                        <div className="p-2 space-y-2">
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
