
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Category, SimpleCategory } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Price } from './price';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';

interface ProductFiltersProps {
  allCategories: Category[];
  brands: string[];
}

export function ProductFilters({ allCategories, brands }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get filters from URL
  const selectedCategories = searchParams.get('category')?.split(',') || [];
  const selectedBrands = searchParams.get('brands')?.split(',') || [];
  const priceRangeParam = searchParams.get('priceRange');
  const sortBy = searchParams.get('sortBy') || 'newest';

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
    router.push(`${pathname}${query}`, { scroll: false });
  };

  const handleCategoryChange = (slug: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, slug]
      : selectedCategories.filter(c => c !== slug);
    updateSearchParams('category', newCategories.length > 0 ? newCategories.join(',') : null);
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

  const handleSortChange = (value: string) => {
    updateSearchParams('sortBy', value);
  };

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
  };
  
  const renderCategoryFilters = (categories: Category[], level = 0) => {
    return categories.map(cat => {
      const hasSubCategories = cat.subCategories && cat.subCategories.length > 0;
  
      const categoryCheckbox = (
        <div className="flex items-center space-x-2 py-1">
          <Checkbox
            id={`cat-${cat.slug}`}
            checked={selectedCategories.includes(cat.slug)}
            onCheckedChange={(checked) => handleCategoryChange(cat.slug, !!checked)}
          />
          <Label htmlFor={`cat-${cat.slug}`} className="font-normal text-sm flex-1 cursor-pointer">{cat.name}</Label>
        </div>
      );
  
      if (hasSubCategories) {
        return (
          <Accordion key={cat.id} type="single" collapsible className="w-full">
            <AccordionItem value={cat.slug} className="border-b-0">
              <div className="flex items-center">
                <div className="flex items-center space-x-2 py-1 flex-1">
                  <Checkbox
                    id={`cat-${cat.slug}`}
                    checked={selectedCategories.includes(cat.slug)}
                    onCheckedChange={(checked) => handleCategoryChange(cat.slug, !!checked)}
                  />
                  <Label htmlFor={`cat-${cat.slug}`} className="font-normal text-sm flex-1 cursor-pointer">{cat.name}</Label>
                </div>
                <AccordionTrigger className="py-0 px-2 text-sm hover:no-underline font-normal [&[data-state=open]>svg]:text-primary" />
              </div>
              <AccordionContent className="pb-0 pl-6 border-l ml-3">
                {renderCategoryFilters(cat.subCategories, level + 1)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      }
  
      return (
        <div key={cat.id} style={{ paddingLeft: `${level * 0}rem` }}>
          {categoryCheckbox}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className='flex-row items-center justify-between'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='font-semibold'>Filtres</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary hover:text-primary">Effacer</Button>
          </div>
          <p className='text-sm text-muted-foreground'>Trier par</p>
          <Select value={sortBy} onValueChange={handleSortChange}>
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
          <AccordionContent className="space-y-1 pt-2">
             {renderCategoryFilters(allCategories)}
          </AccordionContent>
        </AccordionItem>
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
