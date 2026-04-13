import React from 'react';

export default function Loading() {
  return (
    <div className="w-full flex-1 max-w-4xl">
      <div className="h-[42px] w-[200px] rounded-lg animate-shimmer mb-2"></div>
      <div className="h-[20px] w-[350px] rounded-md animate-shimmer mb-[32px]"></div>

      <div className="bg-white border border-[#e8edf5] rounded-[16px] p-[24px]">
        <div className="flex items-center justify-between mb-[24px] pb-[16px] border-b border-[#f1f5f9]">
           <div className="w-32 h-6 rounded animate-shimmer"></div>
           <div className="w-24 h-6 rounded-full animate-shimmer"></div>
        </div>

        <div className="flex flex-col gap-[16px]">
           {[1, 2, 3].map(i => (
             <div key={i} className="h-[76px] w-full border border-[#e8edf5] rounded-[12px] animate-shimmer"></div>
           ))}
        </div>
      </div>
    </div>
  )
}
