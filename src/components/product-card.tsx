
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Price } from "./price";
import { Heart } from "lucide-react";
import { Icons } from "./icons";
import { Card, CardContent } from "./ui/card";
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
    <div className="relative group flex flex-col rounded-lg overflow-hidden transition-all duration-300">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="absolute top-3 right-3 z-10">
            <Button size="icon" variant="ghost" className="rounded-full bg-black/10 hover:bg-black/30 border-none text-white h-9 w-9">
                <Heart className="h-5 w-5" />
            </Button>
        </div>
        <div className="relative h-60 w-full bg-muted p-4">
            <div className="relative h-full w-full">
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
      <div className="bg-card p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-xl leading-tight">
          <Link href={`/products/${product.slug}`}>{product.title}</Link>
        </h3>
        <p className="text-muted-foreground text-sm mt-2 line-clamp-2 flex-1">
            {product.description}
        </p>
        
        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-xs text-muted-foreground">PRIX</span>
             <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
          </div>
          <Button size="default" onClick={handleAddToCart} className="shrink-0">
            Ajouter au panier
          </Button>
        </div>
      </div>
    </div>
  );
}
