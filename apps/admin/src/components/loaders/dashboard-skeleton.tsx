"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  const gridCols = {
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
  }[count] || "lg:grid-cols-4";

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border bg-card/50">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full rounded-xl border border-border bg-card overflow-hidden">
      {/* Header bar skeleton */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-48 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      {/* Table grid skeleton */}
      <div className="p-4 space-y-4">
        {/* Table header row */}
        <div className="flex items-center gap-4 pb-2 border-b border-border">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {/* Table body rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 py-2 border-b border-border/50 last:border-0">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 space-y-1">
                <Skeleton className="h-4 w-[85%]" />
                {colIndex === 0 && <Skeleton className="h-3 w-[50%]" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailViewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-9 w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-3.5 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-5 space-y-4">
              <Skeleton className="h-5 w-36" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="border-border">
            <CardContent className="p-5 space-y-4">
              <Skeleton className="h-5 w-28" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-[60%]" />
                  <Skeleton className="h-3 w-[40%]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
