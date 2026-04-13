"use client";
import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, BookOpen, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminReportsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { label: "Total Students", value: "1,284", change: "+12.5%", trendingUp: true, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Completion Rate", value: "68.2%", change: "+4.3%", trendingUp: true, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Courses", value: "24", change: "-2", trendingUp: false, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Avg. Learning Time", value: "14.2h", change: "+1.2h", trendingUp: true, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="w-full flex-1 max-w-7xl pb-10">
      <div className="flex flex-col mb-[32px]">
        <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">Analytics Reports</h1>
        <p className="font-sans font-normal text-[15px] text-[#6b7280]">Cohort-wide performance metrics and engagement indicators.</p>
      </div>

      {/* Part B3 Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[20px] mb-8">
        {stats.map((stat, i) => (
          <div 
            key={i}
            className={`bg-white border border-[#e8edf5] rounded-[16px] p-5 shadow-card transition-all duration-500 ease-out hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(15,23,42,0.10)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
               <div className={`w-10 h-10 rounded-[12px] ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                 <stat.icon size={20} />
               </div>
               <div className={`flex items-center gap-0.5 font-sans font-semibold text-[13px] ${stat.trendingUp ? 'text-emerald-600' : 'text-red-600'}`}>
                 {stat.change}
                 {stat.trendingUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
               </div>
            </div>
            
            <div className="flex flex-col">
               <span className="font-sans font-medium text-[13px] text-[#6b7280] mb-1">{stat.label}</span>
               <span className="font-heading font-bold text-[24px] text-[#0f172a] tracking-tight">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Cohort Performance Chart Placeholder */}
      <div className="bg-white border border-[#e8edf5] rounded-[20px] p-6 shadow-card mb-8">
         <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-[18px] text-[#0f172a]">Weekly Engagement</h2>
            <div className="flex gap-2">
               <div className="flex items-center gap-2 text-[12px] font-sans font-medium text-[#6b7280]">
                 <span className="w-2.5 h-2.5 rounded-full bg-[#0f4ff1]"></span> Video Content
               </div>
               <div className="flex items-center gap-2 text-[12px] font-sans font-medium text-[#6b7280]">
                 <span className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]"></span> Quizzes
               </div>
            </div>
         </div>
         
         <div className="h-[280px] w-full flex items-end gap-1.5 pt-4">
            {/* Simple Bar Chart Visualization */}
            {[45, 60, 40, 85, 70, 95, 55, 65, 80, 50, 75, 90].map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center group relative">
                  <div 
                    className="w-full bg-[#eff4fe] rounded-t-[4px] relative overflow-hidden flex flex-col justify-end"
                    style={{ height: `${h}%` }}
                  >
                     <div 
                       className="w-full bg-[#0f4ff1]/80 hover:bg-[#0f4ff1] transition-colors rounded-t-[4px]" 
                       style={{ height: `${h * 0.7}%` }}
                     ></div>
                  </div>
                  <span className="mt-3 font-sans text-[10px] text-[#9ca3af] uppercase font-bold tracking-tighter">W{i+1}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 bg-[#0f172a] text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-sans">
                     {h * 12} Students Active
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-[#e8edf5] rounded-[20px] shadow-card overflow-hidden">
         <div className="px-6 py-5 border-b border-[#f1f5f9]">
            <h2 className="font-heading font-bold text-[18px] text-[#0f172a]">High Performing Students</h2>
         </div>
         <table className="w-full text-left">
            <thead className="bg-[#f9fafb] border-b border-[#e8edf5] text-[11px] uppercase tracking-wider text-[#6b7280] font-bold">
               <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Completed</th>
                  <th className="px-6 py-4">Avg Score</th>
                  <th className="px-6 py-4">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
               {[
                 { name: "Jane Student", courses: 14, score: "96%", status: "Excellence" },
                 { name: "Alex Rivers", courses: 12, score: "92%", status: "Excellence" },
                 { name: "Sam Wilson", courses: 9, score: "88%", status: "Passing" },
                 { name: "Mia Chen", courses: 15, score: "94%", status: "Excellence" },
               ].map((row, i) => (
                  <tr key={i} className="hover:bg-[#fdfefe] transition-colors cursor-pointer">
                     <td className="px-6 py-4 font-heading font-semibold text-[14px] text-[#0f172a]">{row.name}</td>
                     <td className="px-6 py-4 font-sans text-[13px] text-[#4b5563]">{row.courses} units</td>
                     <td className="px-6 py-4 font-sans font-bold text-[13px] text-[#0f4ff1]">{row.score}</td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight ${row.status === 'Excellence' ? 'bg-[#ecfdf5] text-[#16a34a]' : 'bg-[#eff4fe] text-[#0f4ff1]'}`}>
                           {row.status}
                        </span>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  )
}
