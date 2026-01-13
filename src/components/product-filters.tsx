
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Price } from './price';
import { Checkbox } from './ui/checkbox';

interface ProductFiltersProps {
  brands: string[];
}

export function ProductFilters({ brands }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get filters from URL
  const selectedBrands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
  const priceRangeParam = searchParams.get('priceRange');

  const priceRange: [number, number] = priceRangeParam
    ? priceRangeParam.split('-').map(Number) as [number, number]
    : [0, 1000000];

  const updateSearchParams = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value === null || value === '') {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';
    // We don't push the router here, the parent component will handle it.
    // This makes the filter component more reusable.
    // The parent can decide to apply filters on change or on button click.
    window.history.replaceState({}, '', `${pathname}${query}`);
  };
  
  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...selectedBrands, brand]
      : selectedBrands.filter(b => b !== brand);
    updateSearchParams('brands', newBrands.length > 0 ? newBrands.join(',') : null);
  };
  
  const handlePriceChange = (value: number[]) => {
    updateSearchParams('priceRange', `${value[0]}-${value[1]}`);
  };

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={['brand', 'price']} className="w-full">
        <AccordionItem value="brand">
          <AccordionTrigger>Marque</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {brands.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(checked) => handleBrandChange(brand, !!checked)}
                />
                <Label htmlFor={`brand-${brand}`} className="font-normal">{brand}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger>Prix</AccordionTrigger>
          <AccordionContent>
            <div className="px-1 pt-2">
              <Slider
                min={0}
                max={1000000}
                step={10000}
                defaultValue={priceRange}
                onValueCommit={handlePriceChange}
              />
              <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                <Price price={priceRange[0]} currency="XOF" className="font-normal"/>
                <Price price={priceRange[1]} currency="XOF" className="font-normal"/>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
