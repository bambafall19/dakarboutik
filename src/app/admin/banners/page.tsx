
'use client';

import React, { useState, useCallback } from 'react';
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
import { useBanners } from '@/hooks/use-site-data';
import type { Banner } from '@/lib/types';
import { MoreHorizontal, PlusCircle, Loader2, Info } from 'lucide-react';
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
import { BannerForm, positionLabels } from '@/components/admin/banner-form';
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
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
import { getBanners as getStaticBanners } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AdminError } from '@/components/admin/admin-error';


export default function BannersPage() {
    const { banners: allBanners, loading, error, refetch } = useBanners();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
    const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);
    
    const { toast } = useToast();

    const handleFormSaved = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const banners = React.useMemo(() => {
        if (!allBanners) return [];
        return [...allBanners].sort((a,b) => a.order - b.order);
    }, [allBanners]);

    const handleAddClick = useCallback(() => {
        setSelectedBanner(null);
        setIsFormOpen(true);
    }, []);

    const handleEditClick = useCallback((banner: Banner) => {
        setSelectedBanner(banner);
        setIsFormOpen(true);
    }, []);

    const handleDeleteClick = useCallback((banner: Banner) => {
        setBannerToDelete(banner);
    }, []);

    const handleStatusChange = async (banner: Banner, checked: boolean) => {
        try {
          await api.put('/api/banners', { id: banner.id, isActive: checked });
          await refetch();
          toast({
            title: 'Statut mis à jour',
            description: `La bannière "${banner.title}" est maintenant ${checked ? 'active' : 'inactive'}.`,
          });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le statut.' });
        }
    };

    const confirmDelete = async () => {
        if (!bannerToDelete) return;
        
        try {
            await api.delete('/api/banners?id=' + bannerToDelete.id);
            await refetch();
            toast({ title: 'Bannière supprimée' });
            setBannerToDelete(null);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la bannière.' });
        }
    }

    const handleSeedData = async () => {
        setIsSeeding(true);
        try {
            const staticBanners = getStaticBanners();
            
            for (const item of staticBanners) {
                await api.post('/api/banners', item);
            }
            
            await refetch();
            toast({ title: 'Données initiales ajoutées', description: `${staticBanners.length} bannières ont été ajoutées.` });
        } catch (error) {
            console.error("Error seeding banner data:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'ajouter les données initiales.' });
        } finally {
            setIsSeeding(false);
        }
    };


  return (
    <div className="py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Gestion des Bannières</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <CardTitle className="font-headline font-bold">Bannières</CardTitle>
                <CardDescription>
                    Gérez les bannières affichées sur votre site.
                </CardDescription>
            </div>
            <Button size="sm" onClick={handleAddClick} className="w-full sm:w-auto">
                  <PlusCircle className="h-3.5 w-3.5 mr-2" />
                  Ajouter une bannière
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
            ) : banners.length === 0 ? (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Aucune bannière trouvée !</AlertTitle>
                    <AlertDescription>
                        Vous pouvez ajouter des bannières manuellement ou importer les bannières par défaut pour commencer.
                        <Button onClick={handleSeedData} disabled={isSeeding} className="mt-4" size="sm">
                            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Importer les bannières par défaut
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Ordre</TableHead>
                            <TableHead>Titre</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                       {banners.map(banner => (
                         <TableRow key={banner.id}>
                            <TableCell>{banner.order}</TableCell>
                            <TableCell className="font-medium">{banner.title}</TableCell>
                             <TableCell>
                                <Badge variant="secondary" className="rounded-full">{positionLabels[banner.position]}</Badge>
                            </TableCell>
                            <TableCell>
                               <Switch
                                    checked={banner.isActive}
                                    onCheckedChange={(checked) => handleStatusChange(banner, checked)}
                                    aria-label={`Statut de la bannière ${banner.title}`}
                                />
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost" aria-label={`Actions pour ${banner.title}`}>
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleEditClick(banner)}>Modifier</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDeleteClick(banner)}>Supprimer</DropdownMenuItem>
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
      
      <BannerForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        banner={selectedBanner}
        onSaved={handleFormSaved}
      />
      <AlertDialog open={!!bannerToDelete} onOpenChange={(open) => !open && setBannerToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr(e)?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. La bannière sera définitivement supprimée.
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
