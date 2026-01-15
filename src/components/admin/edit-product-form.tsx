
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
import type { Category, Product, ProductFormData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Trash } from 'lucide-react';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const formSchema = z.object({
  title: z.string().min(2, 'Le titre doit contenir au moins 2 caractères.'),
  description: z.string().min(10, 'La description est requise.'),
  price: z.coerce.number().min(0, 'Le prix doit être positif.'),
  stock: z.coerce.number().min(0, 'Le stock doit être positif.'),
  category: z.string().min(1, 'La catégorie est requise.'),
  subCategory: z.string().optional(),
  isNew: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  specs: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
});

interface EditProductFormProps {
  categories: Category[];
  product: Product;
}

export function EditProductForm({ categories, product }: EditProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [specFields, setSpecFields] = useState<{ key: string; value: string }[]>(
    product.specs ? Object.entries(product.specs).map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }]
  );

  const [imageFields, setImageFields] = useState<{ url: string; description: string }[]>(
    product.images.map(img => ({ url: img.imageUrl, description: img.description }))
  );

  const allCategoriesFlat = categories.flatMap(c => [c, ...(c.subCategories || [])]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product.title || '',
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock || 0,
      category: '', // Will be set in useEffect
      subCategory: '', // Will be set in useEffect
      isNew: product.isNew || false,
      isBestseller: product.isBestseller || false,
    },
  });

  const selectedCategoryId = form.watch('category');
  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );
  
  useEffect(() => {
    const productCategory = allCategoriesFlat.find(c => c.slug === product.category);
    if (!productCategory) return;
    
    if (productCategory.parentId) {
      form.setValue('category', productCategory.parentId);
      form.setValue('subCategory', productCategory.id);
    } else {
      form.setValue('category', productCategory.id);
      form.setValue('subCategory', '');
    }

  }, [product.category, allCategoriesFlat, categories, form]);

  const addSpecField = () => {
    setSpecFields([...specFields, { key: '', value: '' }]);
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specFields];
    newSpecs[index][field] = value;
    setSpecFields(newSpecs);
  };

  const removeSpecField = (index: number) => {
    const newSpecs = specFields.filter((_, i) => i !== index);
    setSpecFields(newSpecs);
  };

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
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: "Erreur de connexion",
        description: "Impossible de se connecter à la base de données.",
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
      const finalCategoryId = values.subCategory || values.category;
      const categoryToSave = allCategoriesFlat.find(c => c.id === finalCategoryId)?.slug;

      if (!categoryToSave) {
          toast({ variant: 'destructive', title: 'Erreur', description: 'Catégorie invalide sélectionnée.' });
          return;
      }

      const slug = slugify(values.title);

      const images = imageFields.map((img, index) => ({
        id: `product-${slug}-${index + 1}`,
        description: img.description || values.title,
        imageUrl: img.url,
        imageHint: 'product',
      }));
      
      const specsObject = specFields.reduce((obj, item) => {
        if (item.key && item.value) {
          obj[item.key] = item.value;
        }
        return obj;
      }, {} as Record<string, string>);

      const updatedProductData: Partial<Product> = {
        title: values.title,
        slug: slug,
        description: values.description,
        price: values.price,
        stock: values.stock,
        category: categoryToSave,
        isNew: values.isNew,
        isBestseller: values.isBestseller,
        images: images,
        specs: specsObject,
      };

      const productRef = doc(firestore, 'products', product.id);
      await updateDoc(productRef, updatedProductData);

      toast({
        title: 'Produit mis à jour !',
        description: `Le produit "${values.title}" a été mis à jour avec succès.`,
      });
      
      router.push('/admin/products');
      router.refresh();

    } catch (error) {
      console.error("Error updating product: ", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: 'destructive',
        title: "Échec de la mise à jour",
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
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Images du produit</CardTitle>
                <FormDescription>Ajoutez une ou plusieurs images pour votre produit. La première image sera l'image principale.</FormDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (FCA)</FormLabel>
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
                        value={field.value}
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

            <div>
              <FormLabel>Fiche Technique</FormLabel>
              <FormDescription className="mb-4">Ajoutez les caractéristiques techniques du produit.</FormDescription>
              <div className="space-y-4">
                {specFields.map((spec, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Caractéristique (ex: Écran)"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                      className="w-1/3"
                    />
                    <Input
                      placeholder="Valeur (ex: 6.7 pouces OLED)"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSpecField(index)}>
                      <Trash className="text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addSpecField}>
                  Ajouter une caractéristique
                </Button>
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
                ? 'Mise à jour...'
                : 'Enregistrer les modifications'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    
