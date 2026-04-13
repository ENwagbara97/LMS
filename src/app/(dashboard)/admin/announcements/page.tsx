"use client";
import React, { useState } from 'react';
import { Megaphone, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AnnouncementsAdminPage() {
  const [sent, setSent] = useState(false);
  const { success } = useToast();

  const triggerGlobalAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('source_of_truth_announcement_live', 'true');
    // We clear the student "hasSeen" flag so it forces a re-trigger for testing.
    sessionStorage.removeItem("hasSeenAnnouncement");
    setSent(true);
    success("Saved successfully");
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="w-full flex-1 max-w-4xl pb-10">
       <div className="flex flex-col mb-[32px]">
          <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">Announcements</h1>
          <p className="font-sans font-normal text-[15px] text-[#6b7280]">Push global announcements to all active student portals targeting the Part E modal.</p>
       </div>

       <div className="bg-white border border-[#e8edf5] rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.05)] p-6 md:p-8 flex flex-col">
         
         <form onSubmit={triggerGlobalAnnouncement} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
               <label className="font-sans font-medium text-[13px] text-[#0f172a]">Active Bulletin Headline</label>
               <input 
                 type="text" 
                 defaultValue="Welcome to the new Kreative Hub!"
                 className="w-full h-[44px] px-4 font-sans text-[14px] rounded-[12px] border border-[#e8edf5] focus:border-[#0f4ff1] focus:ring-1 focus:ring-[#0f4ff1] outline-none transition-all" 
                 required
               />
            </div>

            <div className="flex flex-col gap-2">
               <label className="font-sans font-medium text-[13px] text-[#0f172a]">Message Body</label>
               <textarea 
                 className="w-full h-[120px] p-4 font-sans text-[14px] rounded-[12px] border border-[#e8edf5] focus:border-[#0f4ff1] focus:ring-1 focus:ring-[#0f4ff1] outline-none transition-all resize-none" 
                 defaultValue="We've completely overhauled the platform to give you a pristine, agency-grade learning environment. You will find your video progress mapped directly to your grades using standard layouts."
                 required
               ></textarea>
            </div>

            <button type="submit" disabled={sent} className="h-[44px] px-[24px] bg-[#0f4ff1] text-white font-heading font-semibold text-[14px] rounded-[12px] hover:bg-[#093094] transition-colors flex items-center justify-center gap-2 self-start disabled:opacity-80 disabled:bg-[#16a34a]">
              {sent ? (
                <><CheckCircle size={16} /> Broadcast Live</>
              ) : (
                <><Megaphone size={16} /> Broadcast to Students</>
              )}
            </button>
            {sent && <span className="font-sans text-[13px] text-[#16a34a] mt-2">The 'Source of Truth' sync flag has been updated. If you login as a student, the modal will appear.</span>}
         </form>

       </div>
    </div>
  )
}
