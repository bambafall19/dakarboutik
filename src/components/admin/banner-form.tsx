
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
import type { Banner } from '@/lib/types';
import { updateBanner } from '@/lib/actions';
import Image from 'next/image';

const formSchema = z.object({
  title: z.string().min(2, 'Le titre est requis.'),
  subtitle: z.string().optional(),
  imageUrl: z.string().url('Veuillez entrer une URL valide.'),
  linkUrl: z.string().min(1, "Le lien est requis (ex: /products)"),
});

interface BannerFormProps {
  banner?: Banner;
}

export function BannerForm({ banner }: BannerFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: banner?.title || '',
      subtitle: banner?.subtitle || '',
      imageUrl: banner?.image.imageUrl || '',
      linkUrl: banner?.linkUrl || '/products',
    },
  });

  const imageUrl = form.watch('imageUrl');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!banner) return;
    try {
      await updateBanner({
        id: banner.id,
        title: values.title,
        subtitle: values.subtitle,
        linkUrl: values.linkUrl,
        image: {
            // Keep existing id and hint, just update the URL
            id: banner.image.id,
            description: banner.image.description,
            imageHint: banner.image.imageHint,
            imageUrl: values.imageUrl,
        }
      });
      toast({
        title: 'Bannière mise à jour !',
        description: 'La bannière principale a été modifiée avec succès.',
      });
       router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description:
          'Une erreur est survenue lors de la mise à jour de la bannière.' +
          (error instanceof Error ? error.message : ''),
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Bannière Principale</CardTitle>
            <CardDescription>
              Modifiez le contenu de la bannière affichée en haut de la page d'accueil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de la bannière" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sous-titre (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Sous-titre ou slogan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de l'image</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {imageUrl && (
                <div className="relative aspect-video w-full rounded-md border bg-muted overflow-hidden">
                    <Image src={imageUrl} alt="Aperçu de la bannière" fill className="object-cover" />
                </div>
            )}
            <FormField
              control={form.control}
              name="linkUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien de la bannière</FormLabel>
                  <FormControl>
                    <Input placeholder="/products?category=new" {...field} />
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
