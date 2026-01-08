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
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={cn("flex items-end gap-2 font-semibold", className)}>
      <span className={cn(
        "text-foreground",
        salePrice ? "text-muted-foreground line-through text-sm font-normal" : "text-lg"
      )}>
        {formatPrice(price)}
      </span>
      {salePrice && (
        <span className="text-primary text-lg">
          {formatPrice(salePrice)}
        </span>
      )}
    </div>
  );
}
