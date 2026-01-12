
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4 flex-1 flex flex-col">
        <Skeleton className="h-4 w-4/5 mt-1" />
        <Skeleton className="h-3 w-1/2 mt-2" />
        <div className="mt-auto pt-4">
          <Skeleton className="h-5 w-1/3" />
        </div>
      </CardContent>
    </Card>
  );
}
