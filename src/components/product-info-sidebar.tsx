

'use client';

import { Card, CardContent } from "./ui/card";
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
            <Card className="rounded-2xl border-border/70 bg-secondary/40">
                <CardContent className="space-y-6 p-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="rounded-2xl border-border/70 bg-secondary/40">
            <CardContent className="space-y-6 p-6">
                {infoItems.map((item, index) => item.content && (
                    <div key={index} className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-headline text-sm font-bold">{item.title}</h3>
                            <p className="mt-0.5 text-sm text-muted-foreground">{item.content}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
