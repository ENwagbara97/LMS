"use client";

import React, { useEffect, useState } from "react";
import { PlayCircle, BookOpen, Clock, Award, Play, ChevronRight } from "lucide-react";

export default function StudentDashboardOverview() {
  const [mounted, setMounted] = useState(false);
  // Simulating animation states
  const [courses, setCourses] = useState(0);
  const [hours, setHours] = useState(0);
  const [certs, setCerts] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    // basic count up animation simulation
    let start = 0;
    const endCourses = 2;
    const endHours = 12.5;
    const endCerts = 1;
    const duration = 600;
    const startTime = performance.now();
    
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progressRatio, 3); // simple cubic ease-out
      
      setCourses(Math.floor(easeOut * endCourses));
      setHours(parseFloat((easeOut * endHours).toFixed(1)));
      setCerts(Math.floor(easeOut * endCerts));
      setProgress(Math.floor(easeOut * 35)); // for progress bar
      
      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      } else {
        setCourses(endCourses);
        setHours(endHours);
        setCerts(endCerts);
        setProgress(35);
      }
    };
    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="w-full flex-1 pb-10">
      
      {/* B1: Hero Welcome Banner */}
      <div 
        className={`w-full bg-[#0f4ff1] rounded-[20px] px-[36px] py-[32px] mb-[32px] flex flex-col md:flex-row shadow-sm relative overflow-hidden transition-all duration-400 ease-out ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {/* SVG Pattern Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-6">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diagonalGrid" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <path d="M 0 0 L 0 32" fill="none" stroke="#ffffff" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonalGrid)" />
          </svg>
        </div>

        {/* Single Content Block */}
        <div className="relative z-10 w-full flex flex-col items-start pr-4 max-w-2xl">
          <span className="font-sans font-medium text-[11px] tracking-[0.12em] text-white/65 uppercase">
            WELCOME BACK
          </span>
          <h1 className="font-heading font-extrabold text-[36px] text-white leading-[1.1] rounded-[20px] mt-[6px]">
            Hi, Jane!
          </h1>
          <p className="font-sans font-normal text-[15px] text-white/80 leading-[1.6] max-w-[480px] mt-[8px] mb-[24px]">
            You are officially 60% through the UI Design Fundamentals course. Keep up the momentum!
          </p>
          <button className="bg-white text-[#0f4ff1] h-[44px] rounded-[12px] px-[22px] font-heading font-semibold text-[14px] hover:bg-[#f0f4ff] transition-colors duration-150 ease flex items-center gap-2">
            <span>Resume Learning</span>
            <PlayCircle size={16} className="text-[#0f4ff1]" />
          </button>
        </div>
      </div>

      {/* B3: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] w-full mb-[32px]">
        {/* Card 1 */}
        <div className="bg-white border border-[#e8edf5] rounded-[14px] py-[20px] px-[24px] flex items-center gap-[16px] transition-all duration-200 hover:translate-y-[-2px]" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05), 0 0 0 1px #e8edf5" }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,23,42,0.10)"}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.05), 0 0 0 1px #e8edf5"}
        >
          <div className="w-[48px] h-[48px] rounded-[12px] bg-[#eff4fe] flex items-center justify-center shrink-0">
            <BookOpen size={22} className="text-[#0f4ff1]" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-normal text-[13px] text-[#6b7280] mb-[4px]">Active Courses</span>
            <span className="font-heading font-bold text-[28px] text-[#0f172a] leading-none">{courses}</span>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white border border-[#e8edf5] rounded-[14px] py-[20px] px-[24px] flex items-center gap-[16px] transition-all duration-200 hover:translate-y-[-2px]" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05), 0 0 0 1px #e8edf5" }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,23,42,0.10)"}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.05), 0 0 0 1px #e8edf5"}
        >
          <div className="w-[48px] h-[48px] rounded-[12px] bg-[#ecfdf5] flex items-center justify-center shrink-0">
            <Clock size={22} className="text-[#16a34a]" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-normal text-[13px] text-[#6b7280] mb-[4px]">Hours Learned</span>
            <span className="font-heading font-bold text-[28px] text-[#0f172a] leading-none">{hours}h</span>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white border border-[#e8edf5] rounded-[14px] py-[20px] px-[24px] flex items-center gap-[16px] transition-all duration-200 hover:translate-y-[-2px]" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05), 0 0 0 1px #e8edf5" }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,23,42,0.10)"}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.05), 0 0 0 1px #e8edf5"}
        >
          <div className="w-[48px] h-[48px] rounded-[12px] bg-[#f5f3ff] flex items-center justify-center shrink-0">
            <Award size={22} className="text-[#7c3aed]" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-normal text-[13px] text-[#6b7280] mb-[4px]">Certificates</span>
            <span className="font-heading font-bold text-[28px] text-[#0f172a] leading-none">{certs}</span>
          </div>
        </div>
      </div>

      {/* B4: Jump Back In */}
      <h2 className="font-heading font-bold text-[20px] text-[#0f172a] mb-[16px]">Jump Back In</h2>
      <div 
        className="bg-white border border-[#e8edf5] rounded-[16px] p-0 flex flex-col md:flex-row w-full cursor-pointer hover:translate-y-[-2px] transition-all duration-200 ease group" 
        style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,23,42,0.10)"}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.05)"}
      >
        <div className="w-full md:w-[180px] h-auto min-h-[120px] self-stretch rounded-t-[16px] md:rounded-tr-none md:rounded-l-[16px] overflow-hidden bg-gradient-to-br from-[#eff4fe] to-[#dbeafe] flex items-center justify-center shrink-0 relative group-hover:opacity-90 transition-opacity">
          <Play size={40} className="text-[#0f4ff1] fill-current opacity-20" />
        </div>
        
        <div className="px-[20px] py-[20px] md:pr-[24px] flex-1 flex flex-col">
          <div className="flex items-center gap-3 w-full">
            <div className="bg-[#eff4fe] text-[#0f4ff1] font-sans font-semibold text-[11px] uppercase tracking-[0.08em] h-[22px] rounded-full px-[10px] flex items-center inline-flex">
              UI DESIGN
            </div>
            <div className="flex items-center gap-1.5 text-[#6b7280] font-sans font-medium text-[12px]">
              <Clock size={14} className="text-[#9ca3af]" />
              <span>14m 22s</span>
            </div>
          </div>
          
          <h3 className="font-heading font-bold text-[17px] text-[#0f172a] mt-[8px] mb-[6px]">
            Typography Layouts & Grids
          </h3>
          <p className="font-sans font-normal text-[14px] text-[#6b7280] leading-[1.6] line-clamp-2 max-h-[44px]">
            Understand how to align typography structures across flexbox layouts. This lesson explores the strict visual hierarchy necessary for professional agency-grade outputs.
          </p>
          
          <div className="mt-auto pt-[16px] flex flex-col w-full">
             <div className="flex items-center justify-between w-full mb-[6px]">
                 <span className="w-full"></span>
                 <span className="font-sans font-medium text-[12px] text-[#6b7280] shrink-0">{progress}%</span>
             </div>
             <div className="w-full h-[6px] bg-[#f1f5f9] rounded-full overflow-hidden">
               <div className="h-full bg-[#0f4ff1] rounded-full" style={{ width: `${progress}%` }} />
             </div>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center pr-[24px] pl-[12px] shrink-0">
          <ChevronRight size={20} className="text-[#9ca3af] group-hover:text-[#0f4ff1] transition-colors" />
        </div>
      </div>
      
    </div>
  );
}
