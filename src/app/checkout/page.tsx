
"use client";

import { CheckoutForm } from "@/components/checkout-form";
import { OrderSummary } from "@/components/order-summary";
import { OrderChannels } from "@/components/order-channels";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent } from "@/components/ui/card";

export default function CheckoutPage() {
  const { totalItems, state, isHydrated } = useCart();
  const router = useRouter();
  const [deliveryMethod, setDeliveryMethod] = useState<'dakar' | 'hors-dakar'>('dakar');

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

  useEffect(() => {
    // On attend l'hydratation du panier avant de conclure qu'il est vide.
    if (isHydrated && totalItems === 0) {
      router.replace('/products');
    }
  }, [isHydrated, totalItems, router]);

  if (!isHydrated) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        Chargement de votre panier...
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Votre panier est vide</h1>
        <p className="text-muted-foreground">Vous serez redirigé vers la boutique.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <Card>
        <CardContent className="pt-6">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Commande</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h1 className="text-3xl font-bold mb-6">Finaliser ma commande</h1>
              <div className="mb-6 rounded-2xl border border-border/70 bg-secondary/40 p-4">
                <h2 className="font-headline text-base font-bold">
                  Préférez commander par WhatsApp ou par téléphone ?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Votre panier est résumé dans le message, notre équipe confirme la livraison avec
                  vous.
                </p>
                <OrderChannels
                  items={channelItems}
                  deliveryMethod={deliveryMethod}
                  size="default"
                  whatsappLabel="Commander sur WhatsApp"
                  phoneLabel="Appeler pour commander"
                  className="mt-4"
                />
              </div>
              <CheckoutForm onDeliveryMethodChange={setDeliveryMethod} />
            </div>
            <div className="mt-0 lg:mt-16">
              <OrderSummary deliveryMethod={deliveryMethod} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

