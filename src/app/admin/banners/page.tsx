
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
import { useFirestore } from '@/firebase';
import { doc, deleteDoc, writeBatch, collection } from 'firebase/firestore';
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


export default function BannersPage() {
    const { banners: allBanners, loading } = useBanners();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
    const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);
    
    const firestore = useFirestore();
    const { toast } = useToast();

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
        if (!firestore) return;
        const bannerRef = doc(firestore, 'banners', banner.id);
        try {
          await doc(bannerRef).update({ isActive: checked });
          toast({
            title: 'Statut mis à jour',
            description: `La bannière "${banner.title}" est maintenant ${checked ? 'active' : 'inactive'}.`,
          });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le statut.' });
        }
    };

    const confirmDelete = async () => {
        if (!bannerToDelete || !firestore) return;
        
        try {
            await deleteDoc(doc(firestore, 'banners', bannerToDelete.id));
            toast({ title: 'Bannière supprimée' });
            setBannerToDelete(null);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la bannière.' });
        }
    }

    const handleSeedData = async () => {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Base de données non connectée.' });
            return;
        }
        setIsSeeding(true);
        try {
            const batch = writeBatch(firestore);
            const bannersCollection = collection(firestore, 'banners');
            const staticBanners = getStaticBanners();
            
            staticBanners.forEach(item => {
                const newDocRef = doc(bannersCollection, item.id); // Use static ID
                batch.set(newDocRef, item);
            });
            
            await batch.commit();
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
      
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
                <CardTitle>Bannières</CardTitle>
                <CardDescription>
                    Gérez les bannières affichées sur votre site.
                </CardDescription>
            </div>
            <Button size="sm" onClick={handleAddClick}>
                  <PlusCircle className="h-3.5 w-3.5 mr-2" />
                  Ajouter une bannière
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
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
                                <Badge variant="secondary">{positionLabels[banner.position]}</Badge>
                            </TableCell>
                            <TableCell>
                               <Switch
                                    checked={banner.isActive}
                                    onCheckedChange={(checked) => handleStatusChange(banner, checked)}
                                    aria-label="banner status"
                                />
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleEditClick(banner)}>Modifier</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDeleteClick(banner)}>Supprimer</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
      
      <BannerForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        banner={selectedBanner}
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
