
'use client';

import type { Product, Review } from '@/lib/types';
import { StarRating } from './star-rating';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from './ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const reviewSchema = z.object({
  author: z.string().min(2, "Le nom est requis."),
  title: z.string().min(2, "Le titre est requis."),
  text: z.string().min(10, "L'avis doit contenir au moins 10 caractères."),
  rating: z.number().min(1, "Veuillez sélectionner une note.").max(5),
});

function ReviewForm({ productId, onReviewSubmitted }: { productId: string, onReviewSubmitted: () => void }) {
  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, author: '', title: '', text: '' },
  });
  const firestore = useFirestore();
  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof reviewSchema>) {
    if (!firestore) return;
    try {
      const reviewCollection = collection(firestore, `products/${productId}/reviews`);
      await addDoc(reviewCollection, {
        ...values,
        createdAt: new Date().toISOString(),
      });
      toast({ title: "Avis envoyé !", description: "Merci pour votre contribution." });
      form.reset();
      onReviewSubmitted();
    } catch (e) {
      toast({ variant: 'destructive', title: "Erreur", description: "Impossible d'envoyer l'avis." });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donner votre avis</CardTitle>
        <CardDescription>Partagez votre expérience avec ce produit.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre note</FormLabel>
                  <FormControl>
                    <StarRating rating={field.value} onRatingChange={field.onChange} interactive size={24} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Jean Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de votre avis</FormLabel>
                  <FormControl>
                    <Input placeholder="Excellent produit !" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre avis</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Dites-nous en plus..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Envoi..." : "Envoyer mon avis"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-muted-foreground py-8 text-center">Aucun avis pour le moment. Soyez le premier à en laisser un !</p>;
  }

  return (
    <div className="space-y-8">
      {reviews.map((review) => (
        <div key={review.id} className="flex gap-4">
          <Avatar>
            <AvatarFallback>{review.author.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold">{review.author}</h4>
              <span className="text-xs text-muted-foreground">
                {format(new Date(review.createdAt), "d MMM yyyy", { locale: fr })}
              </span>
            </div>
            <StarRating rating={review.rating} size={14} className="mt-1" />
            <h5 className="font-semibold mt-3">{review.title}</h5>
            <p className="text-muted-foreground text-sm mt-1 prose prose-sm max-w-none">{review.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}


interface ReviewsSectionProps {
  product: Product;
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

export function ReviewsSection({ product, reviews, averageRating, reviewCount }: ReviewsSectionProps) {
  const [showForm, setShowForm] = useState(false);

  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (reviewCount === 0) return distribution;
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  }, [reviews, reviewCount]);

  return (
    <div id="reviews" className="space-y-12">
      <Card>
        <CardHeader>
          <CardTitle>Avis des clients</CardTitle>
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <StarRating rating={averageRating} />
              <span className="text-muted-foreground text-sm">Basé sur {reviewCount} avis</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              {reviewCount > 0 ? [5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 my-1">
                  <span className="text-sm text-muted-foreground w-12">{rating} étoile{rating > 1 ? 's' : ''}</span>
                  <Progress value={(ratingDistribution[rating as keyof typeof ratingDistribution] / reviewCount) * 100} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground w-8 text-right">{ratingDistribution[rating as keyof typeof ratingDistribution]}</span>
                </div>
              )) : <p className="text-muted-foreground">Pas encore d'évaluations.</p>}
            </div>
            <div className="flex flex-col items-center justify-center text-center p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold">Vous avez ce produit ?</h4>
              <p className="text-muted-foreground text-sm mt-1 mb-4">Partagez votre expérience avec les autres clients.</p>
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Fermer le formulaire' : 'Laisser un avis'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showForm && <ReviewForm productId={product.id} onReviewSubmitted={() => setShowForm(false)} />}
      
      <Separator />
      
      <ReviewList reviews={reviews} />
    </div>
  );
}
