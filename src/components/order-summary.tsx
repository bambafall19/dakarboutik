
"use client";

import Image from 'next/image';
import { useCart } from "@/hooks/use-cart";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Price } from './price';
import { useSiteSettings } from '@/hooks/use-site-data';
import { getShippingQuote, type DeliveryMethod } from '@/lib/shipping';

interface OrderSummaryProps {
    deliveryMethod: DeliveryMethod;
}

export function OrderSummary({ deliveryMethod }: OrderSummaryProps) {
  const { state, totalPrice } = useCart();
  const { settings } = useSiteSettings();

  const quote = getShippingQuote(settings, deliveryMethod, totalPrice);
  const shippingCost = quote.shippingCost;
  const grandTotal = totalPrice + shippingCost;

  return (
    <Card className="rounded-2xl border-border/70 bg-secondary/40">
      <CardHeader>
        <CardTitle className="font-headline text-lg font-bold">Récapitulatif de la commande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {state.items.map(item => (
                <div key={item.id} className="flex items-start gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                        <Image src={item.product.images[0].imageUrl} alt={item.product.title} data-ai-hint={item.product.images[0].imageHint} fill sizes="64px" className="object-contain p-1" />
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
            {quote.isFreeShipping ? (
                <p className="text-xs font-medium text-primary">
                    Livraison offerte pour votre commande.
                </p>
            ) : quote.remainingForFreeShipping > 0 ? (
                <p className="text-xs text-muted-foreground">
                    Plus que {quote.remainingForFreeShipping.toLocaleString('fr-FR')} FCFA pour la
                    livraison offerte.
                </p>
            ) : null}
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
