
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Price } from "./price";
import { ShoppingCart, Heart } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  const isRecent = new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const showNewBadge = product.isNew || isRecent;
  const hasSale = product.salePrice && product.salePrice < product.price;
  const salePercentage = hasSale ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;


  if (variant === 'horizontal') {
    return (
      <Card className="w-full shadow-sm bg-transparent border-0">
        <Link href={`/products/${product.slug}`} className="flex items-center gap-4 group p-0">
          <div className="relative shrink-0">
              <div className="aspect-square relative w-24 bg-card rounded-md border">
                <Image
                  src={product.images[0].imageUrl}
                  alt={product.title}
                  data-ai-hint={product.images[0].imageHint}
                  fill
                  className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base leading-snug line-clamp-2">
              {product.title}
            </h3>
            <div className="mt-2">
              <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
            </div>
             <Button size="sm" onClick={handleAddToCart} className="mt-4">
              Ajouter
            </Button>
          </div>
        </Link>
      </Card>
    )
  }

  return (
    <div className="relative group flex flex-col transition-all duration-300 h-full">
      <div className="relative w-full rounded-lg overflow-hidden aspect-square bg-secondary">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
            <Image
                src={product.images[0].imageUrl}
                alt={product.title}
                data-ai-hint={product.images[0].imageHint}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
        </Link>
        <div className="absolute top-3 left-3 flex flex-col gap-1">
            {showNewBadge && (
                <Badge className="bg-white text-black hover:bg-white text-xs px-2 py-0.5 rounded-full shadow-md">New</Badge>
            )}
            {hasSale && (
                <Badge className="bg-white text-black hover:bg-white text-xs px-2 py-0.5 rounded-full shadow-md">-{salePercentage}%</Badge>
            )}
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="rounded-full h-8 w-8">
                <Heart className="h-4 w-4" />
            </Button>
        </div>
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button onClick={handleAddToCart} variant="default" className="w-full">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Ajouter au panier
          </Button>
        </div>
      </div>
      <div className="pt-4 text-center">
        <h3 className="font-medium text-foreground text-sm leading-tight h-5 mt-1">
          <Link href={`/products/${product.slug}`}>{product.title}</Link>
        </h3>
        <div className="mt-2 flex justify-center">
           <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
        </div>
      </div>
    </div>
  );
}
