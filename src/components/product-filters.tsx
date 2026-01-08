"use client";

import type { Category } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Price } from './price';

type Filters = {
  category: string;
  brand: string;
  priceRange: [number, number];
  sortBy: string;
};

interface ProductFiltersProps {
  categories: Category[];
  brands: string[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export function ProductFilters({ categories, brands, filters, onFilterChange }: ProductFiltersProps) {
  
  const handleCategoryChange = (value: string) => {
    onFilterChange({ ...filters, category: value });
  };
  
  const handleBrandChange = (value: string) => {
    onFilterChange({ ...filters, brand: value });
  };
  
  const handlePriceChange = (value: number[]) => {
    onFilterChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ ...filters, sortBy: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trier par</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Trier par..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Nouveautés</SelectItem>
              <SelectItem value="price_asc">Prix: Croissant</SelectItem>
              <SelectItem value="price_desc">Prix: Décroissant</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
            <AccordionItem value="category">
              <AccordionTrigger>Catégorie</AccordionTrigger>
              <AccordionContent>
                <RadioGroup value={filters.category} onValueChange={handleCategoryChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="cat-all" />
                    <Label htmlFor="cat-all">Toutes</Label>
                  </div>
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={cat.slug} id={`cat-${cat.id}`} />
                      <Label htmlFor={`cat-${cat.id}`}>{cat.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="brand">
              <AccordionTrigger>Marque</AccordionTrigger>
              <AccordionContent>
                <RadioGroup value={filters.brand} onValueChange={handleBrandChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="brand-all" />
                    <Label htmlFor="brand-all">Toutes</Label>
                  </div>
                  {brands.map(brand => (
                    <div key={brand} className="flex items-center space-x-2">
                      <RadioGroupItem value={brand} id={`brand-${brand}`} />
                      <Label htmlFor={`brand-${brand}`}>{brand}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="price">
              <AccordionTrigger>Prix</AccordionTrigger>
              <AccordionContent>
                <div className="px-1">
                  <Slider
                    min={0}
                    max={1000000}
                    step={10000}
                    value={filters.priceRange}
                    onValueChange={handlePriceChange}
                  />
                  <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                    <Price price={filters.priceRange[0]} currency="XOF" className="font-normal"/>
                    <Price price={filters.priceRange[1]} currency="XOF" className="font-normal"/>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

    