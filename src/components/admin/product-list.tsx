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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { Price } from '../price';
import { Switch } from '../ui/switch';

export function ProductList({ products }: { products: Product[] }) {
  return (
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
              <TableHead>Prix</TableHead>
              <TableHead className="hidden md:table-cell">Stock</TableHead>
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
                    // onCheckedChange={(checked) => updateProductStatus(product.id, checked)}
                    aria-label="product status"
                  />
                </TableCell>
                <TableCell>
                  <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.stock} en stock
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
                      <DropdownMenuItem>Modifier</DropdownMenuItem>
                      <DropdownMenuItem>Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
