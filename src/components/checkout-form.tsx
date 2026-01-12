"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { addDoc, collection } from "firebase/firestore";
import { SHIPPING_COSTS } from "./order-summary";

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse e-mail valide." }),
  phone: z.string().min(9, { message: "Le numéro de téléphone est requis." }),
  address: z.string().min(5, { message: "L'adresse est requise." }),
  city: z.string().min(2, { message: "La ville est requise." }),
  deliveryMethod: z.enum(["dakar", "hors-dakar"], {
    required_error: "Veuillez choisir un mode de livraison.",
  }),
});

export function CheckoutForm() {
  const router = useRouter();
  const { state, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "Dakar",
      deliveryMethod: "dakar",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Connexion à la base de données impossible.",
      });
      return;
    }

    const shippingCost = SHIPPING_COSTS[values.deliveryMethod];
    const grandTotal = totalPrice + shippingCost;
    const orderId = `DKB-${Date.now()}`;

    try {
      const ordersCollection = collection(firestore, 'orders');
      await addDoc(ordersCollection, {
        orderId,
        customerInfo: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          city: values.city,
        },
        items: state.items,
        totalPrice: totalPrice,
        shippingCost: shippingCost,
        grandTotal: grandTotal,
        status: 'pending',
        deliveryMethod: values.deliveryMethod,
        createdAt: new Date().toISOString(),
      });
      
      toast({
        title: "Commande passée !",
        description: "Vous serez redirigé vers la page de confirmation.",
      });

      clearCart();
      router.push(`/order-confirmation?orderId=${orderId}`);

    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de passer la commande. Veuillez réessayer.",
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

        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Traitement...' : 'Procéder au paiement'}
        </Button>
      </form>
    </Form>
  );
}
