
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function SortDropdown() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const sortBy = searchParams.get('sortBy') || 'newest';

    const handleSortChange = (value: string) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('sortBy', value);
        const search = current.toString();
        const query = search ? `?${search}` : '';
        router.push(`${pathname}${query}`, { scroll: false });
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
