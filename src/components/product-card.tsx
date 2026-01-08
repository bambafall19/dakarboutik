"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Price } from "./price";
import { Icons } from "./icons";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="p-0 border-b relative">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="aspect-[4/3] relative w-full">
            <Image
              src={product.images[0].imageUrl}
              alt={product.title}
              data-ai-hint={product.images[0].imageHint}
              fill
              className="object-cover"
            />
          </div>
        </Link>
        <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.salePrice && <Badge variant="destructive">Promo</Badge>}
            {product.isNew && <Badge>Nouveau</Badge>}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{product.brand}</span>
            <h3 className="font-semibold text-md leading-snug">
            <Link href={`/products/${product.slug}`}>{product.title}</Link>
            </h3>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex-col items-start gap-4">
        <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
        <Button onClick={handleAddToCart} className="w-full" disabled={product.stock === 0}>
            {product.stock > 0 ? <> <Icons.logo className="mr-2 h-4 w-4"/> Ajouter au panier </>: 'Épuisé'}
        </Button>
      </CardFooter>
    </Card>
  );
}
