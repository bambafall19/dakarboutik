
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Price } from "./price";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Icons } from "./icons";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addToCart } = useCart();
  const [soldCount, setSoldCount] = useState<number | null>(null);

  useEffect(() => {
    // This should be based on real data, but for now, we'll simulate it.
    // We use a simple calculation based on product ID to make it consistent across renders.
    if (product && product.id) {
        const charCodeSum = product.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        setSoldCount((charCodeSum % 200) + 50); // Random-like but deterministic
    }
  }, [product]);

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
          {product.brand && (
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          )}
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
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group bg-card rounded-lg border shadow-sm hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden p-0">
            <div className="aspect-square relative w-full bg-secondary/30">
              <Image
                src={product.images[0].imageUrl}
                alt={product.title}
                data-ai-hint={product.images[0].imageHint}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            {product.salePrice && (
                 <Badge className="absolute top-2 left-2" variant="destructive">PROMO</Badge>
            )}
        </div>
      </Link>
      <CardContent className="p-4 flex-1 flex flex-col">
        {product.brand && (
            <p className="text-sm text-muted-foreground">{product.brand}</p>
        )}
        <h3 className="font-semibold text-lg leading-tight flex-1">
          <Link href={`/products/${product.slug}`}>{product.title}</Link>
        </h3>
        <div className="mt-4">
          <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
        </div>
      </CardContent>
    </Card>
  );
}
