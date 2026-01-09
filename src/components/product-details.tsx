
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Price } from '@/components/price';
import { Icons } from '@/components/icons';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ProductGrid } from './product-grid';

export function ProductDetails({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const stockStatus = product.stock > 10 ? 'En stock' : product.stock > 0 ? 'Stock limité' : 'Épuisé';
  const stockBadgeVariant = product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive';

  return (
    <div className="container py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Produits</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Carousel>
            <CarouselContent>
              {product.images?.map((img) => (
                <CarouselItem key={img.id}>
                  <div className="aspect-square relative rounded-lg border overflow-hidden">
                    <Image
                      src={img.imageUrl}
                      alt={product.title}
                      data-ai-hint={img.imageHint}
                      fill
                      className="object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">{product.brand}</span>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{product.title}</h1>
          
          <div className="mt-4">
            <Badge variant={stockBadgeVariant}>{stockStatus}</Badge>
          </div>

          <div className="mt-4">
            <Price price={product.price} salePrice={product.salePrice} currency={product.currency} className="text-2xl" />
          </div>

          <Separator className="my-6" />

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q-1))}>
                <Icons.minus className="h-4 w-4" />
              </Button>
              <span className="font-bold text-lg w-12 text-center">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantity(q => q+1)}>
                <Icons.plus className="h-4 w-4" />
              </Button>
            </div>
            <Button size="lg" onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1">
              <Icons.logo className="mr-2 h-5 w-5"/> Ajouter au panier
            </Button>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-lg mb-2">Caractéristiques</h3>
            <Table>
              <TableBody>
                {product.specs && Object.entries(product.specs).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium text-muted-foreground">{key}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16">
          <ProductGrid 
            title="Produits similaires"
            products={relatedProducts}
          />
        </div>
      )}
    </div>
  );
}
