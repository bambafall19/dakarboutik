
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { Flame, Sparkles, Tag, type LucideIcon } from 'lucide-react';

const quickLinks: { label: string; icon: LucideIcon; query: Record<string, string> }[] = [
  { label: 'Meilleures ventes', icon: Flame, query: { bestseller: 'true' } },
  { label: 'Nouveautés', icon: Sparkles, query: { sortBy: 'newest' } },
  { label: 'Promotions', icon: Tag, query: { on_sale: 'true' } },
];

export function QuickFilters() {
  const searchParams = useSearchParams();

  const createUrl = (query: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => params.set(key, value));
    return `/products?${params.toString()}`;
  };

  const isActive = (query: Record<string, string>): boolean => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete('category');

    const queryParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => queryParams.set(key, value));

    return currentParams.toString() === queryParams.toString();
  };

  return (
    <div>
      <h3 className="mb-3 font-headline text-sm font-bold uppercase tracking-wider text-foreground">
        À la une
      </h3>
      <div className="space-y-0.5">
        {quickLinks.map((link) => {
          const active = isActive(link.query);
          return (
            <Link
              key={link.label}
              href={createUrl(link.query)}
              scroll={false}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <span className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                active ? 'bg-white/15' : 'bg-secondary text-primary'
              )}>
                <link.icon className="h-4 w-4" />
              </span>
              <span className="flex-1">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
