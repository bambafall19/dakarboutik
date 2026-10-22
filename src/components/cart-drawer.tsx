
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Icons } from './icons';
import { Price } from './price';
import { OrderChannels } from './order-channels';
import { useMemo } from 'react';

export function CartDrawer() {
  const { state, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  const channelItems = useMemo(
    () =>
      state.items.map((item) => ({
        title: item.product.title,
        quantity: item.quantity,
        unitPrice: item.product.salePrice ?? item.product.price,
        options: item.selectedVariants?.map((variant) => variant.value).join(', ') || undefined,
      })),
    [state.items]
  );

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-headline">Mon Panier ({totalItems})</SheetTitle>
        <SheetDescription className="sr-only">
          Contenu de votre panier et options de commande.
        </SheetDescription>
      </SheetHeader>
      {state.items.length > 0 ? (
        <>
          <ScrollArea className="flex-1 pr-4 -mr-4 my-4">
            <div className="flex flex-col gap-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.product.images[0].imageUrl}
                      alt={item.product.title}
                      data-ai-hint={item.product.images[0].imageHint}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.product.title}</h4>
                    <Price price={item.product.price} salePrice={item.product.salePrice} currency={item.product.currency} className="text-sm" />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Icons.minus className="h-3 w-3" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Icons.plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <SheetFooter className="mt-auto">
            <div className="w-full space-y-4">
              <Separator />
              <div className="flex justify-between font-headline text-lg font-bold">
                <span>Sous-total</span>
                <Price price={totalPrice} currency="FCA" className="text-lg text-nav-foreground" />
              </div>
              <Button asChild size="lg" className="w-full rounded-full">
                <Link href="/checkout">Passer la commande</Link>
              </Button>
              <OrderChannels
                items={channelItems}
                size="sm"
                whatsappLabel="Commander via WhatsApp"
                phoneLabel="Commander par téléphone"
                buttonClassName="h-10 text-sm"
              />
            </div>
          </SheetFooter>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 ring-1 ring-primary/10">
              <Icons.shoppingBag className="h-10 w-10 text-primary/60" />
            </span>
            <h3 className="font-headline text-lg font-bold">Votre panier est vide</h3>
            <p className="max-w-[16rem] text-sm text-muted-foreground">Parcourez nos produits pour trouver votre bonheur.</p>
            <Button asChild className="rounded-full bg-primary hover:bg-primary/90">
                <Link href="/products">Commencer mes achats</Link>
            </Button>
        </div>
      )}
    </>
  );
}
