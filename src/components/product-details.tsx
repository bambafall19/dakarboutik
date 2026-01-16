
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import type { Product, SimpleCategory, Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Price } from '@/components/price';
import { Icons } from '@/components/icons';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ProductGrid } from './product-grid';
import { useSiteSettings } from '@/hooks/use-site-data';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ProductInfoSidebar } from './product-info-sidebar';
import { useReviews } from '@/hooks/use-reviews';
import { StarRating } from './star-rating';
import { ReviewsSection } from './reviews-section';
import { Skeleton } from './ui/skeleton';


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
  const { reviews, loading: reviewsLoading } = useReviews(product.id);

  const { averageRating, reviewCount } = useMemo(() => {
    if (reviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }
    const reviewCount = reviews.length;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviewCount;
    return { averageRating, reviewCount };
  }, [reviews]);
  
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
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28">
              <ProductInfoSidebar />
            </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-9">
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
                {/* Image Carousel */}
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
                
                {/* Product Info */}
                <div className="flex flex-col">
                    {product.brand && <span className="text-sm text-muted-foreground">{product.brand}</span>}
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{product.title}</h1>
                    
                    <div className="mt-4 flex items-center gap-4">
                        <Badge variant={stockBadgeVariant}>{stockStatus}</Badge>
                        {reviewsLoading ? (
                            <Skeleton className="h-5 w-32" />
                        ) : reviewCount > 0 ? (
                            <a href="#reviews" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline">
                                <StarRating rating={averageRating} size={16} />
                                <span>({reviewCount} avis)</span>
                            </a>
                        ) : (
                            <a href="#reviews" className="text-sm text-muted-foreground hover:underline">Soyez le premier à laisser un avis</a>
                        )}
                    </div>

                    <div className="mt-4">
                        <Price price={product.price} salePrice={product.salePrice} currency={product.currency} className="text-2xl" />
                    </div>

                    <Separator className="my-6" />

                    <div className="text-muted-foreground leading-relaxed prose prose-sm max-w-none whitespace-pre-wrap">
                    {product.description}
                    </div>


                    {product.variants?.map(variant => (
                        <div key={variant.name} className="mt-6">
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
                        </div>
                        <Button size="lg" onClick={handleAddToCart} disabled={currentStock === 0} className="w-full">
                            <Icons.shoppingBag className="mr-2 h-5 w-5"/> Ajouter au panier
                        </Button>
                        <Button variant="outline" size="lg" onClick={handleWhatsAppOrder} className="w-full">
                            <Icons.whatsapp className="mr-2 h-5 w-5"/> Commander sur WhatsApp
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-12 lg:col-span-9 lg:col-start-4">
        {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-xl mb-4">Fiche Technique</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableBody>
                    {Object.entries(product.specs).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium text-muted-foreground w-1/3">{key}</TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
           <div className='mt-12'>
            <ReviewsSection 
              product={product} 
              reviews={reviews} 
              averageRating={averageRating} 
              reviewCount={reviewCount}
            />
          </div>
      </div>
      
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16">
          <ProductGrid 
            title="Produits similaires"
            products={relatedProducts}
            gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          />
        </div>
      )}
      <div className="lg:hidden mt-8">
        <ProductInfoSidebar />
      </div>
    </div>
  );
}
