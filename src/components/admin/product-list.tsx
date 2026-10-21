
'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  File,
  PlusCircle,
  MoreHorizontal,
  Search,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  DropdownMenuSeparator,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { Price } from '../price';
import { Switch } from '../ui/switch';
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { useCategories } from '@/hooks/use-site-data';
import { Checkbox } from '../ui/checkbox';
import { exportCsv } from '@/lib/export-csv';

function EditableStock({ product, onUpdated }: { product: Product; onUpdated?: () => void }) {
  const [stock, setStock] = useState(product.stock);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setStock(product.stock);
  }, [product.stock]);

  const handleStockUpdate = async () => {
    setIsEditing(false);
    if (stock === product.stock) return; // No change

    try {
      await api.put('/api/products', { ...product, id: product.id, stock });
      toast({
        title: 'Stock mis à jour',
        description: `Le stock de "${product.title}" est maintenant de ${stock}.`,
      });
      onUpdated?.();
    } catch (error) {
      setStock(product.stock); // Revert on error
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le stock.',
      });
    }
  };

  return (
    <div className="w-24">
      {isEditing ? (
        <Input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
          onBlur={handleStockUpdate}
          onKeyDown={(e) => e.key === 'Enter' && handleStockUpdate()}
          autoFocus
          className="h-8"
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className={cn(
            'w-full rounded-full border px-2.5 py-1 text-left text-xs font-semibold transition',
            {
              'border-primary/20 bg-primary/10 text-primary': stock > 5,
              'border-accent/30 bg-accent/15 text-accent-foreground': stock > 0 && stock <= 5,
              'border-destructive/20 bg-destructive/10 text-destructive': stock === 0,
            }
          )}
        >
          {stock > 0 ? `${stock} en stock` : 'Vendu'}
        </button>
      )}
    </div>
  );
}


export function ProductList({
  products,
  onRefresh,
  initialSearch = '',
}: {
  products: Product[];
  onRefresh?: () => void;
  initialSearch?: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const { rawCategories, loading: categoriesLoading } = useCategories();
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  React.useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const categoryMap = useMemo(() => {
    if (categoriesLoading || !rawCategories) return new Map();
    return new Map(rawCategories.map(cat => [cat.slug, cat.name]));
  }, [categoriesLoading, rawCategories]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
        const searchMatch = searchTerm.trim() === '' || product.title.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter === 'all' || product.status === statusFilter;
        const categoryMatch = categoryFilter === 'all' || product.category === categoryFilter;
        return searchMatch && statusMatch && categoryMatch;
    });
  }, [products, searchTerm, statusFilter, categoryFilter]);


  const handleStatusChange = async (product: Product, checked: boolean) => {
    const newStatus = checked ? 'active' : 'draft';

    try {
      await api.put('/api/products', { ...product, id: product.id, status: newStatus });
      toast({
        title: 'Statut mis à jour',
        description: `Le produit "${product.title}" est maintenant ${
          newStatus === 'active' ? 'actif' : 'inactif'
        }.`,
      });
      onRefresh?.();
    } catch (error) {
      onRefresh?.();
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut du produit.',
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await api.delete(`/api/products?id=${productToDelete.id}`);
      toast({
        title: 'Produit supprimé',
        description: `Le produit "${productToDelete.title}" a été supprimé avec succès.`,
      });
      setProductToDelete(null);
      onRefresh?.();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer le produit.',
      });
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;

    const results = await Promise.allSettled(
      selectedProductIds.map((id) => api.delete(`/api/products?id=${id}`))
    );
    const failed = results.filter((r) => r.status === 'rejected').length;
    const succeeded = results.length - failed;

    if (failed === 0) {
      toast({
        title: 'Produits supprimés',
        description: `${succeeded} produit(s) ont été supprimés.`,
      });
      setSelectedProductIds([]);
    } else {
      toast({
        variant: 'destructive',
        title: 'Suppression partielle',
        description: `${succeeded} supprimé(s), ${failed} échec(s). Réessayez pour les produits restants.`,
      });
      const failedIds = selectedProductIds.filter(
        (_, i) => results[i]?.status === 'rejected'
      );
      setSelectedProductIds(failedIds);
    }
    setBulkDeleteConfirmation(false);
    onRefresh?.();
  };
  
  const exportToCsv = () => {
    if (!filteredProducts || filteredProducts.length === 0) {
      toast({
        title: 'Aucun produit à exporter',
        description: 'Ajustez vos filtres pour exporter des produits.',
      });
      return;
    }

    const headers = [
      'ID', 'Titre', 'Statut', 'Catégorie', 'Stock', 'Prix', 'Prix Barré', 'Date de création'
    ];

    const rows = filteredProducts.map((p) => [
      p.id,
      p.title,
      p.status,
      categoryMap.get(p.category) || p.category,
      p.stock,
      p.price,
      p.salePrice || '',
      new Date(p.createdAt).toLocaleDateString('fr-SN'),
    ]);

    const date = new Date().toISOString().split('T')[0];
    exportCsv(`produits-dakarboutik-${date}.csv`, headers, rows);
  };

  return (
    <>
      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-headline font-bold">Produits</CardTitle>
              <CardDescription>
                Gérez vos produits, leur inventaire et leur statut.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="rounded-full" onClick={exportToCsv}>
                <File className="h-3.5 w-3.5 mr-2" />
                Exporter
              </Button>
              <Button size="sm" asChild className="rounded-full">
                <Link href="/admin/add-product">
                  <PlusCircle className="h-3.5 w-3.5 mr-2" />
                  Ajouter un produit
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Rechercher par nom..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
             <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {rawCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedProductIds.length > 0 && (
            <div className="bg-secondary/60 p-2.5 rounded-xl mb-4 flex items-center justify-between gap-3">
                <span className='text-sm font-medium'>{selectedProductIds.length} produit(s) sélectionné(s)</span>
                 <Button variant="destructive" size="sm" className="rounded-full" onClick={() => setBulkDeleteConfirmation(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer la sélection
                </Button>
            </div>
          )}
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead className="w-12">
                      <Checkbox
                          checked={selectedProductIds.length > 0 && selectedProductIds.length === filteredProducts.length}
                          onCheckedChange={(checked) => {
                              if (checked) {
                                  setSelectedProductIds(filteredProducts.map(p => p.id));
                              } else {
                                  setSelectedProductIds([]);
                              }
                          }}
                      />
                   </TableHead>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    Image
                  </TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Créé le
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} data-state={selectedProductIds.includes(product.id) ? "selected" : undefined}>
                    <TableCell>
                        <Checkbox
                            checked={selectedProductIds.includes(product.id)}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setSelectedProductIds(prev => [...prev, product.id]);
                                } else {
                                    setSelectedProductIds(prev => prev.filter(id => id !== product.id));
                                }
                            }}
                        />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <div className="relative h-12 w-12 rounded-md border bg-secondary overflow-hidden">
                            {product.images[0]?.imageUrl ? (
                                <Image
                                    src={product.images[0].imageUrl}
                                    alt={product.title}
                                    fill
                                    className="object-contain p-1"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                    Aucune
                                </div>
                            )}
                        </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>
                      <Switch
                        checked={product.status === 'active'}
                        onCheckedChange={(checked) => handleStatusChange(product, checked)}
                        aria-label={`Statut de ${product.title}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{categoryMap.get(product.category) || product.category}</Badge>
                    </TableCell>
                     <TableCell className="hidden md:table-cell">
                        <EditableStock product={product} onUpdated={onRefresh} />
                    </TableCell>
                    <TableCell>
                      <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
                    </TableCell>
                     <TableCell className="hidden md:table-cell">
                      {new Date(product.createdAt).toLocaleDateString('fr-SN')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" aria-label="Actions du produit">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/admin/edit-product/${product.id}`)}>Modifier</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => setProductToDelete(product)}
                        >
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
          ) : (
             <div className="text-center py-16">
                <h3 className="text-lg font-semibold">Aucun produit trouvé</h3>
                <p className="text-muted-foreground text-sm">Essayez de changer vos filtres ou votre recherche.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Single Delete Confirmation */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le produit &quot;{productToDelete?.title}&quot; sera
              définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
       <AlertDialog
        open={bulkDeleteConfirmation}
        onOpenChange={setBulkDeleteConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression en masse ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. {selectedProductIds.length} produits seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
