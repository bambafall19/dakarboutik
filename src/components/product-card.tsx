
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Price } from "./price";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "./ui/card";
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

  if (variant === 'horizontal') {
    return (
      <Card className="overflow-hidden transition-all duration-300 group rounded-lg">
          <Link href={`/products/${product.slug}`} className="flex gap-4 items-center">
            <div className="relative aspect-square w-24 h-24 flex-shrink-0 bg-secondary/30">
                <Image
                    src={product.images[0].imageUrl}
                    alt={product.title}
                    data-ai-hint={product.images[0].imageHint}
                    fill
                    className="object-contain p-2"
                />
            </div>
            <div className="flex-1 p-2">
                <h3 className="font-semibold text-sm leading-snug">
                    {product.title}
                </h3>
                <div className="mt-2">
                    <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
                </div>
            </div>
          </Link>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group rounded-lg">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-t-lg">
          <div className="aspect-square relative w-full bg-secondary/30">
            <Image
              src={product.images[0].imageUrl}
              alt={product.title}
              data-ai-hint={product.images[0].imageHint}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          {showNewBadge && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground border-primary hover:bg-primary">NOUVEAU</Badge>
          )}
           {hasSale && (
            <Badge variant="destructive" className="absolute top-2 right-2">PROMO</Badge>
          )}
           <Button size="icon" className="absolute bottom-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </Link>
      <CardContent className="p-2 md:p-3 flex-1 flex flex-col">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-semibold text-xs md:text-sm leading-snug truncate h-10 flex items-center">
            {product.title}
          </h3>
        </Link>
        <div className="mt-auto pt-1">
           <Price price={product.price} salePrice={product.salePrice} currency={product.currency} className="text-sm" />
        </div>
      </CardContent>
    </Card>
  );
}
