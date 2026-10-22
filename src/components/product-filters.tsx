
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Checkbox } from './ui/checkbox';
import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';

interface ProductFiltersProps {
  availableBrands: string[];
  currentBrands: string[];
  currentPriceRange: [number, number];
  currentQuery: string;
  brandCounts?: { [brand: string]: number };
}

const formatCfa = (value: number) => new Intl.NumberFormat('fr-SN').format(value);

export const PRICE_RANGES = [
    { label: "Tous les prix", min: 0, max: 10000000 },
    { label: `0 - ${formatCfa(600000)} CFA`, min: 0, max: 600000 },
    { label: `${formatCfa(600000)} - ${formatCfa(1200000)} CFA`, min: 600000, max: 1200000 },
    { label: `${formatCfa(1200000)} - ${formatCfa(3000000)} CFA`, min: 1200000, max: 3000000 },
    { label: `Plus de ${formatCfa(3000000)} CFA`, min: 3000000, max: 10000000 },
];

export function ProductFilters({ 
  availableBrands,
  currentBrands,
  currentPriceRange,
  currentQuery,
  brandCounts = {},
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handlePriceChange = (min: number, max: number) => {
    const params = new URLSearchParams(currentQuery);
    if (min > 0 || max < 10000000) {
      params.set('priceRange', `${min}-${max}`);
    } else {
      params.delete('priceRange');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  const handleBrandChange = (brand: string) => {
    const params = new URLSearchParams(currentQuery);
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand];

    if (newBrands.length > 0) {
      params.set('brands', newBrands.join(','));
    } else {
      params.delete('brands');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  const isDefaultPrice = currentPriceRange[0] === 0 && (currentPriceRange[1] === 10000000);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-headline text-xs font-bold uppercase tracking-[0.16em] text-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Wallet className="h-3.5 w-3.5" />
          </span>
          Budget
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {PRICE_RANGES.map(range => {
            const isActive = (range.label === "Tous les prix" && isDefaultPrice) || (currentPriceRange[0] === range.min && currentPriceRange[1] === range.max);
            return (
              <button
                key={range.label}
                onClick={() => handlePriceChange(range.min, range.max)}
                className={cn(
                  'group flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all duration-300',
                  isActive
                    ? 'border-primary/30 bg-primary text-primary-foreground shadow-[0_10px_22px_-16px_rgba(11,110,79,0.9)]'
                    : 'border-border/60 bg-background/70 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:text-foreground'
                )}
              >
                <span>{range.label}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
              </button>
            )
          })}
        </div>
      </div>

      {availableBrands.length > 0 && (
        <div>
          <h3 className="mb-3 font-headline text-xs font-bold uppercase tracking-[0.16em] text-foreground">
            Marques
            <span className="ml-1.5 text-[11px] font-medium normal-case tracking-normal text-muted-foreground">
              ({availableBrands.length})
            </span>
          </h3>
          <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
            {availableBrands.map(brand => {
              const checked = currentBrands.includes(brand);
              const count = brandCounts[brand];
              return (
                <label
                  key={brand}
                  htmlFor={`brand-${brand}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 text-sm transition-all duration-200',
                    checked
                      ? 'border-primary/20 bg-primary/8 font-semibold text-foreground'
                      : 'text-muted-foreground hover:border-border/60 hover:bg-background/70 hover:text-foreground'
                  )}
                >
                  <Checkbox 
                    id={`brand-${brand}`} 
                    checked={checked}
                    onCheckedChange={() => handleBrandChange(brand)}
                  />
                  <span className="flex-1 truncate">{brand}</span>
                  {typeof count === 'number' && (
                    <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
