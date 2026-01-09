
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Price } from "./price";
import { HeartIcon, ShoppingCart, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Icons } from "./icons";

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addToCart } = useCart();
  const [soldCount, setSoldCount] = useState<number | null>(null);

  useEffect(() => {
    // This runs only on the client, after hydration
    setSoldCount(Math.floor(Math.random() * 500) + 50);
  }, []);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addToCart(product, 1);
  };
  
  const stockSold = 10;
  const stockProgress = (stockSold / (product.stock + stockSold)) * 100;

  if (variant === 'horizontal') {
    return (
      <div className="flex items-center gap-4 group">
        <div className="relative shrink-0">
          <Link href={`/products/${product.slug}`} className="block">
            <div className="aspect-square relative w-24 bg-card rounded-lg border">
              <Image
                src={product.images[0].imageUrl}
                alt={product.title}
                data-ai-hint={product.images[0].imageHint}
                fill
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm leading-snug">
            <Link href={`/products/${product.slug}`}>{product.title}</Link>
          </h3>
          <div className="mt-2">
            <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden transition-shadow duration-300 group bg-card border rounded-lg">
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="aspect-square relative w-full bg-card">
            <Image
              src={product.images[0].imageUrl}
              alt={product.title}
              data-ai-hint={product.images[0].imageHint}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/80 hover:bg-white">
            <HeartIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)]">
          <Button
            className="w-full h-9 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={handleAddToCart}
            variant="secondary"
          >
            <Icons.shoppingBag className="mr-2 h-4 w-4" />
            Ajouter au panier
          </Button>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col border-t">
        <div className="flex-1">
          <h3 className="font-semibold text-sm leading-snug mt-1">
            <Link href={`/products/${product.slug}`}>{product.title}</Link>
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/>
            <span>4.9</span>
            <span>|</span>
            {soldCount !== null && <span>{soldCount}+ Sold</span>}
          </div>
        </div>
        <div className="mt-4">
          <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
          {product.salePrice && (
            <div className="mt-2">
              <Progress value={stockProgress} className="h-1" />
              <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                <span>{stockSold} / {product.stock + stockSold} Sold</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
