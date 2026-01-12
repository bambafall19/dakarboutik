
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Icons } from './icons';
import { Price } from './price';

export function CartDrawer() {
  const { state, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <>
      <SheetHeader>
        <SheetTitle>Mon Panier ({totalItems})</SheetTitle>
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
                      className="object-cover"
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
              <div className="flex justify-between font-bold text-lg">
                <span>Sous-total</span>
                <Price price={totalPrice} currency="XOF" className="text-lg" />
              </div>
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout">Passer la commande</Link>
              </Button>
            </div>
          </SheetFooter>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <Icons.shoppingBag className="w-20 h-20 text-muted-foreground/30" />
            <h3 className="font-semibold text-lg">Votre panier est vide</h3>
            <p className="text-muted-foreground text-sm">Parcourez nos produits pour trouver votre bonheur.</p>
            <Button asChild>
                <Link href="/products">Commencer mes achats</Link>
            </Button>
        </div>
      )}
    </>
  );
}
