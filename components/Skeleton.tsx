"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-white/[0.06] rounded-lg ${className}`} />
  );
}

export function SongCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-3 sm:p-4">
      <Skeleton className="w-full aspect-square rounded-lg mb-3" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function SongRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Skeleton className="w-8 h-4" />
      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-2/3 mb-1.5" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-3 w-10" />
    </div>
  );
}

export function SectionSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div>
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <SongCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
