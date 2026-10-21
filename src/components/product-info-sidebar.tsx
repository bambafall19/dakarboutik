
'use client';

import { Truck, RotateCw, Headset } from 'lucide-react';
import { useSiteSettings } from "@/hooks/use-site-data";
import { Skeleton } from "./ui/skeleton";

export function ProductInfoSidebar() {
    const { settings, loading } = useSiteSettings();

    const infoItems = [
        {
            icon: Truck,
            title: "Livraison",
            content: settings?.deliveryInfo
        },
        {
            icon: RotateCw,
            title: "Politique de retour",
            content: settings?.returnPolicy
        },
        {
            icon: Headset,
            title: "Service après-vente",
            content: settings?.afterSalesService
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
        )
    }

    const visibleItems = infoItems.filter((item) => item.content);

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {visibleItems.map((item) => (
                <div
                    key={item.title}
                    className="group flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-5 transition hover:border-primary/25 hover:shadow-[0_20px_40px_-28px_rgba(11,110,79,0.6)]"
                >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 transition group-hover:bg-primary group-hover:text-primary-foreground">
                        <item.icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <h3 className="font-headline text-sm font-bold">{item.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
