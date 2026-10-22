
import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailsSkeleton() {
  return (
    <div className="container pb-[calc(9rem+env(safe-area-inset-bottom))] pt-4 md:pb-16 md:pt-8">
      <Skeleton className="mb-6 h-5 w-1/2" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        {/* Galerie */}
        <div className="lg:col-span-7">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="mt-4 grid grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="mt-4 h-16 w-full rounded-2xl" />
        </div>

        {/* Informations */}
        <div className="lg:col-span-5">
          <div className="space-y-5 rounded-3xl border border-border/70 bg-card/80 p-5 md:p-7">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-16 rounded-full" />
              <Skeleton className="h-10 w-16 rounded-full" />
              <Skeleton className="h-10 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-32 rounded-full" />
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-12 flex-1 rounded-full" />
            </div>
            <Skeleton className="h-12 w-full rounded-full" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 md:mt-14">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:mt-14 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-3xl" />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
    </div>
  );
}
