import React from 'react';

export default function Loading() {
  return (
    <div className="w-full flex-1">
      <div className="mb-[32px]">
        <div className="h-[38px] w-[200px] rounded-lg animate-shimmer mb-2"></div>
        <div className="h-[20px] w-[350px] rounded-md animate-shimmer"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] w-full pb-10">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white border border-[#e8edf5] rounded-[16px] overflow-hidden flex flex-col h-[380px]">
             {/* Thumbnail skeleton */}
             <div className="w-full h-[180px] animate-shimmer shrink-0 border-b border-[#e8edf5]"></div>
             
             {/* Text skeleton */}
             <div className="p-[20px] flex flex-col flex-1">
                <div className="flex justify-between mb-4">
                  <div className="h-[22px] w-[80px] rounded-full animate-shimmer"></div>
                  <div className="h-[18px] w-[40px] rounded-md animate-shimmer"></div>
                </div>
                
                <div className="h-[24px] w-[80%] rounded-md animate-shimmer mb-3 mt-1"></div>
                <div className="h-[18px] w-full rounded-md animate-shimmer mb-1"></div>
                <div className="h-[18px] w-[60%] rounded-md animate-shimmer mb-4"></div>
                
                <div className="w-full border-t border-[#f1f5f9] mt-auto mb-[14px]"></div>
                
                <div className="flex justify-between items-center h-[26px]">
                  <div className="h-[20px] w-[70px] rounded-full animate-shimmer"></div>
                  <div className="h-[18px] w-[50px] rounded-md animate-shimmer"></div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
