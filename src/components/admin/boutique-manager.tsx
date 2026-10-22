'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import {
  BadgeCheck,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Store,
  Trash2,
  Upload,
} from 'lucide-react';
import type { Vendor } from '@/lib/types';
import { useApiData } from '@/hooks/use-api-data';
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { AdminError } from '@/components/admin/admin-error';

type BoutiqueForm = {
  name: string;
  city: string;
  description: string;
  logoUrl: string;
};

const EMPTY_FORM: BoutiqueForm = {
  name: '',
  city: 'Dakar',
  description: '',
  logoUrl: '',
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function BoutiqueManager() {
  const { data, loading, error, refetch } = useApiData<Vendor[]>('/api/vendors?all=1');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<BoutiqueForm>(EMPTY_FORM);
  const [isVerified, setIsVerified] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toDelete, setToDelete] = useState<Vendor | null>(null);

  const vendors = data ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsVerified(false);
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (vendor: Vendor) => {
    setEditing(vendor);
    setForm({
      name: vendor.name,
      city: vendor.city || 'Dakar',
      description: vendor.description || '',
      logoUrl: vendor.logoUrl || '',
    });
    setIsVerified(!!vendor.isVerified);
    setIsActive(vendor.isActive !== false);
    setDialogOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Fichier trop volumineux',
        description: 'Le logo ne doit pas dépasser 4 Mo.',
      });
      return;
    }

    setIsUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/media/upload', { method: 'POST', body });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error || "L'upload a échoué.");
      setForm((current) => ({ ...current, logoUrl: payload.url }));
      toast({ title: 'Logo téléversé', description: 'Le logo est prêt à être enregistré.' });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Upload impossible',
        description: e instanceof Error ? e.message : "Impossible d'envoyer ce fichier.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ variant: 'destructive', title: 'Nom requis', description: 'Indiquez le nom de la boutique.' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...(editing ? { id: editing.id } : {}),
        name: form.name.trim(),
        city: form.city.trim() || 'Dakar',
        description: form.description.trim(),
        logoUrl: form.logoUrl.trim() || null,
        isVerified,
        isActive,
      };

      if (editing) {
        await api.put('/api/vendors', payload);
      } else {
        await api.post('/api/vendors', payload);
      }

      await refetch();
      setDialogOpen(false);
      toast({
        title: editing ? 'Boutique mise à jour' : 'Boutique ajoutée',
        description: `${payload.name} est maintenant dans votre réseau de partenaires.`,
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Enregistrement impossible',
        description: e instanceof Error ? e.message : 'Une erreur est survenue.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (vendor: Vendor, active: boolean) => {
    try {
      await api.put('/api/vendors', {
        ...vendor,
        isActive: active,
      });
      await refetch();
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Mise à jour impossible',
        description: e instanceof Error ? e.message : 'Une erreur est survenue.',
      });
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await api.delete(`/api/vendors?id=${encodeURIComponent(toDelete.id)}`);
      await refetch();
      toast({
        title: 'Boutique supprimée',
        description: `${toDelete.name} a été retirée du réseau. Les produits restent en ligne.`,
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Suppression impossible',
        description: e instanceof Error ? e.message : 'Une erreur est survenue.',
      });
    } finally {
      setToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <AdminError title="Impossible de charger les boutiques" onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold">Boutiques partenaires</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez les logos affichés sur la page d&apos;accueil et les boutiques associées à vos
            produits.
          </p>
        </div>
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une boutique
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-primary">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          <span className="font-semibold">Confidentialité des ventes :</span> le client voit
          uniquement le logo de la boutique sur l&apos;accueil. L&apos;affectation des produits et
          les contacts restent internes. Tous les boutons WhatsApp et téléphone pointent vers le
          numéro de DakarBoutik.
        </p>
      </div>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="font-headline font-bold">Réseau de boutiques</CardTitle>
          <CardDescription>
            {vendors.length === 0
              ? 'Aucune boutique pour le moment. Ajoutez votre première boutique partenaire.'
              : `${vendors.length} boutique${vendors.length > 1 ? 's' : ''} dans votre réseau.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 px-6 py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Store className="h-7 w-7" />
              </span>
              <p className="mt-4 font-semibold">Votre réseau est vide</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Ajoutez les boutiques partenaires et leurs logos. Elles apparaîtront
                automatiquement sur la page d&apos;accueil.
              </p>
              <Button onClick={openCreate} variant="outline" className="mt-5 rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une boutique
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="group rounded-2xl border border-border/70 bg-card p-4 transition hover:border-primary/25 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-secondary/40">
                      {vendor.logoUrl ? (
                        <Image
                          src={vendor.logoUrl}
                          alt={`Logo ${vendor.name}`}
                          fill
                          sizes="64px"
                          className="object-contain p-1.5"
                        />
                      ) : (
                        <span className="font-headline text-lg font-extrabold text-primary">
                          {initials(vendor.name)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate font-semibold">
                            {vendor.name}
                            {vendor.isVerified && (
                              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                            )}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {vendor.city || 'Dakar'}
                          </p>
                        </div>
                        <Switch
                          checked={vendor.isActive !== false}
                          onCheckedChange={(value) => handleToggleActive(vendor, value)}
                          aria-label={`Activer ${vendor.name}`}
                        />
                      </div>

                      {vendor.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {vendor.description}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                          {vendor.productCount ?? 0} produit
                          {(vendor.productCount ?? 0) > 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => openEdit(vendor)}
                            aria-label={`Modifier ${vendor.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                            onClick={() => setToDelete(vendor)}
                            aria-label={`Supprimer ${vendor.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier la boutique' : 'Ajouter une boutique'}</DialogTitle>
            <DialogDescription>
              Le nom et le logo seront visibles sur l&apos;accueil. Aucune coordonnée de la
              boutique n&apos;est publiée.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-secondary/20 p-4">
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-background">
                {form.logoUrl ? (
                  <Image
                    src={form.logoUrl}
                    alt="Aperçu du logo"
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                  />
                ) : (
                  <Store className="h-9 w-9 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleUpload(file);
                    event.target.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Téléverser un logo
                </Button>
                {form.logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-destructive hover:text-destructive"
                    onClick={() => setForm((current) => ({ ...current, logoUrl: '' }))}
                  >
                    Retirer
                  </Button>
                )}
              </div>
              <div className="w-full">
                <Label htmlFor="logo-url" className="text-xs text-muted-foreground">
                  ou URL du logo
                </Label>
                <Input
                  id="logo-url"
                  value={form.logoUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, logoUrl: event.target.value }))
                  }
                  placeholder="https://... ou /api/media/file/..."
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="boutique-name">Nom de la boutique</Label>
                <Input
                  id="boutique-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Ex: Boutique Teranga"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="boutique-city">Ville</Label>
                <Input
                  id="boutique-city"
                  value={form.city}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, city: event.target.value }))
                  }
                  placeholder="Dakar"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="boutique-description">Description (optionnelle)</Label>
              <Textarea
                id="boutique-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Une courte présentation de la boutique..."
                rows={3}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border/70 px-4 py-3">
                <span className="text-sm font-medium">
                  Visible sur l&apos;accueil
                  <span className="block text-xs font-normal text-muted-foreground">
                    Afficher le logo publiquement
                  </span>
                </span>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border/70 px-4 py-3">
                <span className="text-sm font-medium">
                  Boutique vérifiée
                  <span className="block text-xs font-normal text-muted-foreground">
                    Afficher le badge de confiance
                  </span>
                </span>
                <Switch checked={isVerified} onCheckedChange={setIsVerified} />
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSaving || isUploading}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Enregistrer' : 'Ajouter la boutique'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette boutique ?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.name} sera retirée du réseau et de la page d&apos;accueil. Les produits
              associés resteront en ligne, mais sans boutique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
