
'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  File,
  PlusCircle,
  MoreHorizontal,
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
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { Price } from '../price';
import { Switch } from '../ui/switch';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

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
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const router = useRouter();

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
              <Button size="sm" variant="outline">
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  Image
                </TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Statut</TableHead>
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
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                      <div className="relative h-12 w-12 rounded-md border bg-secondary overflow-hidden">
                          <Image
                              src={product.images[0]?.imageUrl}
                              alt={product.title}
                              fill
                              className="object-contain"
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
        </CardContent>
      </Card>
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
    </>
  );
}
