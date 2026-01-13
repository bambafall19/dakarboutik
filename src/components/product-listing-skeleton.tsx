
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "./ui/card";

export function ProductListingSkeleton() {
  return (
    <div className="py-2">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block lg:col-span-1">
            <Card>
                <CardContent className="pt-6 space-y-8">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                     <div className="space-y-4">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </CardContent>
            </Card>
        </aside>
        <main className="lg:col-span-3">
          <Skeleton className="h-80 w-full mb-8" />
          <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-48" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
