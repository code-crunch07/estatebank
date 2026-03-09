import { Skeleton } from "@/components/ui/skeleton";

export function HeroSliderSkeleton() {
  return (
    <div className="w-full h-[60vh] md:h-[80vh] relative overflow-hidden">
      {/* Main Image Skeleton */}
      <Skeleton className="w-full h-full rounded-none" />
      
      {/* Navigation Dots Skeleton */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-2 w-8 rounded-full" />
        ))}
      </div>

      {/* Content Overlay Skeleton */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <Skeleton className="h-12 w-48 mx-auto rounded-full" />
        </div>
      </div>
    </div>
  );
}
