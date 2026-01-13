
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Icons } from './icons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import React, { useState, useEffect } from 'react';
import { Price } from './price';

interface ProductFiltersProps {
  brands: string[];
}

export function ProductFilters({ brands }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialBrands = searchParams.get('brands')?.split(',') || [];
  const initialPriceRange = searchParams.get('priceRange')?.split('-').map(Number) || [0, 1000000];

  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands);
  const [priceRange, setPriceRange] = useState<[number, number]>(initialPriceRange as [number, number]);


  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (selectedBrands.length > 0) {
      current.set('brands', selectedBrands.join(','));
    } else {
      current.delete('brands');
    }
    
    if (priceRange[0] > 0 || priceRange[1] < 1000000) {
        current.set('priceRange', `${priceRange[0]}-${priceRange[1]}`);
    } else {
        current.delete('priceRange');
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';
    // Debounce or use a button to apply filters to avoid too many redirects
    // For now, applying on change
    router.push(`${pathname}${query}`, { scroll: false });
  }, [selectedBrands, priceRange, pathname, router, searchParams]);

  const handleBrandChange = (brand: string, checked: boolean | 'indeterminate') => {
    setSelectedBrands(prev => 
      checked ? [...prev, brand] : prev.filter(b => b !== brand)
    );
  };
  
  const handleSortChange = (value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('sortBy', value);
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
  };
  
  const sortBy = searchParams.get('sortBy') || 'newest';

  return (
    <div className="flex flex-col gap-4">
        <Accordion type="multiple" defaultValue={['brands', 'price']} className="w-full">
            <AccordionItem value="brands">
                <AccordionTrigger className="font-semibold">Marques</AccordionTrigger>
                <AccordionContent>
                    <div className="flex flex-col gap-2">
                        {brands.map(brand => (
                            <div key={brand} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`brand-${brand}`} 
                                    checked={selectedBrands.includes(brand)}
                                    onCheckedChange={(checked) => handleBrandChange(brand, checked)}
                                />
                                <label htmlFor={`brand-${brand}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {brand}
                                </label>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="price">
                <AccordionTrigger className="font-semibold">Prix</AccordionTrigger>
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
        </Accordion>
        <div className='flex items-center gap-2'>
            <span className="text-sm text-muted-foreground hidden md:inline">Trier par:</span>
             <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full h-9 text-sm bg-card rounded-md focus:ring-0">
                    <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">Nouveautés</SelectItem>
                    <SelectItem value="price_asc">Prix: Croissant</SelectItem>
                    <SelectItem value="price_desc">Prix: Décroissant</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
  );
}
