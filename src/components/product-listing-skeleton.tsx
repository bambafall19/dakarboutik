
import { Skeleton } from "@/components/ui/skeleton";

export function ProductListingSkeleton() {
  return (
    <div className="container py-4 md:py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Rail de filtres */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24 space-y-5 rounded-3xl border border-border/60 bg-card/70 p-5">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
            <div className="space-y-3 border-t border-border/60 pt-5">
              <Skeleton className="h-4 w-28" />
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-2xl" />
              ))}
            </div>
            <div className="space-y-3 border-t border-border/60 pt-5">
              <Skeleton className="h-4 w-20" />
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </aside>

        {/* Résultats */}
        <main className="lg:col-span-9">
          {/* En-tête éditorial */}
          <Skeleton className="h-[230px] w-full rounded-3xl md:h-[310px]" />

          {/* Barre de résultats */}
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-border/70 bg-card px-4 py-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-11 w-[210px] rounded-full" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
