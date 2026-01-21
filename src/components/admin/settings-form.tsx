

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import type { SiteSettings } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  logoUrl: z.string().url('Veuillez entrer une URL valide.').optional().or(z.literal('')),
  announcementMessage1: z.string().optional(),
  announcementMessage2: z.string().optional(),
  announcementMessage3: z.string().optional(),
  whatsappNumber: z.string().min(9, 'Veuillez entrer un numéro valide.').optional().or(z.literal('')),
  supportPhone: z.string().optional(),
  supportEmail: z.string().email("Veuillez entrer un email valide.").optional().or(z.literal('')),
  deliveryInfo: z.string().optional(),
  returnPolicy: z.string().optional(),
  afterSalesService: z.string().optional(),
});

interface SettingsFormProps {
  settings: SiteSettings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logoUrl: settings.logoUrl || '',
      announcementMessage1: settings.announcementMessage1 || '',
      announcementMessage2: settings.announcementMessage2 || '',
      announcementMessage3: settings.announcementMessage3 || '',
      whatsappNumber: settings.whatsappNumber || '',
      supportPhone: settings.supportPhone || '',
      supportEmail: settings.supportEmail || '',
      deliveryInfo: settings.deliveryInfo || "Livraison gratuite partout à Dakar, sauf les accessoires. Les frais de livraison varient selon le lieu. Détails à la commande.",
      returnPolicy: settings.returnPolicy || "Retours gratuits sous 7 jours si le produit présente un défaut matériel.",
      afterSalesService: settings.afterSalesService || "Vous pouvez nous appeler au +221 77 485 52 56 pour toute assistance.",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'La base de données est inaccessible. Veuillez réessayer.',
      });
      return;
    }

    try {
      const settingsRef = doc(firestore, 'settings', 'siteConfig');
      await setDoc(settingsRef, values, { merge: true });

      toast({
        title: 'Réglages mis à jour !',
        description: 'Vos modifications ont été enregistrées avec succès.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de permission',
        description:
          'Une erreur est survenue. Vérifiez vos permissions et réessayez.' +
          (error instanceof Error ? error.message : ''),
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
            <CardDescription>
              Gérez les informations et l'apparence de votre boutique.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL du logo</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="announcementMessage1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message d'annonce 1</FormLabel>
                  <FormControl>
                    <Input placeholder="Livraison gratuite pour les commandes de plus de..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="announcementMessage2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message d'annonce 2</FormLabel>
                  <FormControl>
                    <Input placeholder="Message promotionnel..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="announcementMessage3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message d'annonce 3</FormLabel>
                  <FormControl>
                    <Input placeholder="Nouveautés, offres spéciales..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de téléphone WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="221776384676" {...field} />
                  </FormControl>
                   <FormDescription>
                    Entrez le numéro (avec l'indicatif pays) pour les commandes WhatsApp.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supportPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone du support</FormLabel>
                  <FormControl>
                    <Input placeholder="338123456 / 771234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supportEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email du support</FormLabel>
                  <FormControl>
                    <Input placeholder="contact@maboutique.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
           <CardHeader>
            <CardTitle>Informations Produits</CardTitle>
            <CardDescription>
              Gérez les informations affichées sur les pages produits (livraison, retours, etc.).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <FormField
              control={form.control}
              name="deliveryInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Information de Livraison</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Informations sur la livraison..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="returnPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Politique de Retour</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Politique de retour..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="afterSalesService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Après-Vente</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Informations sur le SAV..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </form>
    </Form>
  );
}
