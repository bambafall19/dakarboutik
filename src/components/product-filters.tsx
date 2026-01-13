
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Icons } from './icons';

interface ProductFiltersProps {
  brands: string[];
  showCategoryFilter?: boolean;
}

const filters = [
    { id: 'type', name: 'Type', options: ['Sans fil', 'Avec fil'] },
    { id: 'price', name: 'Prix', options: ['Moins de 50 000', '50 000 - 100 000'] },
    { id: 'review', name: 'Avis', options: ['5 étoiles', '4 étoiles et plus'] },
    { id: 'color', name: 'Couleur', options: ['Noir', 'Blanc', 'Rouge'] },
    { id: 'material', name: 'Matériau', options: ['Plastique', 'Métal'] },
    { id: 'offer', name: 'Offre', options: ['En solde', 'Livraison gratuite'] },
]

export function ProductFilters({ brands, showCategoryFilter = true }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('sortBy', value);
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`, { scroll: false });
  };
  
  const sortBy = searchParams.get('sortBy') || 'relevance';


  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-4">
        <div className="flex-1 flex flex-wrap items-center gap-2">
            {filters.map(filter => (
                <Select key={filter.id}>
                    <SelectTrigger className="w-auto h-9 text-sm bg-card rounded-full focus:ring-0">
                        <SelectValue placeholder={filter.name} />
                    </SelectTrigger>
                    <SelectContent>
                        {filter.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
            ))}
            <Button variant="outline" size="sm" className="h-9 rounded-full">
                Tous les filtres <Icons.filter className="ml-2 h-4 w-4" />
            </Button>
        </div>
        <div className='flex items-center gap-2'>
            <span className="text-sm text-muted-foreground hidden md:inline">Trier par:</span>
             <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-auto h-9 text-sm bg-card rounded-full focus:ring-0">
                    <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="relevance">Pertinence</SelectItem>
                    <SelectItem value="newest">Nouveautés</SelectItem>
                    <SelectItem value="price_asc">Prix: Croissant</SelectItem>
                    <SelectItem value="price_desc">Prix: Décroissant</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
  );
}
