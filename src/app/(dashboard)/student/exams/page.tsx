"use client";

import React from "react";

export default function ExamsQuizzesPage() {
  const history = [
    { title: "Introduction to User Interfaces", date: "Oct 12, 2026", score: 95, gp: 4.0, attempts: 1, status: "Passed" },
    { title: "Typography Layouts & Grids", date: "Oct 14, 2026", score: 65, gp: 2.0, attempts: 2, status: "Retake" },
    { title: "Color Theory & Contrast", date: "Oct 18, 2026", score: 88, gp: 3.5, attempts: 1, status: "Passed" }
  ];

  return (
    <div className="w-full flex-1">
      <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] mb-[4px] leading-tight">Exams & Quizzes</h1>
      <p className="font-sans font-normal text-[15px] text-[#6b7280] mb-[32px]">Your quiz history and grade points across all lessons.</p>

      {/* Summary Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] mb-[40px]">
          <div className="bg-white border border-[#e8edf5] rounded-[16px] p-[24px] flex flex-col justify-center transition-all duration-200 hover:translate-y-[-2px]" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,23,42,0.10)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.05)"}
          >
             <span className="font-sans font-medium text-[13px] text-[#6b7280] mb-2">Cumulative Grade Point</span>
             <span className="font-heading font-extrabold text-[36px] text-[#0f4ff1] leading-none">3.4</span>
          </div>
          <div className="bg-white border border-[#e8edf5] rounded-[16px] p-[24px] flex flex-col justify-center transition-all duration-200 hover:translate-y-[-2px]" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,23,42,0.10)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.05)"}
          >
             <span className="font-sans font-medium text-[13px] text-[#6b7280] mb-2">Quizzes Taken</span>
             <span className="font-heading font-extrabold text-[36px] text-[#0f172a] leading-none">8</span>
          </div>
          <div className="bg-white border border-[#e8edf5] rounded-[16px] p-[24px] flex flex-col justify-center transition-all duration-200 hover:translate-y-[-2px]" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,23,42,0.10)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.05)"}
          >
             <span className="font-sans font-medium text-[13px] text-[#6b7280] mb-2">Best Score</span>
             <span className="font-heading font-extrabold text-[36px] text-[#16a34a] leading-none">95<span className="text-[20px]">%</span></span>
          </div>
      </div>

      {/* History Table */}
      <h3 className="font-heading font-bold text-[18px] text-[#0f172a] mb-[16px]">Quiz History</h3>
      
      <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#e8edf5] scrollbar-track-transparent">
        <div className="bg-white rounded-[16px] min-w-[800px] border border-[#f1f5f9] overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.03)" }}>
           <div className="grid grid-cols-12 gap-4 px-[24px] py-[16px] bg-[#fdfefe] border-b border-[#f1f5f9]">
              <div className="col-span-4 font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-[0.06em]">Lesson Title</div>
              <div className="col-span-2 font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-[0.06em]">Quiz Date</div>
              <div className="col-span-1 font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-[0.06em]">Score</div>
              <div className="col-span-2 font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-[0.06em]">GP</div>
              <div className="col-span-1 font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-[0.06em]">Attempts</div>
              <div className="col-span-2 font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-[0.06em] text-right">Status</div>
           </div>

           {history.map((q, i) => (
             <div key={i} className="grid grid-cols-12 gap-4 px-[24px] py-[20px] items-center border-b border-[#f1f5f9] last:border-0 hover:bg-[#fafafc] transition-colors">
                <div className="col-span-4 font-heading font-semibold text-[15px] text-[#0f172a]">{q.title}</div>
                <div className="col-span-2 font-sans font-normal text-[14px] text-[#6b7280]">{q.date}</div>
                <div className="col-span-1">
                   <span className={`font-heading font-semibold text-[15px] ${q.score >= 75 ? "text-[#16a34a]" : q.score >= 60 ? "text-[#a16207]" : "text-[#dc2626]"}`}>
                     {q.score}%
                   </span>
                </div>
                <div className="col-span-2 font-sans font-medium text-[14px] text-[#0f172a]">{q.gp.toFixed(1)}</div>
                <div className="col-span-1 font-sans font-normal text-[14px] text-[#6b7280] text-center pr-4">{q.attempts}</div>
                
                <div className="col-span-2 flex justify-end">
                   {q.status === "Passed" ? (
                     <span className="font-heading font-semibold text-[14px] text-[#16a34a] py-1.5 border border-transparent">Passed</span>
                   ) : (
                     <button className="h-[32px] px-[16px] border border-[#0f4ff1] text-[#0f4ff1] rounded-[10px] font-heading font-semibold text-[13px] hover:bg-[#eff4fe] transition-colors cursor-pointer">
                       Retake
                     </button>
                   )}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
