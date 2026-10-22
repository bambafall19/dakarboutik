
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import React from "react";
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";
import {
  DELIVERY_ZONES,
  getZonesByRegion,
  getZoneShippingQuote,
  getShippingQuote,
  type DeliveryMethod,
} from "@/lib/shipping";
import { useSiteSettings } from "@/hooks/use-site-data";
import { findImage } from '@/lib/placeholder-images';
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { MapPin, Smartphone, Banknote, Clock, Package, CheckCircle2 } from "lucide-react";
import type { DeliveryZone } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse e-mail valide." }),
  phone: z.string().min(9, { message: "Le numéro de téléphone est requis." }),
  address: z.string().min(5, { message: "L'adresse est requise." }),
  city: z.string().min(2, { message: "La ville est requise." }),
  zoneId: z.string().min(1, { message: "Veuillez choisir une zone de livraison." }),
  paymentMethod: z.enum(["cod", "wave", "orange_money", "free_money", "card"], {
    required_error: "Veuillez choisir une méthode de paiement.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface CheckoutFormProps {
  onDeliveryMethodChange: (method: DeliveryMethod) => void;
}

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Paiement à la livraison",
    description: "Payez en espèces directement au livreur.",
    icon: Banknote,
    color: "text-emerald-600",
  },
  {
    id: "wave",
    label: "Wave",
    description: "Paiement instantané via Wave.",
    icon: Smartphone,
    color: "text-blue-500",
    logo: "/logos/wave.png",
  },
  {
    id: "orange_money",
    label: "Orange Money",
    description: "Paiement via Orange Money.",
    icon: Smartphone,
    color: "text-orange-500",
    logo: "/logos/orange-money.png",
  },
  {
    id: "free_money",
    label: "Free Money",
    description: "Paiement via Free Money.",
    icon: Smartphone,
    color: "text-red-500",
    logo: "/logos/free-money.png",
  },
] as const;

const dakarZones = getZonesByRegion('dakar');
const horsZones = getZonesByRegion('hors-dakar');

export function CheckoutForm({ onDeliveryMethodChange }: CheckoutFormProps) {
  const router = useRouter();
  const { state, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const paymentMethodsImage = findImage('payment-methods');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "Dakar",
      zoneId: "plateau",
      paymentMethod: "cod",
    },
  });

  const zoneId = form.watch('zoneId');
  const paymentMethod = form.watch('paymentMethod');

  const selectedZone = DELIVERY_ZONES.find((z) => z.id === zoneId);
  const shippingQuote = getZoneShippingQuote(settings, zoneId, totalPrice);

  // Keep legacy DeliveryMethod in sync for parent component
  React.useEffect(() => {
    const zone = DELIVERY_ZONES.find((z) => z.id === zoneId);
    onDeliveryMethodChange(zone?.region === 'hors-dakar' ? 'hors-dakar' : 'dakar');
  }, [zoneId, onDeliveryMethodChange]);

  // Sync city from zone selection
  React.useEffect(() => {
    if (selectedZone) {
      // Only auto-fill city if hors-dakar zone
      if (selectedZone.region === 'hors-dakar') {
        const cityName = selectedZone.label.split(' / ')[0];
        form.setValue('city', cityName);
      } else {
        form.setValue('city', 'Dakar');
      }
    }
  }, [selectedZone, form]);

  async function onSubmit(values: FormValues) {
    const shippingCost = getZoneShippingQuote(settings, values.zoneId, totalPrice).shippingCost;
    const grandTotal = totalPrice + shippingCost;
    const randomPart = Math.random().toString(36).substring(2, 7);
    const orderId = `DKB-${Date.now()}-${randomPart}`;
    const createdAt = new Date().toISOString();

    // Map new payment methods to legacy type for DB compatibility
    const paymentMethodForDb =
      values.paymentMethod === 'cod' ? 'cod' : 'mobile_money';

    try {
      const itemsToSave = state.items.map(item => ({
        ...item,
        selectedVariants: item.selectedVariants || [],
      }));

      await api.post('/api/orders', {
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
        deliveryMethod: selectedZone?.region === 'hors-dakar' ? 'hors-dakar' : 'dakar',
        zoneId: values.zoneId,
        paymentMethod: paymentMethodForDb,
        createdAt: createdAt,
        publicNotes: [],
      });

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
      const err = error as { message?: string };
      toast({
        variant: "destructive",
        title: "Erreur de commande",
        description: err.message || "Impossible de passer la commande. Veuillez réessayer.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* ── Contact ─────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="font-headline text-xl font-bold">Informations de contact</h2>
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

        {/* ── Adresse ─────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="font-headline text-xl font-bold">Adresse de livraison</h2>
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

        {/* ── Zone de livraison ───────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="font-headline text-xl font-bold">Zone de livraison</h2>

          <FormField
            control={form.control}
            name="zoneId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="space-y-4"
                  >
                    {/* Dakar intra-muros */}
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        Dakar &amp; Grande Banlieue
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {dakarZones.map((zone) => (
                          <ZoneOption key={zone.id} zone={zone} field={field} totalPrice={totalPrice} settings={settings} />
                        ))}
                      </div>
                    </div>

                    {/* Hors Dakar */}
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        Hors Dakar — Autres Régions
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {horsZones.map((zone) => (
                          <ZoneOption key={zone.id} zone={zone} field={field} totalPrice={totalPrice} settings={settings} />
                        ))}
                      </div>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dynamic quote summary */}
          {selectedZone && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Délai estimé :</span>
                  <span>{selectedZone.eta}</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Package className="h-4 w-4" />
                  {shippingQuote.isFreeShipping
                    ? "Livraison offerte 🎉"
                    : `${shippingQuote.shippingCost.toLocaleString('fr-FR')} FCFA`}
                </div>
              </div>
              {shippingQuote.remainingForFreeShipping > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Ajoutez encore{' '}
                  <span className="font-semibold text-primary">
                    {shippingQuote.remainingForFreeShipping.toLocaleString('fr-FR')} FCFA
                  </span>{' '}
                  pour bénéficier de la livraison gratuite.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Méthode de paiement ────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="font-headline text-xl font-bold">Méthode de paiement</h2>
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <FormItem key={pm.id}>
                        <FormControl>
                          <RadioGroupItem value={pm.id} className="sr-only" id={`pm-${pm.id}`} />
                        </FormControl>
                        <Label htmlFor={`pm-${pm.id}`} className="cursor-pointer">
                          <Card
                            className={cn(
                              "rounded-xl transition-all duration-200",
                              field.value === pm.id
                                ? "border-primary ring-2 ring-primary shadow-md"
                                : "hover:border-primary/40"
                            )}
                          >
                            <div className="flex items-start gap-3 p-4">
                              <pm.icon className={cn("h-5 w-5 mt-0.5 shrink-0", pm.color)} />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-headline font-bold text-sm">{pm.label}</h3>
                                <p className="mt-0.5 text-xs text-muted-foreground">{pm.description}</p>
                              </div>
                              {field.value === pm.id && (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                              )}
                            </div>
                          </Card>
                        </Label>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mobile money note */}
          {paymentMethod !== 'cod' && (
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-sm text-muted-foreground">
              <p>
                ✅ Après validation, nous vous enverrons le numéro de paiement{' '}
                <span className="font-semibold text-foreground">{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</span>{' '}
                par SMS/WhatsApp pour finaliser la transaction.
              </p>
            </div>
          )}
        </div>

        {/* ── Submit ──────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="font-headline text-xl font-bold">Finalisation</h2>
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? 'Traitement...'
              : paymentMethod === 'cod'
              ? 'Confirmer la commande'
              : `Passer la commande et Payer via ${PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}`}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ── Zone Option sub-component ─────────────────────────────────────────────────

function ZoneOption({
  zone,
  field,
  totalPrice,
  settings,
}: {
  zone: DeliveryZone;
  field: { value: string; onChange: (v: string) => void };
  totalPrice: number;
  settings: any;
}) {
  const isSelected = field.value === zone.id;
  const quote = getZoneShippingQuote(settings, zone.id, totalPrice);

  return (
    <label
      htmlFor={`zone-${zone.id}`}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all duration-150",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border/70 hover:border-primary/40 hover:bg-muted/30"
      )}
    >
      <RadioGroupItem value={zone.id} id={`zone-${zone.id}`} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{zone.label}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {zone.eta}
          </span>
          <span className={cn("font-semibold", quote.isFreeShipping ? "text-emerald-600" : "text-foreground")}>
            {quote.isFreeShipping ? "Gratuit 🎉" : `${quote.shippingCost.toLocaleString('fr-FR')} FCFA`}
          </span>
        </div>
      </div>
    </label>
  );
}
