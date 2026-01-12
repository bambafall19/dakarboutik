
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
import { updateSiteSettings } from '@/lib/actions';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  logoUrl: z.string().url('Veuillez entrer une URL valide.').optional().or(z.literal('')),
  announcementMessage: z.string().optional(),
  whatsappNumber: z.string().min(9, 'Veuillez entrer un numéro valide.').optional().or(z.literal('')),
});

interface SettingsFormProps {
  settings: SiteSettings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logoUrl: settings.logoUrl || '',
      announcementMessage: settings.announcementMessage || '',
      whatsappNumber: settings.whatsappNumber || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateSiteSettings(values);
      toast({
        title: 'Réglages mis à jour !',
        description: 'Vos modifications ont été enregistrées avec succès.',
      });
      // The path is revalidated, no need to router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description:
          'Une erreur est survenue lors de la mise à jour des réglages.' +
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
              name="announcementMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message de la barre d'annonce</FormLabel>
                  <FormControl>
                    <Input placeholder="Livraison gratuite pour les commandes de plus de..." {...field} />
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
                    <Input placeholder="221771234567" {...field} />
                  </FormControl>
                   <FormDescription>
                    Entrez le numéro (avec l'indicatif pays) pour les commandes WhatsApp.
                  </FormDescription>
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
