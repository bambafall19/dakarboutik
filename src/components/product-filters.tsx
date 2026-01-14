
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
}

export function ProductFilters({ }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialPriceRange = searchParams.get('priceRange')?.split('-').map(Number) || [0, 1000000];

  const [priceRange, setPriceRange] = useState<[number, number]>(initialPriceRange as [number, number]);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>(priceRange);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [priceRange]);

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (debouncedPriceRange[0] > 0 || debouncedPriceRange[1] < 1000000) {
        current.set('priceRange', `${debouncedPriceRange[0]}-${debouncedPriceRange[1]}`);
    } else {
        current.delete('priceRange');
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
  }, [debouncedPriceRange, pathname, router, searchParams]);

  
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
        <Accordion type="multiple" defaultValue={['price']} className="w-full">
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
    </div>
  );
}
