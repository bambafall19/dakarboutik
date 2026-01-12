
"use client";

import { CheckoutForm } from "@/components/checkout-form";
import { OrderSummary } from "@/components/order-summary";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function CheckoutPage() {
  const { totalItems } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (totalItems === 0) {
      router.replace('/products');
    }
  }, [totalItems, router]);
  
  if (totalItems === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Votre panier est vide</h1>
        <p className="text-muted-foreground">Vous serez redirigé vers la boutique.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
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
          <CheckoutForm />
        </div>
        <div className="mt-0 lg:mt-16">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
