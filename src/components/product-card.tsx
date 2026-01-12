
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
    <div className="flex flex-col h-full overflow-hidden transition-all duration-300 group bg-card border rounded-lg hover:shadow-md">
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="aspect-square relative w-full bg-card">
            <Image
              src={product.images[0].imageUrl}
              alt={product.title}
              data-ai-hint={product.images[0].imageHint}
              fill
              className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-card/60 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground"
            onClick={handleAddToCart}
          >
            <Icons.plusCircle className="h-5 w-5" />
          </Button>
        </div>
        {product.isNew && (
            <div className="absolute top-2 left-2">
                <div className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">NOUVEAU</div>
            </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-semibold text-base leading-snug">
            <Link href={`/products/${product.slug}`}>{product.title}</Link>
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400"/>
            <span className="font-semibold text-sm text-foreground">4.9</span>
            {soldCount !== null && <span className="text-gray-400">({soldCount} avis)</span>}
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
        </div>
      </div>
    </div>
  );
}
