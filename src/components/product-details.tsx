
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import type { Product, SimpleCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Price } from '@/components/price';
import { Icons } from '@/components/icons';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ProductGrid } from './product-grid';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSiteSettings } from '@/hooks/use-site-data';
import { useToast } from '@/hooks/use-toast';

interface ProductDetailsProps {
  product: Product;
  relatedProducts: Product[];
  categoryPath: SimpleCategory[];
}

export function ProductDetails({ product, relatedProducts, categoryPath }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { addToCart } = useCart();
  const { settings } = useSiteSettings();
  const { toast } = useToast();
  
  useEffect(() => {
    const initialVariants: Record<string, string> = {};
    product.variants?.forEach(variant => {
      if (variant.options.length > 0) {
        initialVariants[variant.name] = variant.options[0].value;
      }
    });
    setSelectedVariants(initialVariants);
  }, [product.variants]);

  const currentStock = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return product.stock;
    }
    
    for (const variant of product.variants) {
      const selectedOptionValue = selectedVariants[variant.name];
      if (selectedOptionValue) {
        const option = variant.options.find(opt => opt.value === selectedOptionValue);
        if (option) {
          return option.stock;
        }
      }
    }
    
    return product.stock;
  }, [product, selectedVariants]);

  const handleAddToCart = () => {
    const variantInfo = Object.keys(selectedVariants).length > 0 
      ? Object.entries(selectedVariants).map(([name, value]) => ({ name, value }))
      : undefined;
      
    addToCart(product, quantity, variantInfo);
  };

  const handleWhatsAppOrder = () => {
    if (!settings.whatsappNumber) {
      toast({
        variant: "destructive",
        title: "Configuration requise",
        description: "Le numéro WhatsApp n'a pas été configuré par l'administrateur.",
      });
      return;
    }

    const variantText = Object.values(selectedVariants).join(', ');
    const message = `Bonjour, je suis intéressé(e) par le produit : ${product.title} ${variantText ? `(${variantText})` : ''}.`;
    const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const stockStatus = currentStock > 10 ? 'En stock' : currentStock > 0 ? 'Stock limité' : 'Épuisé';
  const stockBadgeVariant = currentStock > 10 ? 'default' : currentStock > 0 ? 'secondary' : 'destructive';

  return (
    <div className="container py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Accueil</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
           {categoryPath.map((cat) => (
            <React.Fragment key={cat.id}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/products?category=${cat.slug}`}>{cat.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </React.Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Carousel>
            <CarouselContent>
              {product.images?.map((img) => (
                <CarouselItem key={img.id}>
                  <div className="aspect-square relative rounded-lg border overflow-hidden bg-secondary/30">
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
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">{product.brand}</span>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{product.title}</h1>
          
          <div className="mt-4">
            <Badge variant={stockBadgeVariant}>{stockStatus}</Badge>
          </div>

          <div className="mt-4">
            <Price price={product.price} salePrice={product.salePrice} currency={product.currency} className="text-2xl" />
          </div>

          <Separator className="my-6" />

          {product.variants?.map(variant => (
            <div key={variant.name} className="mb-4">
              <h3 className="font-semibold text-sm mb-2">{variant.name}</h3>
              <div className="flex flex-wrap gap-2">
                {variant.options.map(option => (
                  <Button
                    key={option.value}
                    variant={selectedVariants[variant.name] === option.value ? "default" : "outline"}
                    onClick={() => setSelectedVariants(prev => ({...prev, [variant.name]: option.value}))}
                  >
                    {option.value}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          <p className="text-muted-foreground leading-relaxed mt-4 flex-1">{product.description}</p>
          
          <div className="mt-6 flex flex-col gap-4">
            <div className='flex items-center gap-4'>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q-1))}>
                    <Icons.minus className="h-4 w-4" />
                  </Button>
                  <span className="font-bold text-lg w-12 text-center">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(q => q+1)}>
                    <Icons.plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="lg" onClick={handleAddToCart} disabled={currentStock === 0} className="flex-1">
                  <Icons.shoppingBag className="mr-2 h-5 w-5"/> Ajouter au panier
                </Button>
            </div>
             <Button variant="outline" size="lg" onClick={handleWhatsAppOrder}>
                <Icons.whatsapp className="mr-2 h-5 w-5"/> Commander sur WhatsApp
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        {Object.keys(product.specs).length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-2">Caractéristiques</h3>
              <Table>
                <TableBody>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium text-muted-foreground">{key}</TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
