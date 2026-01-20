
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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { FaqItem } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';

const formSchema = z.object({
  question: z.string().min(10, 'La question doit contenir au moins 10 caractères.'),
  answer: z.string().min(10, 'La réponse doit contenir au moins 10 caractères.'),
  order: z.coerce.number().default(99),
});

interface FaqFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faqItem?: FaqItem | null;
}

export function FaqForm({ open, onOpenChange, faqItem }: FaqFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
      answer: '',
      order: 99,
    },
  });
  
  React.useEffect(() => {
    if (open) {
        form.reset({
            question: faqItem?.question || '',
            answer: faqItem?.answer || '',
            order: faqItem?.order ?? 99,
        })
    }
  }, [faqItem, form, open])


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    try {
        const data = {
            question: values.question,
            answer: values.answer,
            order: values.order,
        }

        if (faqItem) {
            // Update
            const faqRef = doc(firestore, 'faq', faqItem.id);
            await setDoc(faqRef, data, { merge: true });
            toast({ title: 'Question mise à jour !' });
        } else {
            // Create
            const faqCollection = collection(firestore, 'faq');
            await addDoc(faqCollection, data);
            toast({ title: 'Question ajoutée !' });
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{faqItem ? 'Modifier la question' : 'Ajouter une question'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Comment puis-je suivre ma commande ?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Réponse</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Donnez la réponse à la question..." {...field} rows={5} />
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
