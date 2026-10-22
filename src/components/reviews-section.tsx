
'use client';

import type { Product, Review } from '@/lib/types';
import { StarRating } from './star-rating';
import { useMemo, useState } from 'react';
import { Progress } from './ui/progress';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from './ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageSquarePlus, ShieldCheck } from 'lucide-react';

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
  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof reviewSchema>) {
    try {
      await api.post('/api/reviews', { ...values, productId });
      toast({ title: "Avis envoyé !", description: "Merci pour votre contribution." });
      form.reset();
      onReviewSubmitted();
    } catch {
      toast({ variant: 'destructive', title: "Erreur", description: "Impossible d'envoyer l'avis." });
    }
  }

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-[0_24px_60px_-45px_rgba(16,42,35,0.7)] md:p-7">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Votre expérience</span>
      <h3 className="mt-1.5 font-headline text-xl font-extrabold tracking-tight md:text-2xl">
        Donner votre avis
      </h3>
      <span className="mt-3 block h-1 w-14 rounded-full bg-gradient-to-r from-accent to-accent/20" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Votre note</FormLabel>
                <FormControl>
                  <StarRating rating={field.value} onRatingChange={field.onChange} interactive size={26} />
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
                <FormLabel className="text-sm font-semibold">Votre nom</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Jean Dupont" className="h-12 rounded-xl" {...field} />
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
                <FormLabel className="text-sm font-semibold">Titre de votre avis</FormLabel>
                <FormControl>
                  <Input placeholder="Excellent produit !" className="h-12 rounded-xl" {...field} />
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
                <FormLabel className="text-sm font-semibold">Votre avis</FormLabel>
                <FormControl>
                  <Textarea placeholder="Dites-nous en plus..." className="rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting} className="h-12 rounded-full px-6 font-semibold">
            {form.formState.isSubmitting ? "Envoi..." : "Envoyer mon avis"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card/50 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Aucun avis pour le moment. Soyez le premier à en laisser un&nbsp;!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-3xl border border-border/70 bg-card p-5 transition hover:border-primary/25 hover:shadow-[0_24px_50px_-38px_rgba(11,110,79,0.6)]"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 ring-2 ring-primary/15">
              <AvatarFallback className="bg-primary/10 font-bold text-primary">
                {review.author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-headline text-sm font-bold">{review.author}</h4>
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(review.createdAt), "d MMM yyyy", { locale: fr })}
              </span>
            </div>
            <StarRating rating={review.rating} size={14} />
          </div>
          <h5 className="mt-4 font-headline text-sm font-bold">{review.title}</h5>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{review.text}</p>
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
    <div id="reviews" className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-border/70 bg-card">
        <div className="border-b border-border/60 bg-gradient-to-r from-primary/6 via-background to-accent/8 px-5 py-5 md:px-7">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Ils en parlent</span>
          <h2 className="mt-1.5 font-headline text-xl font-extrabold tracking-tight md:text-2xl">
            Avis des clients
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2 md:items-center md:p-7">
          <div>
            {reviewCount > 0 ? (
              <>
                <div className="flex items-end gap-3">
                  <span className="font-headline text-5xl font-extrabold tracking-tight text-foreground">
                    {averageRating.toFixed(1)}
                  </span>
                  <div className="pb-1.5">
                    <StarRating rating={averageRating} size={18} />
                    <p className="mt-1 text-xs text-muted-foreground">Basé sur {reviewCount} avis</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">
                        {rating} étoile{rating > 1 ? 's' : ''}
                      </span>
                      <Progress
                        value={(ratingDistribution[rating as keyof typeof ratingDistribution] / reviewCount) * 100}
                        className="h-2 flex-1"
                      />
                      <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground">
                        {ratingDistribution[rating as keyof typeof ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Pas encore d&apos;évaluations pour ce produit.</p>
            )}
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 px-6 py-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquarePlus className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-headline text-base font-bold">Vous avez ce produit&nbsp;?</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Partagez votre expérience avec les autres clients.
            </p>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="mt-5 h-11 rounded-full px-6 font-semibold"
            >
              {showForm ? 'Fermer le formulaire' : 'Laisser un avis'}
            </Button>
          </div>
        </div>
      </div>

      {showForm && <ReviewForm productId={product.id} onReviewSubmitted={() => setShowForm(false)} />}

      <ReviewList reviews={reviews} />
    </div>
  );
}
