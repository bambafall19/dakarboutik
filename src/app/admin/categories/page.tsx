
'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
import { useCategories } from '@/hooks/use-site-data';
import type { Category } from '@/lib/types';
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
import { CategoryForm } from '@/components/admin/category-form';
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
import { initialCategories } from '@/lib/category-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdminError } from '@/components/admin/admin-error';

function CategoryRow({ category, level = 0, onEdit, onDelete }: { category: Category, level?: number, onEdit: (cat: Category) => void, onDelete: (cat: Category) => void }) {
    const hasSubCategories = category.subCategories && category.subCategories.length > 0;
    
    return (
      <TableRow>
        <TableCell style={{ paddingLeft: `${1 + level * 2}rem` }}>
          <span className="font-medium">{category.name}</span>
        </TableCell>
        <TableCell className="hidden md:table-cell">{category.slug}</TableCell>
        <TableCell className="hidden md:table-cell">{hasSubCategories ? category.subCategories?.length : 0}</TableCell>
        <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost" aria-label={`Actions pour ${category.name}`}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(category)}>Modifier</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => onDelete(category)}>Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
}

export default function CategoriesPage() {
    const { categories, rawCategories, loading, error, refetch } = useCategories();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);
    
    const { toast } = useToast();

    const handleFormSaved = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const handleAddClick = useCallback(() => {
        setSelectedCategory(null);
        setIsFormOpen(true);
    }, []);

    const handleEditClick = useCallback((category: Category) => {
        setSelectedCategory(category);
        setIsFormOpen(true);
    }, []);

    const handleDeleteClick = useCallback((category: Category) => {
        setCategoryToDelete(category);
    }, []);

    const confirmDelete = async () => {
        if (!categoryToDelete) return;
        
        const hasChildren = rawCategories.some(c => c.parentId === categoryToDelete.id);
        if(hasChildren) {
            toast({ variant: 'destructive', title: 'Action impossible', description: 'Veuillez supprimer les sous-catégories avant de supprimer la catégorie parente.' });
            setCategoryToDelete(null);
            return;
        }

        try {
            await api.delete('/api/categories?id=' + categoryToDelete.id);
            await refetch();
            toast({ title: 'Catégorie supprimée' });
            setCategoryToDelete(null);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la catégorie.' });
        }
    }
    
    const handleSeedData = async () => {
        setIsSeeding(true);
        try {
            for (const item of initialCategories) {
                const { id, ...data } = item;
                await api.post('/api/categories', { id, ...data });
            }
            
            await refetch();
            toast({ title: 'Données initiales ajoutées', description: `${initialCategories.length} catégories ont été ajoutées.` });
        } catch (error) {
            console.error("Error seeding category data:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'ajouter les données initiales.' });
        } finally {
            setIsSeeding(false);
        }
    };


    const categoryRows = useMemo(() => {
        const rows: React.ReactNode[] = [];
        const generateRows = (cats: Category[], level = 0) => {
            cats.forEach(cat => {
                rows.push(<CategoryRow key={cat.id} category={cat} level={level} onEdit={handleEditClick} onDelete={handleDeleteClick} />);
                if (cat.subCategories) {
                    generateRows(cat.subCategories, level + 1);
                }
            });
        };
        generateRows(categories);
        return rows;
    }, [categories, handleEditClick, handleDeleteClick]);


  return (
    <div className="py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Catégories</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle className="font-headline font-bold">Catégories de produits</CardTitle>
                <CardDescription>
                    Gérez la structure de votre catalogue de produits.
                </CardDescription>
            </div>
            <Button size="sm" onClick={handleAddClick} className="w-full sm:w-auto">
                  <PlusCircle className="h-3.5 w-3.5 mr-2" />
                  Ajouter une catégorie
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
            ) : categories.length === 0 ? (
                 <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Aucune catégorie trouvée !</AlertTitle>
                    <AlertDescription>
                        Vous pouvez ajouter des catégories manuellement ou importer les catégories par défaut pour commencer.
                        <Button onClick={handleSeedData} disabled={isSeeding} className="mt-4" size="sm">
                            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Importer les catégories par défaut
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead className="hidden md:table-cell">Slug</TableHead>
                            <TableHead className="hidden md:table-cell">Sous-catégories</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categoryRows}
                    </TableBody>
                </Table>
                </div>
            )}
        </CardContent>
      </Card>
      
      <CategoryForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        category={selectedCategory}
        allCategories={rawCategories}
        onSaved={handleFormSaved}
      />
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr(e)?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. La catégorie &quot;{categoryToDelete?.name}&quot; sera définitivement supprimée.
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
