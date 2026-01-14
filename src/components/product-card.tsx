
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
import { Badge } from "./ui/badge";

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
      <Card className="w-full">
        <Link href={`/products/${product.slug}`} className="flex items-center gap-4 group p-4">
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
    <div className="relative group flex flex-col rounded-lg overflow-hidden transition-all duration-300 border bg-card shadow-sm h-full">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="absolute top-2 right-2 z-10">
            <Button size="icon" variant="ghost" className="rounded-full bg-black/10 hover:bg-black/30 border-none text-white h-8 w-8">
                <Heart className="h-4 w-4" />
            </Button>
        </div>
        {product.isNew && (
            <Badge className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs px-1.5 py-0.5">NOUVEAU</Badge>
        )}
        {!product.isNew && product.isBestseller && (
            <Badge className="absolute top-2 left-2 z-10 text-xs px-1.5 py-0.5" variant="secondary">TOP VENTE</Badge>
        )}
        <div className="relative h-32 sm:h-48 w-full bg-muted/30 p-2">
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
      <div className="p-2 sm:p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2 flex-grow">
          <Link href={`/products/${product.slug}`}>{product.title}</Link>
        </h3>
        
        <div className="mt-auto pt-2 sm:pt-4">
           <div>
            <span className="text-xs text-muted-foreground">PRIX</span>
             <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
          </div>
          <Button size="sm" onClick={handleAddToCart} className="shrink-0 w-full mt-2 h-9 text-sm">
            Ajouter
          </Button>
        </div>
      </div>
    </div>
  );
}
