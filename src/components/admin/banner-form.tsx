
'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { Banner } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import slugify from 'slugify';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Switch } from '../ui/switch';
import { Trash } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

const formSchema = z.object({
  title: z.string().min(2, 'Le titre est requis.'),
  subtitle: z.string().optional(),
  linkUrl: z.string().min(1, "Le lien est requis (ex: /products)"),
  position: z.enum(['hero', 'announcement', 'ad', 'promo']),
  isActive: z.boolean().default(true),
  order: z.coerce.number().default(99),
});

export const positionLabels: Record<Banner['position'], string> = {
    hero: 'Héros (Page d\'accueil)',
    announcement: 'Annonce (Carrousel sous le héros)',
    ad: 'Publicité (Grille sous le héros)',
    promo: 'Promotion (Grille sur la page d\'accueil)'
};

interface BannerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: Banner | null;
}

export function BannerForm({ open, onOpenChange, banner }: BannerFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [imageFields, setImageFields] = useState<{ url: string; description: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      linkUrl: '/products',
      position: 'ad',
      isActive: true,
      order: 99,
    },
  });
  
  React.useEffect(() => {
    if (open) {
        form.reset({
            title: banner?.title || '',
            subtitle: banner?.subtitle || '',
            linkUrl: banner?.linkUrl || '/products',
            position: banner?.position || 'ad',
            isActive: banner?.isActive ?? true,
            order: banner?.order ?? 99,
        });
        setImageFields(banner?.images?.map(img => ({ url: img.imageUrl, description: img.description })) || [{ url: '', description: '' }]);
    }
  }, [banner, form, open]);
  
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
    if (!firestore) return;
    
    if (imageFields.some(img => !img.url)) {
        toast({
            variant: 'destructive',
            title: "Images manquantes",
            description: "Veuillez fournir une URL pour chaque image.",
        });
        return;
    }

    try {
        const slug = slugify(values.title, { lower: true, strict: true });

        const images = imageFields.map((img, index) => ({
            id: banner?.images?.[index]?.id || `banner-${slug}-${index + 1}`,
            description: img.description || values.title,
            imageUrl: img.url,
            imageHint: 'banner',
        }));

        const data: Omit<Banner, 'id'> = {
            ...values,
            images,
        }

        if (banner) {
            // Update
            const bannerRef = doc(firestore, 'banners', banner.id);
            await setDoc(bannerRef, data, { merge: true });
            toast({ title: 'Bannière mise à jour !' });
        } else {
            // Create
            const id = slug + '-' + Date.now();
            const bannerRef = doc(firestore, 'banners', id);
            await setDoc(bannerRef, { ...data, id });
            toast({ title: 'Bannière ajoutée !' });
        }
      onOpenChange(false);
    } catch (error) {
        console.error(error)
        toast({
            variant: 'destructive',
            title: 'Erreur',
            description: "Une erreur s'est produite."
        })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{banner ? 'Modifier la bannière' : 'Ajouter une bannière'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="max-h-[70vh] p-1">
              <div className="space-y-6 pr-4">
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
                  <FormDescription>Gérez les images de cette bannière. Si plusieurs images sont ajoutées, elles défileront dans un carrousel.</FormDescription>
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
                 <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position d'affichage</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir une position" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {Object.entries(positionLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                {label}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordre d'affichage</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Un petit nombre (ex: 1) apparaît en premier.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">
                            Bannière Active
                            </FormLabel>
                            <FormDescription>
                            Désactivez pour cacher la bannière du site public.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                    />
              </div>
            </ScrollArea>
            <DialogFooter className='pt-4'>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
