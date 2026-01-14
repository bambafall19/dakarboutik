
'use client';

import React, { useState, useMemo } from 'react';
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
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
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
import { useFirestore } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
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
import { useRouter } from 'next/navigation';

function CategoryRow({ category, level = 0, onEdit, onDelete }: { category: Category, level?: number, onEdit: (cat: Category) => void, onDelete: (cat: Category) => void }) {
    const hasSubCategories = category.subCategories && category.subCategories.length > 0;
    
    return (
      <TableRow>
        <TableCell style={{ paddingLeft: `${1 + level * 2}rem` }}>
          <span className="font-medium">{category.name}</span>
        </TableCell>
        <TableCell className="hidden md:table-cell">{category.slug}</TableCell>
        <TableCell className="hidden md:table-cell">{hasSubCategories ? category.subCategories.length : 0}</TableCell>
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
              <DropdownMenuItem onClick={() => onEdit(category)}>Modifier</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onDelete(category)}>Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
}

export default function CategoriesPage() {
    const { categories, rawCategories, loading, refetch } = useCategories();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();

    const handleAddClick = () => {
        setSelectedCategory(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (category: Category) => {
        setSelectedCategory(category);
        setIsFormOpen(true);
    }

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
    }

    const confirmDelete = async () => {
        if (!categoryToDelete || !firestore) return;
        
        const hasChildren = rawCategories.some(c => c.parentId === categoryToDelete.id);
        if(hasChildren) {
            toast({ variant: 'destructive', title: 'Action impossible', description: 'Veuillez supprimer les sous-catégories avant de supprimer la catégorie parente.' });
            setCategoryToDelete(null);
            return;
        }

        try {
            await deleteDoc(doc(firestore, 'categories', categoryToDelete.id));
            toast({ title: 'Catégorie supprimée' });
            setCategoryToDelete(null);
            refetch(); // Refetch categories after deletion
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la catégorie.' });
        }
    }
    
    const handleCategoryUpdate = () => {
      refetch();
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
    }, [categories]);


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
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>Catégories de produits</CardTitle>
                <CardDescription>
                    Gérez la structure de votre catalogue de produits.
                </CardDescription>
            </div>
            <Button size="sm" onClick={handleAddClick}>
                  <PlusCircle className="h-3.5 w-3.5 mr-2" />
                  Ajouter une catégorie
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
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
            )}
        </CardContent>
      </Card>
      
      <CategoryForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onCategoryUpdate={handleCategoryUpdate}
        category={selectedCategory}
        allCategories={rawCategories}
      />
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr(e)?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. La catégorie "{categoryToDelete?.name}" sera définitivement supprimée.
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
