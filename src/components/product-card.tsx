
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

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addToCart } = useCart();
  const [rating, setRating] = useState({ score: 0, reviews: 0 });

  useEffect(() => {
    // This should be based on real data, but for now, we'll simulate it.
    if (product && product.id) {
        const charCodeSum = product.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const score = 4 + (charCodeSum % 10) / 10; // score between 4.0 and 4.9
        const reviews = 10 + (charCodeSum % 150);
        setRating({ score: parseFloat(score.toFixed(1)), reviews });
    }
  }, [product]);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  if (variant === 'horizontal') {
    return (
      <Link href={`/products/${product.slug}`} className="flex items-center gap-4 group p-2 -m-2 rounded-lg hover:bg-accent">
        <div className="relative shrink-0">
            <div className="aspect-square relative w-16 bg-card rounded-md border">
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
          <h3 className="font-semibold text-sm leading-snug line-clamp-2">
            {product.title}
          </h3>
          <div className="mt-1">
            <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group bg-card rounded-lg border shadow-sm hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden p-4">
            <div className="aspect-square relative w-full">
              <Image
                src={product.images[0].imageUrl}
                alt={product.title}
                data-ai-hint={product.images[0].imageHint}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
        </div>
      </Link>
      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        {product.brand && <span className="text-xs text-muted-foreground uppercase font-semibold">{product.brand}</span>}
        <h3 className="font-semibold text-lg leading-tight flex-1">
          <Link href={`/products/${product.slug}`}>{product.title}</Link>
        </h3>
        
        <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("h-4 w-4", i < Math.floor(rating.score) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50")} />
                ))}
            </div>
            <span className="text-xs font-bold px-2 py-0.5 bg-muted rounded-full">{rating.score}</span>
        </div>
        
        <div className="mt-4 flex flex-1 flex items-end justify-between">
          <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
          <Button size="sm" onClick={handleAddToCart} className="shrink-0">
            <Icons.shoppingBag className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
