"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Price } from "./price";
import { HeartIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addToCart(product, 1);
  };
  
  const stockProgress = (product.stock / 100) * 100;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-300 hover:shadow-lg border-none rounded-lg bg-card group">
        <div className="relative overflow-hidden rounded-lg">
            <Link href={`/products/${product.slug}`} className="block">
                <div className="aspect-square relative w-full bg-muted rounded-lg">
                    <Image
                    src={product.images[0].imageUrl}
                    alt={product.title}
                    data-ai-hint={product.images[0].imageHint}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </Link>
            <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.salePrice && <Badge variant="destructive" className="rounded-sm">PROMO</Badge>}
                {product.isNew && <Badge className="rounded-sm">NOUVEAU</Badge>}
            </div>
            <div className="absolute top-3 right-3">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/80 hover:bg-white">
                    <HeartIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex-1">
                <span className="text-xs text-muted-foreground">{product.brand}</span>
                <h3 className="font-semibold text-sm leading-snug mt-1">
                    <Link href={`/products/${product.slug}`}>{product.title}</Link>
                </h3>
            </div>
            <div className="mt-4">
                <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
                 {product.salePrice && (
                    <div className="mt-2">
                        <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                            <span>{product.stock > 0 ? `${100 - product.stock} vendus` : 'Épuisé'}</span>
                            <span>{`Reste ${product.stock}`}</span>
                        </div>
                        <Progress value={stockProgress} className="h-1.5" />
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
