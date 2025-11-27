import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: boolean;
}

export function Skeleton({ className = '', height = 'h-4', width = 'w-full', rounded = true }: SkeletonLoaderProps) {
  return (
    <div
      className={`bg-gray-200 animate-pulse ${height} ${width} ${rounded ? 'rounded' : ''} ${className}`}
    />
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton height="h-4" width="w-24" className="mb-2" />
          <Skeleton height="h-8" width="w-16" className="mb-2" />
          <Skeleton height="h-3" width="w-32" />
        </div>
        <Skeleton height="h-12" width="w-12" className="rounded-lg" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Skeleton height="h-6" width="w-48" className="mb-4" />
      <div className="h-64 flex items-end justify-between gap-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <Skeleton 
              height="h-full" 
              width="w-full" 
              className="rounded-t"
              rounded={false}
            />
            <Skeleton height="h-4" width="w-8" className="mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <Skeleton height="h-6" width="w-48" className="mb-2" />
          <Skeleton height="h-4" width="w-64" />
        </div>
        <Skeleton height="h-12" width="w-12" className="rounded-lg" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center">
            <Skeleton height="h-8" width="w-16" className="mx-auto mb-2" />
            <Skeleton height="h-4" width="w-20" className="mx-auto" />
          </div>
        ))}
      </div>
      
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton height="h-4" width="w-32" />
            <Skeleton height="h-4" width="w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}


