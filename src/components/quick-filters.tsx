
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

const quickLinks = [
    { label: 'Meilleures ventes', query: { bestseller: 'true' } },
    { label: 'Nouveautés', query: { sortBy: 'newest' } },
    { label: 'Promotions', query: { on_sale: 'true' } },
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
        // Don't check category for active state here
        currentParams.delete('category');

        const queryParams = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => queryParams.set(key, value));
        
        return currentParams.toString() === queryParams.toString();
    }
    
    return (
        <Accordion type="single" collapsible defaultValue="quick-filters" className="w-full">
            <AccordionItem value="quick-filters" className="border-b-0">
                <AccordionTrigger className="font-semibold text-base hover:no-underline py-0">À la une</AccordionTrigger>
                <AccordionContent>
                    <div className="pt-2 space-y-1">
                        {quickLinks.map(link => (
                            <Link
                                key={link.label}
                                href={createUrl(link.query!)}
                                className={cn("block px-2 py-1.5 rounded-md hover:bg-accent text-sm text-muted-foreground", {
                                    'text-primary font-semibold': isActive(link.query!)
                                })}
                                scroll={false}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
