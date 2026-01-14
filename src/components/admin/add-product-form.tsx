
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
import type { Category, Product } from '@/lib/types';
import { Card, CardContent } from '../ui/card';
import { useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';

// Slugify function
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}


const formSchema = z.object({
  title: z.string().min(2, 'Le titre doit contenir au moins 2 caractères.'),
  description: z.string().min(10, 'La description est requise.'),
  price: z.coerce.number().min(0, 'Le prix doit être positif.'),
  stock: z.coerce.number().min(0, 'Le stock doit être positif.'),
  category: z.string().min(1, 'La catégorie est requise.'),
  subCategory: z.string().optional(),
  imageUrl1: z.string().url("Veuillez entrer une URL d'image valide."),
  imageUrl2: z.string().url("Veuillez entrer une URL d'image valide.").optional().or(z.literal('')),
  isNew: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
});

interface AddProductFormProps {
  categories: Category[];
}

export function AddProductForm({ categories }: AddProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      subCategory: '',
      imageUrl1: '',
      imageUrl2: '',
      isNew: true,
      isBestseller: false,
    },
  });

  const selectedCategoryId = form.watch('category');
  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );

  useEffect(() => {
    // Reset subcategory when category changes
    form.setValue('subCategory', '');
  }, [selectedCategoryId, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: "Erreur de connexion",
        description: "Impossible de se connecter à la base de données.",
      });
      return;
    }
    
    try {
      // Find the slug from the ID
      const finalCategoryId = values.subCategory || values.category;
      const categoryToSave = categories.flatMap(c => [c, ...(c.subCategories || [])]).find(c => c.id === finalCategoryId)?.slug;
      
      if (!categoryToSave) {
          toast({ variant: 'destructive', title: 'Erreur', description: 'Catégorie invalide sélectionnée.' });
          return;
      }
      
      const slug = slugify(values.title);

      const images = [];
      if (values.imageUrl1) {
        images.push({
          id: `product-${slug}-1`,
          description: values.title,
          imageUrl: values.imageUrl1,
          imageHint: 'product',
        });
      }
      if (values.imageUrl2) {
        images.push({
          id: `product-${slug}-2`,
          description: values.title,
          imageUrl: values.imageUrl2,
          imageHint: 'product detail',
        });
      }

      const newProduct: Omit<Product, 'id'> = {
        title: values.title,
        description: values.description,
        price: values.price,
        stock: values.stock,
        category: categoryToSave,
        isNew: values.isNew,
        isBestseller: values.isBestseller,
        brand: '', // Ensure brand is always present
        slug,
        status: 'active',
        createdAt: new Date().toISOString(),
        images: images,
        specs: {},
        variants: [],
        currency: 'XOF',
      };

      const productsCollection = collection(firestore, 'products');
      await addDoc(productsCollection, newProduct);

      toast({
        title: 'Produit ajouté !',
        description: `Le produit "${values.title}" a été ajouté avec succès.`,
      });
      
      router.push('/admin');
      router.refresh();

    } catch (error) {
      console.error("Error adding product: ", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: 'destructive',
        title: "Échec de l'ajout du produit",
        description: errorMessage,
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
                name="imageUrl1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse (lien) de l'image principale</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://exemple.com/image-principale.png"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="imageUrl2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse (lien) de la deuxième image (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://exemple.com/image-secondaire.png"
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
                              <SelectItem key={subCat.id} value={subCat.id}>
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

    