"use client";
import React, { useState } from 'react';
import { Send, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NewCoursePage() {
  const { success } = useToast();
  const [course, setCourse] = useState({ title: '', desc: '', difficulty: 'Beginner' });

  const handleAction = () => {
    success("Saved successfully");
  };

  return (
    <div className="w-full flex-1 max-w-4xl pb-10">
       <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] mb-2 leading-tight">Create New Course</h1>
       <p className="font-sans font-normal text-[15px] text-[#6b7280] mb-[32px]">Upload and map your curriculum directly utilizing the global design tokens.</p>

       <div className="bg-white border border-[#e8edf5] rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.05)] p-6 md:p-8 flex flex-col gap-6">
         
         <div className="flex flex-col gap-2">
           <label className="font-sans font-medium text-[13px] text-[#0f172a]">Course Title</label>
           <input 
             type="text" 
             className="w-full h-[44px] px-4 font-sans text-[14px] rounded-[12px] border border-[#e8edf5] focus:border-[#0f4ff1] focus:ring-1 focus:ring-[#0f4ff1] outline-none transition-all placeholder:text-[#cbd5e1]" 
             placeholder="e.g. Advanced Typography Systems"
             value={course.title}
             onChange={(e) => setCourse({...course, title: e.target.value})}
           />
         </div>

         <div className="flex flex-col gap-2">
           <label className="font-sans font-medium text-[13px] text-[#0f172a]">Description</label>
           <textarea 
             className="w-full h-[120px] p-4 font-sans text-[14px] rounded-[12px] border border-[#e8edf5] focus:border-[#0f4ff1] focus:ring-1 focus:ring-[#0f4ff1] outline-none transition-all placeholder:text-[#cbd5e1] resize-none" 
             placeholder="Describe what the student will learn..."
             value={course.desc}
             onChange={(e) => setCourse({...course, desc: e.target.value})}
           ></textarea>
         </div>

         <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-2">
               <label className="font-sans font-medium text-[13px] text-[#0f172a]">Difficulty Level</label>
               <select 
                 className="w-full h-[44px] px-4 font-sans text-[14px] rounded-[12px] border border-[#e8edf5] focus:border-[#0f4ff1] focus:ring-1 focus:ring-[#0f4ff1] outline-none bg-white"
                 value={course.difficulty}
                 onChange={(e) => setCourse({...course, difficulty: e.target.value})}
               >
                 <option value="Beginner">Beginner (Green UI)</option>
                 <option value="Intermediate">Intermediate (Amber UI)</option>
                 <option value="Advanced">Advanced (Red UI)</option>
               </select>
            </div>
            
            <div className="flex-1 flex flex-col gap-2">
               <label className="font-sans font-medium text-[13px] text-[#0f172a]">Thumbnail Upload</label>
               <div className="h-[44px] px-4 rounded-[12px] border border-dashed border-[#cbd5e1] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#f8fafc] transition-colors text-[#6b7280]">
                 <UploadCloud size={16} />
                 <span className="font-sans text-[13px]">Upload Image</span>
               </div>
            </div>
         </div>

         <div className="w-full border-t border-[#f1f5f9] my-2"></div>

         <div className="flex justify-end gap-3">
            <button onClick={handleAction} className="h-[44px] px-[20px] bg-white border border-[#e8edf5] text-[#4b5563] font-heading font-semibold text-[14px] rounded-[12px] hover:bg-[#f8fafc] transition-colors">
              Save Draft
            </button>
            <button onClick={handleAction} className="h-[44px] px-[24px] bg-[#0f4ff1] text-white font-heading font-semibold text-[14px] rounded-[12px] hover:bg-[#093094] transition-colors flex items-center gap-2">
              <Send size={16} />
              Publish Course
            </button>
         </div>

       </div>
    </div>
  )
}
