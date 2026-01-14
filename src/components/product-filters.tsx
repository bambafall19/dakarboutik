
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Slider } from './ui/slider';
import React, { useState, useEffect } from 'react';
import { Price } from './price';

interface ProductFiltersProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function ProductFilters({ searchParams }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const initialPriceRange = typeof searchParams.priceRange === 'string' 
    ? searchParams.priceRange.split('-').map(Number) 
    : [0, 1000000];

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
    const current = new URLSearchParams(
      Array.from(Object.entries(searchParams))
        .flatMap(([key, value]) => 
          Array.isArray(value) ? value.map(v => [key, v]) : [[key, value as string]]
        )
    );
    
    if (debouncedPriceRange[0] > 0 || debouncedPriceRange[1] < 1000000) {
        current.set('priceRange', `${debouncedPriceRange[0]}-${debouncedPriceRange[1]}`);
    } else {
        current.delete('priceRange');
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
  }, [debouncedPriceRange, pathname, router, searchParams]);

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
