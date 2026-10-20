
"use client";

import Image from 'next/image';
import { useCart } from "@/hooks/use-cart";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Price } from './price';

export const SHIPPING_COSTS = {
  dakar: 2000,
  "hors-dakar": 5000,
};

interface OrderSummaryProps {
    deliveryMethod: 'dakar' | 'hors-dakar';
}

export function OrderSummary({ deliveryMethod }: OrderSummaryProps) {
  const { state, totalPrice } = useCart();
  
  const shippingCost = SHIPPING_COSTS[deliveryMethod] || 0;
  const grandTotal = totalPrice + shippingCost;

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle>Récapitulatif de la commande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {state.items.map(item => (
                <div key={item.id} className="flex items-start gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                        <Image src={item.product.images[0].imageUrl} alt={item.product.title} data-ai-hint={item.product.images[0].imageHint} fill className="object-contain p-1" />
                        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {item.quantity}
                        </span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{item.product.title}</p>
                        <Price price={item.product.price} salePrice={item.product.salePrice} currency={item.product.currency} className="text-sm" />
                    </div>
                </div>
            ))}
        </div>
        <Separator />
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span>Sous-total</span>
                <Price price={totalPrice} currency="FCA" className="font-medium" />
            </div>
            <div className="flex justify-between">
                <span>Livraison</span>
                <Price price={shippingCost} currency="FCA" className="font-medium" />
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-between font-bold text-lg">
            <span>Total</span>
            <Price price={grandTotal} currency="FCA" className="text-primary" />
        </div>
      </CardFooter>
    </Card>
  );
}
