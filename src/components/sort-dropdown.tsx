
'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SortDropdownProps {
  sortBy: string;
  basePath: string;
  currentQuery: string;
}

export function SortDropdown({ sortBy, basePath, currentQuery }: SortDropdownProps) {
  const router = useRouter();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(currentQuery);
    params.set('sortBy', value);
    
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className='flex items-center gap-2'>
      <Select value={sortBy} onValueChange={handleSortChange}>
        <SelectTrigger className='w-auto md:w-[200px] text-sm'>
          <SelectValue placeholder="Trier par..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Nouveautés</SelectItem>
          <SelectItem value="price_asc">Prix: Croissant</SelectItem>
          <SelectItem value="price_desc">Prix: Décroissant</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
