import React from 'react';

export default function Loading() {
  return (
    <div className="w-full flex-1">
      {/* Hero Banner Skeleton */}
      <div className="w-full h-[200px] rounded-[20px] animate-shimmer mb-[32px]"></div>
      
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] w-full mb-[32px]">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-[88px] rounded-[14px] bg-white border border-[#e8edf5] p-6 flex flex-col gap-2">
             <div className="w-10 h-10 rounded-[12px] animate-shimmer mb-1"></div>
             <div className="h-4 w-[60%] animate-shimmer"></div>
             <div className="h-6 w-[40%] animate-shimmer"></div>
          </div>
        ))}
      </div>

      {/* Section Title Skeleton */}
      <div className="h-6 w-[200px] animate-shimmer mb-[16px]"></div>

      {/* Jump Back In Skeleton */}
      <div className="w-full h-[160px] rounded-[16px] animate-shimmer"></div>
    </div>
  )
}
