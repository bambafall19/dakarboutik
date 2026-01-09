
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import type { SiteSettings } from '@/lib/types';
import { updateSiteSettings } from '@/lib/actions';

const formSchema = z.object({
  logoUrl: z.string().url('Veuillez entrer une URL valide.').optional().or(z.literal('')),
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
    <Card>
      <CardHeader>
        <CardTitle>Logo du site</CardTitle>
        <CardDescription>
          Mettez à jour le logo qui apparaît dans l'en-tête et le pied de page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
