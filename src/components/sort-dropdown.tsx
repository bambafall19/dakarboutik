
'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowUpDown } from 'lucide-react';

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
      <span className="hidden items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground sm:inline-flex">
        <ArrowUpDown className="h-3.5 w-3.5" />
        Trier
      </span>
      <Select value={sortBy} onValueChange={handleSortChange}>
        <SelectTrigger className='h-11 w-full rounded-full border-border/70 bg-background text-sm font-semibold shadow-sm transition hover:border-primary/40 md:w-[210px]'>
          <SelectValue placeholder="Trier par..." />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="newest">Nouveautés</SelectItem>
          <SelectItem value="price_asc">Prix : Croissant</SelectItem>
          <SelectItem value="price_desc">Prix : Décroissant</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
