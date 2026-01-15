

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
            <Card className="bg-muted/50">
                <CardContent className="p-6 space-y-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-muted/50">
            <CardContent className="p-6 space-y-6">
                {infoItems.map((item, index) => item.content && (
                    <div key={index} className="flex items-start gap-4">
                        <item.icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-base">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.content}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
