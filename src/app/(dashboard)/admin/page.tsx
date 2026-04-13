"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Megaphone, Plus } from 'lucide-react';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="w-full flex-1 pb-10">
      
      {/* Admin Hero Banner */}
      <div 
        className={`w-full bg-[#0f172a] rounded-[20px] px-[36px] py-[40px] mb-[32px] flex flex-col md:flex-row shadow-sm relative overflow-hidden transition-all duration-400 ease-out border border-[#1e293b] ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {/* SVG Pattern Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diagonalGridAdmin" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <path d="M 0 0 L 0 32" fill="none" stroke="#ffffff" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonalGridAdmin)" />
          </svg>
        </div>

        <div className="relative z-10 w-full flex flex-col items-start pr-4 max-w-2xl">
          <span className="font-sans font-medium text-[11px] tracking-[0.12em] text-white/50 uppercase mb-2">
            INSTRUCTOR PORTAL
          </span>
          <h1 className="font-heading font-extrabold text-[36px] text-white leading-[1.1] mb-3">
            Dashboard Overview
          </h1>
          <p className="font-sans font-normal text-[15px] text-white/60 leading-[1.6] max-w-[480px] mb-[28px]">
            Manage your cohort performance, publish curriculum blocks, and broadcast live announcements to all active student nodes.
          </p>
          <div className="flex gap-3">
             <Link href="/admin/courses/new" className="bg-[#0f4ff1] text-white h-[44px] rounded-[12px] px-[22px] font-heading font-semibold text-[14px] hover:bg-[#093094] transition-colors flex items-center gap-2">
                <Plus size={16} />
                <span>Create Course</span>
             </Link>
             <Link href="/admin/reports" className="bg-white/10 text-white border border-white/20 h-[44px] rounded-[12px] px-[22px] font-heading font-semibold text-[14px] hover:bg-white/20 transition-colors flex items-center gap-2">
                <span>View Reports</span>
             </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
          <Link href="/admin/users" className="p-8 border border-[#e8edf5] rounded-[20px] bg-white transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(15,23,42,0.10)] group cursor-pointer shadow-sm">
            <div className="w-12 h-12 rounded-[14px] bg-[#eff4fe] flex items-center justify-center mb-6">
              <Users size={24} className="text-[#0f4ff1]" />
            </div>
            <h3 className="font-heading font-bold text-[18px] text-[#0f172a] mb-2 group-hover:text-[#0f4ff1] transition-colors">Manage Cohorts</h3>
            <p className="font-sans text-[14px] text-[#6b7280] leading-relaxed">Review student enrollment quotas, map permission roles, and track active sessions.</p>
          </Link>
          
          <Link href="/admin/announcements" className="p-8 border border-[#e8edf5] rounded-[20px] bg-white transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(15,23,42,0.10)] group cursor-pointer shadow-sm">
            <div className="w-12 h-12 rounded-[14px] bg-[#ecfdf5] flex items-center justify-center mb-6">
              <Megaphone size={24} className="text-[#16a34a]" />
            </div>
            <h3 className="font-heading font-bold text-[18px] text-[#0f172a] mb-2 group-hover:text-[#16a34a] transition-colors">Global Broadcast</h3>
            <p className="font-sans text-[14px] text-[#6b7280] leading-relaxed">
               Push real-time bulletin updates to the student 'Announcement Modal' source of truth.
            </p>
          </Link>
      </div>

      <div className="mt-12 flex justify-center">
         <Link href="/student" className="text-[#6b7280] hover:text-[#0f172a] font-sans font-medium text-[13px] underline transition-colors">
            Exit to Student Portal view
         </Link>
      </div>
    </div>
  )
}
