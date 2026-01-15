
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
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  const isRecent = new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const showNewBadge = product.isNew || isRecent;
  const hasSale = product.salePrice && product.salePrice < product.price;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative group">
          <div className="aspect-square relative w-full bg-secondary">
            <Image
              src={product.images[0].imageUrl}
              alt={product.title}
              data-ai-hint={product.images[0].imageHint}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform"
            />
          </div>
          {showNewBadge && (
            <Badge className="absolute top-2 left-2 bg-red-600 text-white border-red-600">NOUVEAU</Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4 flex-1 flex flex-col">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-semibold text-sm leading-snug truncate h-10 flex items-center">
            {product.title}
          </h3>
        </Link>
        <div className="mt-auto pt-4 flex justify-between items-center">
           <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
           <Button size="icon" className="h-8 w-8 rounded-full" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
