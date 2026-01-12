
import { Skeleton } from "@/components/ui/skeleton";

export function ProductListingSkeleton() {
  return (
    <div className="py-8">
      <Skeleton className="h-6 w-1/3 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        <aside className="hidden md:block md:col-span-1 space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </aside>
        <main>
          <div className="flex justify-between items-center mb-4">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
            <Skeleton className="h-10 w-24 md:hidden" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
