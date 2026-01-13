
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

const formSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  parentId: z.string().optional(),
});

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryUpdate: () => void;
  category?: Category | null;
  allCategories: Category[];
}

export function CategoryForm({ open, onOpenChange, onCategoryUpdate, category, allCategories }: CategoryFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      parentId: category?.parentId || '',
    },
  });
  
  React.useEffect(() => {
    form.reset({
        name: category?.name || '',
        parentId: category?.parentId || '',
    })
  }, [category, form, open])


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    try {
        const slug = slugify(values.name, { lower: true, strict: true });
        const data = {
            name: values.name,
            slug: slug,
            parentId: values.parentId || null
        }

        if (category) {
            // Update
            const categoryRef = doc(firestore, 'categories', category.id);
            await setDoc(categoryRef, data, { merge: true });
            toast({ title: 'Catégorie mise à jour !' });
        } else {
            // Create
            const categoriesCollection = collection(firestore, 'categories');
            await addDoc(categoriesCollection, data);
            toast({ title: 'Catégorie ajoutée !' });
        }
      onCategoryUpdate();
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
                      <SelectItem value="">Aucune</SelectItem>
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
