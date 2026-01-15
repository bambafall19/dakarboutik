
'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SortDropdownProps {
  sortBy: string;
  basePath: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export function SortDropdown({ sortBy, basePath, searchParams }: SortDropdownProps) {
  const router = useRouter();

  const handleSortChange = (value: string) => {
    const current = new URLSearchParams();
    // Copy all existing search params except for the sortBy param
    for (const key in searchParams) {
        if (key !== 'sortBy' && searchParams[key]) {
            current.set(key, searchParams[key] as string);
        }
    }
    // Set the new sort value
    current.set('sortBy', value);
    
    router.push(`${basePath}?${current.toString()}`, { scroll: false });
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
