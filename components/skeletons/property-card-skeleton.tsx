import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-border shadow-md">
      <Skeleton className="h-60 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-[52px] w-full rounded-none" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 flex-1 rounded-md" />
        </div>
      </div>
    </Card>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
