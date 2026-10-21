'use client';

import { useCallback, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, MoreHorizontal, Star, Trash2, MessageSquare } from 'lucide-react';
import { useApiData } from '@/hooks/use-api-data';
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import type { Review } from '@/lib/types';
import { AdminError } from '@/components/admin/admin-error';

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-3.5 w-3.5 ${
            index < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'
          }`}
        />
      ))}
    </span>
  );
}

export default function ReviewsAdminPage() {
  const { data, loading, error, refetch } = useApiData<Review[]>('/api/reviews');
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { toast } = useToast();

  const reviews = data || [];

  const handleTogglePublished = useCallback(
    async (review: Review, isPublished: boolean) => {
      setPendingId(review.id);
      try {
        await api.put('/api/reviews', { id: review.id, isPublished });
        await refetch();
        toast({
          title: isPublished ? 'Avis publié' : 'Avis masqué',
          description: isPublished
            ? "L'avis est maintenant visible sur la fiche produit."
            : "L'avis est masqué du site public.",
        });
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: "Impossible de modifier le statut de l'avis.",
        });
      } finally {
        setPendingId(null);
      }
    },
    [refetch, toast]
  );

  const confirmDelete = useCallback(async () => {
    if (!reviewToDelete) return;
    try {
      await api.delete('/api/reviews?id=' + reviewToDelete.id);
      await refetch();
      toast({ title: 'Avis supprimé' });
      setReviewToDelete(null);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible de supprimer l'avis.",
      });
    }
  }, [reviewToDelete, refetch, toast]);

  return (
    <div className="py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Avis clients</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="font-headline font-bold">Avis clients</CardTitle>
              <CardDescription>
                Modérez les avis laissés sur vos fiches produits. Un avis masqué reste enregistré
                mais n&apos;apparaît pas sur le site public.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={refetch} className="w-full sm:w-auto">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <AdminError description={error.message} onRetry={refetch} />
          ) : reviews.length === 0 ? (
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertTitle>Aucun avis pour le moment</AlertTitle>
              <AlertDescription>
                Les avis laissés par vos clients sur les fiches produits apparaîtront ici.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Produit</TableHead>
                    <TableHead>Avis</TableHead>
                    <TableHead className="w-[120px]">Note</TableHead>
                    <TableHead className="w-[180px]">Date</TableHead>
                    <TableHead className="w-[110px]">Publié</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">
                        {review.productTitle || (
                          <span className="text-muted-foreground">Produit supprimé</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {review.title ? (
                            <p className="font-medium leading-tight">{review.title}</p>
                          ) : null}
                          <p className="text-sm text-muted-foreground leading-snug">{review.text}</p>
                          <p className="text-xs text-muted-foreground">Par {review.author}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Stars rating={review.rating} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={review.isPublished !== false}
                            disabled={pendingId === review.id}
                            onCheckedChange={(checked) => handleTogglePublished(review, checked)}
                            aria-label="Publier ou masquer l'avis"
                          />
                          <Badge variant={review.isPublished !== false ? 'default' : 'secondary'}>
                            {review.isPublished !== false ? 'Publié' : 'Masqué'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                              aria-label="Actions pour cet avis"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => setReviewToDelete(review)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!reviewToDelete}
        onOpenChange={(open) => !open && setReviewToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr(e)?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;avis sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
