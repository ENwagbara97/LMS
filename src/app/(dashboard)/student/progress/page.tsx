import React from "react";

export default function ProgressPage() {
  const lessons = [
    { num: 1, title: "Introduction to User Interfaces", percent: 100, score: 95, status: "Completed" },
    { num: 2, title: "Typography Layouts & Grids", percent: 85, score: null, status: "In Progress" },
    { num: 3, title: "Color Theory & Contrast", percent: 0, score: null, status: "Locked" },
    { num: 4, title: "Advanced Prototyping", percent: 0, score: null, status: "Locked" },
  ];

  return (
    <div className="w-full flex-1">
      <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] mb-[32px]">My Progress</h1>

      {/* Progress Card Overview */}
      <div className="bg-white border border-[#e8edf5] rounded-[16px] w-full flex flex-col md:flex-row p-[32px] gap-[48px] items-center mb-[40px]" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
         
         {/* SVG Donut */}
         <div className="relative w-[120px] h-[120px] shrink-0">
           <svg viewBox="0 0 100 100" className="rotate-[-90deg]">
             {/* Track */}
             <circle cx="50" cy="50" r="44" fill="transparent" stroke="#eff4fe" strokeWidth="12" />
             {/* Fill (simulating 60%) */}
             <circle cx="50" cy="50" r="44" fill="transparent" stroke="#0f4ff1" strokeWidth="12" strokeDasharray="276" strokeDashoffset="110" strokeLinecap="round" />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="font-heading font-extrabold text-[28px] text-[#0f172a] leading-none mt-1">60<span className="text-[16px]">%</span></span>
           </div>
         </div>

         {/* Stats Row */}
         <div className="flex-1 flex flex-col w-full">
            <h2 className="font-heading font-bold text-[24px] text-[#0f172a] mb-6">UI Design Fundamentals</h2>
            
            <div className="flex items-center justify-between w-full">
               <div className="flex flex-col">
                 <span className="font-sans font-medium text-[13px] text-[#6b7280] mb-1">Lessons Completed</span>
                 <span className="font-heading font-bold text-[22px] text-[#0f172a]">8 <span className="text-[#9ca3af] text-[18px]">/ 12</span></span>
               </div>
               
               <div className="w-[1px] h-10 bg-[#e8edf5]"></div>
               
               <div className="flex flex-col">
                 <span className="font-sans font-medium text-[13px] text-[#6b7280] mb-1">Grade Point Avg</span>
                 <span className="font-heading font-bold text-[22px] text-[#16a34a]">92%</span>
               </div>
               
               <div className="w-[1px] h-10 bg-[#e8edf5] hidden md:block"></div>
               
               <div className="hidden md:flex flex-col">
                 <span className="font-sans font-medium text-[13px] text-[#6b7280] mb-1">Days Active</span>
                 <span className="font-heading font-bold text-[22px] text-[#0f172a]">4</span>
               </div>
            </div>
         </div>
      </div>

      {/* Breakdown Table Header */}
      <h3 className="font-heading font-bold text-[18px] text-[#0f172a] mb-[16px]">Lesson Breakdown</h3>
      
      {/* Table Container */}
      <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#e8edf5] scrollbar-track-transparent">
        <div className="bg-white rounded-[16px] min-w-[850px] border border-[#f1f5f9] overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.03)" }}>
           <div className="grid grid-cols-12 gap-4 px-[24px] py-[16px] bg-[#fdfefe] border-b border-[#f1f5f9]">
              <div className="col-span-1 font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-[0.06em]">#</div>
              <div className="col-span-5 font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-[0.06em]">Lesson Title</div>
              <div className="col-span-3 font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-[0.06em]">Watch Progress</div>
              <div className="col-span-1 font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-[0.06em]">Quiz</div>
              <div className="col-span-2 font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-[0.06em] text-right">Status</div>
           </div>

           {lessons.map((les, i) => (
             <div key={i} className="grid grid-cols-12 gap-4 px-[24px] py-[20px] items-center border-b border-[#f1f5f9] last:border-0 hover:bg-[#fafafc] transition-colors">
                <div className="col-span-1 font-sans font-medium text-[14px] text-[#6b7280]">0{les.num}</div>
                <div className="col-span-5 font-heading font-semibold text-[15px] text-[#0f172a]">{les.title}</div>
                <div className="col-span-3 flex items-center pr-8">
                   <div className="w-full h-[6px] bg-[#f1f5f9] rounded-full mr-3">
                      <div className="h-full bg-[#0f4ff1] rounded-full" style={{ width: `${les.percent}%` }}></div>
                   </div>
                   <span className="font-sans font-medium text-[12px] text-[#6b7280] w-[32px] text-right">{les.percent}%</span>
                </div>
                <div className="col-span-1">
                  {les.score ? (
                     <span className="font-heading font-semibold text-[15px] text-[#16a34a]">{les.score}%</span>
                  ) : (
                     <span className="font-sans font-medium text-[14px] text-[#d1d5db]">-</span>
                  )}
                </div>
                <div className="col-span-2 flex justify-end">
                   {les.status === "Completed" && <span className="bg-[#ecfdf5] text-[#16a34a] font-sans font-semibold text-[11px] uppercase tracking-[0.06em] px-3 py-1 rounded-full">Completed</span>}
                   {les.status === "In Progress" && <span className="bg-[#eff4fe] text-[#0f4ff1] font-sans font-semibold text-[11px] uppercase tracking-[0.06em] px-3 py-1 rounded-full">In Progress</span>}
                   {les.status === "Locked" && <span className="bg-[#f1f5f9] text-[#6b7280] font-sans font-semibold text-[11px] uppercase tracking-[0.06em] px-3 py-1 rounded-full">Locked</span>}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
