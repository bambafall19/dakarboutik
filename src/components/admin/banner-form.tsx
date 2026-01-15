
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
import Image from 'next/image';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Trash } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  title: z.string().min(2, 'Le titre est requis.'),
  subtitle: z.string().optional(),
  linkUrl: z.string().min(1, "Le lien est requis (ex: /products)"),
});

interface BannerFormProps {
  banner?: Banner;
  title?: string;
  description?: string;
}

export function BannerForm({ banner, title, description }: BannerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const [imageFields, setImageFields] = useState<{ url: string; description: string }[]>(
    banner?.images.map(img => ({ url: img.imageUrl, description: img.description })) || [{ url: '', description: '' }]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: banner?.title || '',
      subtitle: banner?.subtitle || '',
      linkUrl: banner?.linkUrl || '/products',
    },
  });

  const addImageField = () => {
    setImageFields([...imageFields, { url: '', description: '' }]);
  };

  const handleImageChange = (index: number, field: 'url' | 'description', value: string) => {
    const newImages = [...imageFields];
    newImages[index][field] = value;
    setImageFields(newImages);
  };
  
  const removeImageField = (index: number) => {
    const newImages = imageFields.filter((_, i) => i !== index);
    setImageFields(newImages);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!banner || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de se connecter à la base de données.',
      });
      return;
    }

    if (imageFields.some(img => !img.url)) {
        toast({
            variant: 'destructive',
            title: "Images manquantes",
            description: "Veuillez fournir une URL pour chaque image.",
        });
        return;
    }
    
    try {
      const images = imageFields.map((img, index) => ({
        id: banner.images[index]?.id || `banner-${banner.id}-img-${index + 1}`,
        description: img.description || values.title,
        imageUrl: img.url,
        imageHint: banner.images[index]?.imageHint || 'banner',
      }));

      const bannerToUpdate: Banner = {
        id: banner.id,
        title: values.title,
        subtitle: values.subtitle,
        linkUrl: values.linkUrl,
        images: images,
      };

      const bannerRef = doc(firestore, 'banners', banner.id);
      await setDoc(bannerRef, bannerToUpdate, { merge: true });

      toast({
        title: 'Bannière mise à jour !',
        description: 'La bannière a été modifiée avec succès.',
      });
       router.refresh();
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
            <CardTitle>{title || `Bannière: ${banner?.id}`}</CardTitle>
            {description && (
                <CardDescription>
                    {description}
                </CardDescription>
            )}
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
            
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormDescription>Gérez les images de cette bannière.</FormDescription>
               <div className="space-y-4 pt-2">
                  {imageFields.map((image, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-md">
                      <div className='flex-1 space-y-2'>
                          <Input
                          placeholder="URL de l'image (ex: https://...)"
                          value={image.url}
                          onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                          />
                          <Input
                          placeholder="Description de l'image (optionnel)"
                          value={image.description}
                          onChange={(e) => handleImageChange(index, 'description', e.target.value)}
                          />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeImageField(index)} disabled={imageFields.length === 1}>
                        <Trash className="text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addImageField}>
                    Ajouter une autre image
                  </Button>
                </div>
            </FormItem>

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
             <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
