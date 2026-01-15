
'use client';

import { Card, CardContent } from "./ui/card";
import { Truck, RotateCw, Headset } from 'lucide-react';

const infoItems = [
    {
        icon: Truck,
        title: "Livraison",
        content: "Livraison gratuite partout à Dakar, sauf les accessoires. Les frais de livraison varient selon le lieu. Détails à la commande."
    },
    {
        icon: RotateCw,
        title: "Politique de retour",
        content: "Retours gratuits sous 7 jours si le produit présente un défaut matériel."
    },
    {
        icon: Headset,
        title: "Service après-vente",
        content: "Vous pouvez nous appeler au +221 77 485 52 56 pour toute assistance."
    }
];

export function ProductInfoSidebar() {
    return (
        <Card className="bg-muted/50">
            <CardContent className="p-6 space-y-6">
                {infoItems.map((item, index) => (
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
