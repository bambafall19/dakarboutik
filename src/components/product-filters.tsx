
"use client";

import type { Category } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Price } from './price';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';

type Filters = {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  sortBy: string;
};

interface ProductFiltersProps {
  categories: Category[];
  brands: string[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const CategoryFilterItem = ({
  category,
  filters,
  handleCategoryChange,
}: {
  category: Category;
  filters: Filters;
  handleCategoryChange: (slug: string, checked: boolean) => void;
}) => {
  if (category.subCategories && category.subCategories.length > 0) {
    return (
      <Accordion type="single" collapsible className="w-full pl-4">
        <AccordionItem value={category.slug} className="border-b-0">
          <div className="flex items-center space-x-2">
             <Checkbox
              id={`cat-${category.id}`}
              checked={filters.categories.includes(category.slug)}
              onCheckedChange={(checked) => handleCategoryChange(category.slug, !!checked)}
            />
            <AccordionTrigger className="py-1 flex-1">
              <Label htmlFor={`cat-${category.id}`} className="font-normal hover:cursor-pointer">{category.name}</Label>
            </AccordionTrigger>
          </div>
          <AccordionContent className="pt-2">
            {category.subCategories.map((subCat) => (
              <CategoryFilterItem
                key={subCat.id}
                category={subCat as Category}
                filters={filters}
                handleCategoryChange={handleCategoryChange}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <div className="flex items-center space-x-2 pl-4">
      <Checkbox
        id={`cat-${category.id}`}
        checked={filters.categories.includes(category.slug)}
        onCheckedChange={(checked) => handleCategoryChange(category.slug, !!checked)}
      />
      <Label htmlFor={`cat-${category.id}`} className="font-normal">{category.name}</Label>
    </div>
  );
};


export function ProductFilters({ categories, brands, filters, onFilterChange }: ProductFiltersProps) {
  
  const handleCategoryChange = (slug: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, slug]
      : filters.categories.filter(c => c !== slug);
    onFilterChange({ ...filters, categories: newCategories });
  };
  
  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...filters.brands, brand]
      : filters.brands.filter(b => b !== brand);
    onFilterChange({ ...filters, brands: newBrands });
  };
  
  const handlePriceChange = (value: number[]) => {
    onFilterChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ ...filters, sortBy: value });
  };

  const clearFilters = () => {
    onFilterChange({
      categories: [],
      brands: [],
      priceRange: [0, 1000000],
      sortBy: 'newest'
    });
  }

  return (
    <div className="space-y-6">
      <div className='flex-row items-center justify-between'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='font-semibold'>Filtres</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary hover:text-primary">Effacer</Button>
          </div>
          <p className='text-sm text-muted-foreground'>Trier par</p>
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
      </div>

      <Accordion type="multiple" defaultValue={['category', 'price', 'brand']} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger>Catégorie</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {categories.map(cat => (
               <CategoryFilterItem key={cat.id} category={cat} filters={filters} handleCategoryChange={handleCategoryChange} />
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="brand">
          <AccordionTrigger>Marque</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {brands.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
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
    </div>
  );
}
