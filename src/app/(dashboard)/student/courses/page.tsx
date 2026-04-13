import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Image as ImageIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses, error } = await supabase.from('courses').select('*');
  
  const mockFallback = [
    { id: '1', title: 'UI Design Fundamentals', description: 'Learn to craft beautiful interfaces.', category_tag: 'UI Design', difficulty: 'Beginner', duration_hours: 10 },
    { id: '2', title: 'Advanced Typography', description: 'Master the art of type layout.', category_tag: 'Typography', difficulty: 'Advanced', duration_hours: 4 },
    { id: '3', title: 'Advanced Component Workflows', description: 'Deep dive into reusable React architectures mapping strictly to Figma components.', category_tag: 'Frontend', difficulty: 'Intermediate', duration_hours: 16 }
  ];

  const displayCourses = courses || mockFallback;

  return (
    <div className="w-full flex-1">
      <div className="mb-[32px]">
        <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">My Courses</h1>
        <p className="font-sans font-normal text-[15px] text-[#6b7280] mt-[4px]">Resume where you left off or start a new skill module.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] w-full pb-10">
        {displayCourses.length === 0 ? (
           <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-[80px] border border-dashed border-[#e8edf5] rounded-[16px] bg-[#fdfefe]">
             <div className="w-[64px] h-[64px] rounded-full bg-[#eff4fe] flex items-center justify-center mb-6">
                <ImageIcon size={32} className="text-[#0f4ff1]" />
             </div>
             <h3 className="font-heading font-bold text-[20px] text-[#0f172a] mb-2">No active courses found</h3>
             <p className="font-sans text-[15px] text-[#6b7280] max-w-sm text-center">Once you enroll in a module or start a lesson, your active courses will appear here on your grid.</p>
           </div>
        ) : (
          displayCourses.map((c: any) => {
             let badgeBg = "#ecfdf5";
             let badgeText = "#16a34a";
             if (c.difficulty === "Intermediate") {
               badgeBg = "#fef9c3";
               badgeText = "#a16207";
             } else if (c.difficulty === "Advanced") {
               badgeBg = "#fee2e2";
               badgeText = "#dc2626";
             }

             return (
               <div 
                  key={c.id} 
                  className="bg-white border border-[#e8edf5] rounded-[16px] overflow-hidden flex flex-col cursor-pointer transition-all duration-200 ease group hover:-translate-y-[2px] shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.10)]"
               >
                 {/* Thumbnail Section */}
                 <div className="w-full h-[180px] bg-gradient-to-br from-[#eff4fe] to-[#dbeafe] flex flex-col items-center justify-center shrink-0">
                   <ImageIcon size={32} className="text-[#93c5fd] mb-2" />
                   <span className="font-sans font-normal text-[13px] text-[#93c5fd]">Course Thumbnail</span>
                 </div>
                 
                 {/* Card Body */}
                 <div className="px-[20px] pt-[18px] pb-[20px] flex flex-col flex-1 border-t border-[#e8edf5]">
                   
                   {/* Top Row */}
                   <div className="flex items-center justify-between">
                     <div className="bg-[#eff4fe] text-[#0f4ff1] font-sans font-semibold text-[11px] uppercase tracking-[0.06em] h-[22px] rounded-full px-[10px] flex items-center inline-flex">
                       {c.category_tag}
                     </div>
                     <span className="font-sans font-medium text-[13px] text-[#9ca3af]">{c.duration_hours}h</span>
                   </div>
                   
                   {/* Title & Desc */}
                   <h3 className="font-heading font-bold text-[18px] text-[#0f172a] mt-[8px] mb-[4px] leading-[1.3] group-hover:text-[#0f4ff1] transition-colors">{c.title}</h3>
                   <p className="font-sans font-normal text-[13px] text-[#6b7280] leading-[1.5] line-clamp-2 max-h-[39px]">{c.description}</p>
                   
                   {/* Divider */}
                   <div className="w-full border-t border-[#f1f5f9] mt-[14px] mb-[14px]"></div>
                   
                   {/* Bottom Row */}
                   <div className="flex items-center justify-between mt-auto">
                      <div 
                        className="font-sans font-semibold text-[11px] px-[8px] py-[3px] rounded-full uppercase tracking-[0.06em]"
                        style={{ backgroundColor: badgeBg, color: badgeText }}
                      >
                        {c.difficulty}
                      </div>
                      
                      <Link href={`/student/courses/${c.id}`} className="font-heading font-semibold text-[14px] text-[#0f4ff1] flex items-center gap-[4px] hover:underline group-hover:-translate-x-1 transition-transform outline-none">
                        Resume
                        <ArrowRight size={14} />
                      </Link>
                   </div>
                 </div>
               </div>
             );
          })
        )}
      </div>
    </div>
  )
}
