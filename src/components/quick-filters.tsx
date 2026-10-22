
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
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
      {quickLinks.map((link) => {
        const active = isActive(link.query);
        return (
          <Link
            key={link.label}
            href={createUrl(link.query)}
            scroll={false}
            className={cn(
              'group flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all duration-300',
              active
                ? 'border-primary/30 bg-primary text-primary-foreground shadow-[0_12px_24px_-16px_rgba(11,110,79,0.9)]'
                : 'border-border/60 bg-background/70 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:text-foreground hover:shadow-[0_12px_24px_-18px_rgba(16,42,35,0.55)]'
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                active ? 'bg-white/15 text-accent' : 'bg-primary/8 text-primary group-hover:bg-primary/12'
              )}
            >
              <link.icon className="h-4 w-4" />
            </span>
            <span className="flex-1 truncate">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
