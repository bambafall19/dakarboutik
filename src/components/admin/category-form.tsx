
'use client';

import React from 'react';
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
import type { Category } from '@/lib/types';
import { api } from '@/lib/api-client';
import slugify from 'slugify';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  order: z.coerce.number().default(99),
  parentId: z.string().optional(),
  bannerImageUrl: z.string().url("Veuillez entrer une URL valide.").optional().or(z.literal('')),
});

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  allCategories: Category[];
  onSaved?: () => void;
}

export function CategoryForm({ open, onOpenChange, category, allCategories, onSaved }: CategoryFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      order: 99,
      parentId: undefined,
      bannerImageUrl: '',
    },
  });
  
  React.useEffect(() => {
    if (open) {
        form.reset({
            name: category?.name || '',
            order: category?.order ?? 99,
            parentId: category?.parentId || undefined,
            bannerImageUrl: category?.bannerImageUrl || '',
        })
    }
  }, [category, form, open])


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const slug = slugify(values.name, { lower: true, strict: true });
        const data = {
            name: values.name,
            slug: slug,
            parentId: values.parentId || null,
            order: values.order,
            bannerImageUrl: values.bannerImageUrl || null,
        }

        if (category) {
            // Update
            await api.put('/api/categories', { id: category.id, ...data });
            toast({ title: 'Catégorie mise à jour !' });
        } else {
            // Create
            await api.post('/api/categories', data);
            toast({ title: 'Catégorie ajoutée !' });
        }
      onOpenChange(false);
      onSaved?.();
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la catégorie</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Smartphones" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordre d&apos;affichage</FormLabel>
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
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie parente (optionnel)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Aucune" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allCategories.filter(c => c.id !== category?.id).map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
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
              name="bannerImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de l&apos;image de la bannière (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/banner.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Cette image s&apos;affichera en haut de la page de cette catégorie.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
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
