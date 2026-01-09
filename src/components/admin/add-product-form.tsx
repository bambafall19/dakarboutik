
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { SimpleCategory } from '@/lib/types';
import { addProduct } from '@/lib/actions';
import { Card, CardContent } from '../ui/card';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  title: z.string().min(2, 'Le titre doit contenir au moins 2 caractères.'),
  description: z.string().min(10, 'La description est requise.'),
  price: z.coerce.number().min(0, 'Le prix doit être positif.'),
  stock: z.coerce.number().min(0, 'Le stock doit être positif.'),
  category: z.string().min(1, 'La catégorie est requise.'),
  subCategory: z.string().optional(),
  imageUrl: z.string().url("Veuillez entrer une URL d'image valide."),
  isNew: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
});

interface AddProductFormProps {
  categories: SimpleCategory[];
}

export function AddProductForm({ categories }: AddProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      subCategory: '',
      imageUrl: '',
      isNew: true,
      isBestseller: false,
    },
  });

  const selectedCategorySlug = form.watch('category');
  const selectedCategory = categories.find(
    (cat) => cat.slug === selectedCategorySlug
  );

  useEffect(() => {
    // Reset subcategory when category changes
    form.setValue('subCategory', '');
  }, [selectedCategorySlug, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Use subCategory if it exists, otherwise fall back to main category slug
      const categoryToSave = values.subCategory || values.category;
      
      await addProduct({ ...values, category: categoryToSave });

      toast({
        title: 'Produit ajouté !',
        description: `Le produit "${values.title}" a été ajouté avec succès.`,
      });
      router.push('/admin');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "TOUTJOURSD",
        description:
          'Une erreur est survenue. Veuillez réessayer.' +
          (error instanceof Error ? error.message : ''),
      });
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du produit</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: iPhone 15 Pro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description détaillée du produit..."
                        {...field}
                      />
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
                    <FormLabel>Adresse (lien) de l'image du produit</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://exemple.com/image.png"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (XOF)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantité en stock</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.slug}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCategory && selectedCategory.subCategories && selectedCategory.subCategories.length > 0 && (
                  <FormField
                    control={form.control}
                    name="subCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sous-catégorie</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir une sous-catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedCategory.subCategories.map((subCat) => (
                              <SelectItem key={subCat.id} value={subCat.slug}>
                                {subCat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isNew"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Nouveau produit</FormLabel>
                      <FormDescription>
                        Cochez cette case pour afficher un badge "NOUVEAU".
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isBestseller"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Meilleure vente</FormLabel>
                      <FormDescription>
                        Cochez pour inclure dans la section "Meilleures
                        Ventes".
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? 'Ajout en cours...'
                : 'Ajouter le produit'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
