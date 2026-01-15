
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Price } from "./price";
import { MoreVertical, ShoppingBag } from "lucide-react";
import { Card } from "./ui/card";
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
  
  const isRecent = new Date(product.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
  const showNewBadge = product.isNew || isRecent;

  if (variant === 'horizontal') {
    return (
      <Card className="w-full shadow-sm">
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
    <Card className="relative group flex flex-col rounded-lg overflow-hidden transition-all duration-300 h-full shadow-sm">
      <Link href={`/products/${product.slug}`} className="block">
        {showNewBadge && (
            <Badge className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs px-1.5 py-0.5">NOUVEAU</Badge>
        )}
        {!showNewBadge && product.isBestseller && (
            <Badge className="absolute top-2 left-2 z-10 text-xs px-1.5 py-0.5" variant="secondary">TOP VENTE</Badge>
        )}
        <div className="relative w-full rounded-t-lg overflow-hidden aspect-[4/5]">
            <Image
                src={product.images[0].imageUrl}
                alt={product.title}
                data-ai-hint={product.images[0].imageHint}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300 p-2"
            />
        </div>
      </Link>
      <div className="p-4 text-center flex-1 flex flex-col">
        <div className="mt-2">
           <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
        </div>
        <h3 className="font-medium text-foreground text-sm leading-tight h-10 line-clamp-2 mt-1">
          <Link href={`/products/${product.slug}`}>{product.title}</Link>
        </h3>
        
      </div>
      <div className="absolute bottom-16 right-4 z-10">
          <Button onClick={handleAddToCart} size="icon" className="rounded-full h-12 w-12 shadow-lg">
            <ShoppingBag className="h-6 w-6" />
            <span className="sr-only">Ajouter au panier</span>
          </Button>
        </div>
    </Card>
  );
}
