'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Loader2, Copy, Trash2, Plus, ImageOff, Search, Upload } from 'lucide-react';
import { useApiData } from '@/hooks/use-api-data';
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { AdminError } from '@/components/admin/admin-error';

type MediaEntry = {
  id: string;
  name: string;
  url: string;
  kind: string;
  createdAt: string;
  size?: number;
  contentType?: string;
  usage?: string;
};

type MediaPayload = {
  library: MediaEntry[];
  used: MediaEntry[];
};

export default function MediaPage() {
  const { data, loading, error, refetch } = useApiData<MediaPayload>('/api/media');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'library' | 'used'>('library');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [itemToDelete, setItemToDelete] = useState<MediaEntry | null>(null);
  const { toast } = useToast();

  const items = useMemo(() => {
    const source = tab === 'library' ? data?.library ?? [] : data?.used ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return source;
    return source.filter(
      (item) =>
        item.name.toLowerCase().includes(term) || item.url.toLowerCase().includes(term)
    );
  }, [data, tab, search]);

  const copyToClipboard = useCallback(
    async (url: string) => {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Copié !', description: "Le lien de l'image a été copié." });
      } catch {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Copie impossible.' });
      }
    },
    [toast]
  );

  const handleAdd = useCallback(async () => {
    if (!newUrl.trim()) {
      toast({ variant: 'destructive', title: 'Erreur', description: "L'URL est requise." });
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/api/media', { url: newUrl.trim(), name: newName.trim() });
      await refetch();
      setNewUrl('');
      setNewName('');
      setIsDialogOpen(false);
      setTab('library');
      toast({ title: 'Média ajouté', description: "L'image est disponible dans votre médiathèque." });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: e instanceof Error ? e.message : "Impossible d'ajouter ce média.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [newUrl, newName, refetch, toast]);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || 'Téléversement impossible.');
        await refetch();
        setTab('library');
        toast({
          title: 'Image téléversée',
          description: 'Copiez son URL pour l’utiliser dans vos produits ou bannières.',
        });
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: e instanceof Error ? e.message : 'Téléversement impossible.',
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [refetch, toast]
  );

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await api.delete('/api/media?id=' + itemToDelete.id);
      await refetch();
      toast({ title: 'Média supprimé' });
      setItemToDelete(null);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible de supprimer ce média.",
      });
    }
  }, [itemToDelete, refetch, toast]);

  return (
    <div className="py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Médiathèque</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="font-headline font-bold">Médiathèque</CardTitle>
              <CardDescription>
                Gérez les images de votre boutique. Téléversez un fichier ou collez une URL
                directe, puis copiez l’URL dans vos produits ou bannières.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
              />
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-3.5 w-3.5" />
                )}
                Téléverser un fichier
              </Button>
              <Button size="sm" onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
                <Plus className="mr-2 h-3.5 w-3.5" />
                Ajouter un média
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Button
                variant={tab === 'library' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTab('library')}
              >
                Bibliothèque ({data?.library?.length ?? 0})
              </Button>
              <Button
                variant={tab === 'used' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTab('used')}
              >
                En usage ({data?.used?.length ?? 0})
              </Button>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un média..."
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <AdminError description={error.message} onRetry={refetch} />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <ImageOff className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">
                {tab === 'library' ? 'Votre médiathèque est vide' : 'Aucune image en usage'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {tab === 'library'
                  ? 'Ajoutez un média pour pouvoir réutiliser son URL.'
                  : "Les images ajoutées à vos produits et bannières apparaîtront ici."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden rounded-2xl border-border/70">
                  <div className="relative aspect-video bg-muted">
                    { }
                    <img
                      src={item.url}
                      alt={item.name || item.url}
                      className="object-contain"
                      loading="lazy"
                    />
                    {item.usage ? (
                      <Badge
                        variant="secondary"
                        className="absolute left-2 top-2 bg-background/80 backdrop-blur"
                      >
                        {item.usage}
                      </Badge>
                    ) : null}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm font-medium truncate" title={item.name || item.url}>
                      {item.name || 'Sans nom'}
                    </p>
                    <div className="flex items-center gap-2">
                      <Input readOnly value={item.url} className="text-xs h-8" />
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => copyToClipboard(item.url)}
                        aria-label="Copier le lien"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {tab === 'library' ? (
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 flex-shrink-0 text-destructive"
                          onClick={() => setItemToDelete(item)}
                          aria-label="Supprimer le média"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un média</DialogTitle>
            <DialogDescription>
              Collez l&apos;URL directe de votre image (terminaison .jpg, .png, .webp ou .avif).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="media-url">URL de l&apos;image</Label>
              <Input
                id="media-url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://exemple.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="media-name">Nom (optionnel)</Label>
              <Input
                id="media-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="iPhone 15 Pro"
              />
            </div>
            {newUrl ? (
              <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                { }
                <img src={newUrl} alt="Aperçu" className="object-contain" />
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAdd} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce média ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le média sera retiré de la médiathèque. Les images déjà utilisées dans vos produits
              ou bannières ne seront pas affectées.
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
