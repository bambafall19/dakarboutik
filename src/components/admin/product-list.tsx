
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
import { useFirestore } from '@/firebase';
import { doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { useCategories } from '@/hooks/use-site-data';
import { Checkbox } from '../ui/checkbox';

function EditableStock({ product }: { product: Product }) {
  const [stock, setStock] = useState(product.stock);
  const [isEditing, setIsEditing] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleStockUpdate = async () => {
    setIsEditing(false);
    if (stock === product.stock) return; // No change

    if (!firestore) {
       toast({ variant: 'destructive', title: 'Erreur', description: 'Firestore non disponible.'});
       return;
    }

    const productRef = doc(firestore, 'products', product.id);
    try {
      await updateDoc(productRef, { stock: stock });
      toast({
        title: 'Stock mis à jour',
        description: `Le stock de "${product.title}" est maintenant de ${stock}.`,
      });
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
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          onBlur={handleStockUpdate}
          onKeyDown={(e) => e.key === 'Enter' && handleStockUpdate()}
          autoFocus
          className="h-8"
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className={cn(
            "w-full text-left px-2 py-1 rounded-md text-sm",
            {
              "text-green-800 bg-green-100": stock > 5,
              "text-yellow-800 bg-yellow-100": stock > 0 && stock <= 5,
              "text-red-800 bg-red-100": stock === 0,
            }
          )}
        >
          {stock > 0 ? `${stock} en stock` : 'Vendu'}
        </button>
      )}
    </div>
  );
}


export function ProductList({ products }: { products: Product[] }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const { rawCategories, loading: categoriesLoading } = useCategories();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
    if (!firestore) return;
    const newStatus = checked ? 'active' : 'draft';
    const productRef = doc(firestore, 'products', product.id);

    try {
      await updateDoc(productRef, { status: newStatus });
      toast({
        title: 'Statut mis à jour',
        description: `Le produit "${product.title}" est maintenant ${
          newStatus === 'active' ? 'actif' : 'inactif'
        }.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut du produit.',
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete || !firestore) return;
    const productRef = doc(firestore, 'products', productToDelete.id);

    try {
      await deleteDoc(productRef);
      toast({
        title: 'Produit supprimé',
        description: `Le produit "${productToDelete.title}" a été supprimé avec succès.`,
      });
      setProductToDelete(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer le produit.',
      });
    }
  };
  
  const handleBulkDelete = async () => {
    if (!firestore || selectedProductIds.length === 0) return;

    const batch = writeBatch(firestore);
    selectedProductIds.forEach(id => {
      const productRef = doc(firestore, 'products', id);
      batch.delete(productRef);
    });

    try {
      await batch.commit();
      toast({
        title: 'Produits supprimés',
        description: `${selectedProductIds.length} produits ont été supprimés.`,
      });
      setSelectedProductIds([]);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer les produits sélectionnés.',
      });
    }
    setBulkDeleteConfirmation(false);
  };
  
  const exportToCsv = () => {
    if (!filteredProducts || filteredProducts.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Aucun produit à exporter',
      });
      return;
    }

    const headers = [
      'ID', 'Titre', 'Statut', 'Catégorie', 'Stock', 'Prix', 'Prix Barré', 'Date de création'
    ];

    const escapeCsvCell = (cellData: any): string => {
        const cellString = String(cellData ?? '');
        if (/[",\n]/.test(cellString)) {
            return `"${cellString.replace(/"/g, '""')}"`;
        }
        return cellString;
    };

    const rows = filteredProducts.map(p => [
      p.id,
      p.title,
      p.status,
      categoryMap.get(p.category) || p.category,
      p.stock,
      p.price,
      p.salePrice || '',
      new Date(p.createdAt).toLocaleDateString('fr-SN'),
    ].map(escapeCsvCell).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `produits-dakarboutik-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produits</CardTitle>
              <CardDescription>
                Gérez vos produits, leur inventaire et leur statut.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={exportToCsv}>
                <File className="h-3.5 w-3.5 mr-2" />
                Exporter
              </Button>
              <Button size="sm" asChild>
                <Link href="/admin/add-product">
                  <PlusCircle className="h-3.5 w-3.5 mr-2" />
                  Ajouter un produit
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Rechercher par nom..."
                    className="pl-8 w-full md:w-1/2 lg:w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
             <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
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
                <SelectTrigger className="w-[180px]">
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
            <div className="bg-muted p-2 rounded-md mb-4 flex items-center justify-between">
                <span className='text-sm font-medium'>{selectedProductIds.length} produit(s) sélectionné(s)</span>
                 <Button variant="destructive" size="sm" onClick={() => setBulkDeleteConfirmation(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer la sélection
                </Button>
            </div>
          )}
          {filteredProducts.length > 0 ? (
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
                            <Image
                                src={product.images[0]?.imageUrl}
                                alt={product.title}
                                fill
                                className="object-contain p-1"
                            />
                        </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>
                      <Switch
                        checked={product.status === 'active'}
                        onCheckedChange={(checked) => handleStatusChange(product, checked)}
                        aria-label="product status"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{categoryMap.get(product.category) || product.category}</Badge>
                    </TableCell>
                     <TableCell className="hidden md:table-cell">
                        <EditableStock product={product} />
                    </TableCell>
                    <TableCell>
                      <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
                    </TableCell>
                     <TableCell className="hidden md:table-cell">
                      {new Date(product.createdAt).toLocaleDateString()}
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
                          <DropdownMenuItem onClick={() => router.push(`/admin/edit-product/${product.id}`)}>Modifier</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
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
