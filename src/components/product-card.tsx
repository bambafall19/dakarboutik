
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Price } from "./price";
import { Heart, ShoppingCart, Star } from "lucide-react";
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
    <div className="flex flex-col h-full overflow-hidden transition-all duration-300 group bg-card border rounded-lg hover:shadow-lg">
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
        <div className="absolute top-2 right-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-card/60 backdrop-blur-sm hover:bg-card">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400"/>
            <span className="font-semibold">4.9</span>
            {soldCount !== null && <span className="text-gray-400">({soldCount})</span>}
          </div>
          <h3 className="font-semibold text-sm leading-snug mt-1">
            <Link href={`/products/${product.slug}`}>{product.title}</Link>
          </h3>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
          <Button
            size="sm"
            className="h-9 text-sm group-hover:bg-primary group-hover:text-primary-foreground"
            onClick={handleAddToCart}
            variant="outline"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>
    </div>
  );
}
