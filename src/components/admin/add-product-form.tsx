
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
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { generateProductSeoData } from '@/ai/flows/generate-product-seo-data';

const formSchema = z.object({
  title: z.string().min(2, 'Le titre doit contenir au moins 2 caractères.'),
  description: z.string().min(10, 'La description est requise.'),
  price: z.coerce.number().min(0, 'Le prix doit être positif.'),
  stock: z.coerce.number().min(0, 'Le stock doit être positif.'),
  category: z.string().min(1, 'La catégorie est requise.'),
  brand: z.string().min(1, 'La marque est requise.'),
  isNew: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

interface AddProductFormProps {
  categories: SimpleCategory[];
  brands: string[];
}

export function AddProductForm({ categories, brands }: AddProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      brand: '',
      isNew: true,
      isBestseller: false,
      metaTitle: '',
      metaDescription: '',
    },
  });

  async function handleGenerateSeo() {
    const { title, description, brand, category } = form.getValues();
    if (!title || !description || !brand || !category) {
      toast({
        variant: 'destructive',
        title: 'Champs manquants',
        description: 'Veuillez remplir le titre, la description, la marque et la catégorie.',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateProductSeoData({
        title,
        description,
        brand,
        category,
        relatedProducts: [],
      });
      form.setValue('metaTitle', result.metaTitle);
      form.setValue('metaDescription', result.metaDescription);
      toast({
        title: 'Contenu SEO généré !',
        description: 'Le titre et la description SEO ont été remplis.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de génération',
        description:
          'Impossible de générer le contenu SEO. ' +
          (error instanceof Error ? error.message : ''),
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await addProduct(values);
      toast({
        title: 'Produit ajouté !',
        description: `Le produit "${values.title}" a été ajouté avec succès.`,
      });
      router.push('/admin');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description:
          'Une erreur est survenue lors de l`ajout du produit.' +
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
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marque</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une marque" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 p-6 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Assistant SEO IA</h3>
                    <p className="text-sm text-muted-foreground">Générez automatiquement un titre et une description optimisés pour le référencement.</p>
                 </div>
                 <Button type="button" onClick={handleGenerateSeo} disabled={isGenerating}>
                   <Sparkles className="mr-2 h-4 w-4" />
                   {isGenerating ? 'Génération...' : 'Générer avec l\'IA'}
                 </Button>
              </div>
              <div className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Titre (SEO)</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre optimisé pour les moteurs de recherche..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description (SEO)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Description optimisée pour les moteurs de recherche..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
