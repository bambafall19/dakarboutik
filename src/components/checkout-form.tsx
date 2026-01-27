
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import React from "react";
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import { SHIPPING_COSTS } from "@/components/order-summary";
import { useSiteSettings } from "@/hooks/use-site-data";
import { findImage } from '@/lib/placeholder-images';
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse e-mail valide." }),
  phone: z.string().min(9, { message: "Le numéro de téléphone est requis." }),
  address: z.string().min(5, { message: "L'adresse est requise." }),
  city: z.string().min(2, { message: "La ville est requise." }),
  deliveryMethod: z.enum(["dakar", "hors-dakar"], {
    required_error: "Veuillez choisir un mode de livraison.",
  }),
  paymentMethod: z.enum(["cod", "mobile_money"], {
    required_error: "Veuillez choisir une méthode de paiement.",
  }),
});

interface CheckoutFormProps {
    onDeliveryMethodChange: (method: 'dakar' | 'hors-dakar') => void;
}

export function CheckoutForm({ onDeliveryMethodChange }: CheckoutFormProps) {
  const router = useRouter();
  const { state, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { settings } = useSiteSettings();
  const paymentMethodsImage = findImage('payment-methods');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "Dakar",
      deliveryMethod: "dakar",
      paymentMethod: "cod",
    },
  });

  const deliveryMethod = form.watch('deliveryMethod');
  const paymentMethod = form.watch('paymentMethod');

  React.useEffect(() => {
    onDeliveryMethodChange(deliveryMethod);
  }, [deliveryMethod, onDeliveryMethodChange]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Connexion à la base de données impossible.",
      });
      return;
    }

    const shippingCost = SHIPPING_COSTS[values.deliveryMethod] || 0;
    const grandTotal = totalPrice + shippingCost;
    const randomPart = Math.random().toString(36).substring(2, 7);
    const orderId = `DKB-${Date.now()}-${randomPart}`;
    const createdAt = new Date().toISOString();

    try {
      const itemsToSave = state.items.map(item => ({
        ...item,
        selectedVariants: item.selectedVariants || [],
      }));
      
      const batch = writeBatch(firestore);

      // Create main order document
      const orderRef = doc(firestore, 'orders', orderId);
      batch.set(orderRef, {
        id: orderId,
        orderId,
        customerInfo: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          city: values.city,
        },
        items: itemsToSave,
        totalPrice: totalPrice,
        shippingCost: shippingCost,
        grandTotal: grandTotal,
        status: 'pending',
        deliveryMethod: values.deliveryMethod,
        paymentMethod: values.paymentMethod,
        createdAt: createdAt,
        publicNotes: [],
      });

      // Create public order document for tracking
      const publicOrderRef = doc(firestore, 'publicOrders', orderId);
      batch.set(publicOrderRef, {
        id: orderId,
        orderId: orderId,
        status: 'pending',
        createdAt: createdAt,
        statusHistory: [{ status: 'pending', date: createdAt }],
        publicNotes: [],
      });
      
      await batch.commit();
      
      toast({
        title: "Commande passée !",
        description: "Vous serez redirigé vers la page de confirmation.",
      });
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('lastOrderId', orderId);
      }

      clearCart();
      router.push(`/order-confirmation?orderId=${orderId}&paymentMethod=${values.paymentMethod}`);

    } catch (error) {
      console.error("Error creating order:", error);
      const firebaseError = error as { code?: string; message?: string };
      toast({
        variant: "destructive",
        title: "Erreur de commande",
        description: firebaseError.message || "Impossible de passer la commande. Veuillez réessayer.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Informations de contact</h2>
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                        <Input placeholder="Prénom Nom" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="vous@exemple.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                            <Input placeholder="77 123 45 67" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>

        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Adresse de livraison</h2>
            <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                        <Input placeholder="Cité Keur Gorgui, Villa 21B" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                        <Input placeholder="Dakar" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Mode de livraison</h2>
            <FormField
              control={form.control}
              name="deliveryMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-md has-[[data-state=checked]]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="dakar" />
                        </FormControl>
                        <FormLabel className="font-normal flex-1 m-0">
                            Dakar intra-muros
                            <p className="text-xs text-muted-foreground">Livraison sous 24h</p>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-md has-[[data-state=checked]]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="hors-dakar" />
                        </FormControl>
                        <FormLabel className="font-normal flex-1 m-0">
                            Hors Dakar
                            <p className="text-xs text-muted-foreground">Livraison sous 2 à 3 jours</p>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Méthode de paiement</h2>
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 gap-4"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="cod" className="sr-only" id="cod" />
                        </FormControl>
                        <Label htmlFor="cod">
                          <Card className={cn("cursor-pointer", field.value === 'cod' && "border-primary ring-1 ring-primary")}>
                            <div className="p-4">
                              <h3 className="font-semibold">Paiement à la livraison</h3>
                              <p className="text-sm text-muted-foreground mt-1">Payez en espèces directement au livreur.</p>
                            </div>
                          </Card>
                        </Label>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="mobile_money" className="sr-only" id="mobile_money" />
                        </FormControl>
                        <Label htmlFor="mobile_money">
                          <Card className={cn("cursor-pointer", field.value === 'mobile_money' && "border-primary ring-1 ring-primary")}>
                            <div className="p-4">
                              <h3 className="font-semibold">Mobile Money</h3>
                              <p className="text-sm text-muted-foreground mt-1">Nous vous contacterons pour le paiement via Wave, Orange Money, etc.</p>
                              <div className="relative h-8 w-48 mt-2">
                                <Image src={paymentMethodsImage.imageUrl} alt="Moyens de paiement" layout="fill" objectFit="contain" />
                              </div>
                            </div>
                          </Card>
                        </Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Finalisation</h2>
            <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting 
                ? 'Traitement...' 
                : paymentMethod === 'cod' 
                  ? 'Confirmer la commande' 
                  : 'Passer la commande et Payer'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
