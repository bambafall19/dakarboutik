
import { cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  salePrice?: number;
  currency: 'XOF';
  className?: string;
}

export function Price({ price, salePrice, currency, className }: PriceProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const hasSale = typeof salePrice === 'number' && salePrice > 0;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      {hasSale ? (
        <>
          <span className="font-bold text-lg text-red-600">
            {formatPrice(salePrice)} {currency}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(price)} {currency}
          </span>
        </>
      ) : (
        <span className="font-bold text-lg">
          {formatPrice(price)} {currency}
        </span>
      )}
    </div>
  );
}
