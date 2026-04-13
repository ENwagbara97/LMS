"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export function AnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    // Audit Note: Sync with Global Admin 'Source of Truth' + Session check
    const isLive = localStorage.getItem("source_of_truth_announcement_live") === 'true';
    const hasSeen = sessionStorage.getItem("hasSeenAnnouncement");

    if (isLive && !hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setTimeout(() => setShowOverlay(true), 10); // css transition delay
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("hasSeenAnnouncement", "true");
    setShowOverlay(false);
    setTimeout(() => setIsOpen(false), 200);
  }

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-200 ease-out ${showOverlay ? "opacity-100 backdrop-blur-[4px]" : "opacity-0"}`} style={{ backgroundColor: "rgba(15,23,42,0.5)" }}>
      
      <div 
        className={`bg-white rounded-[20px] w-full max-w-[520px] shadow-modal overflow-hidden transition-all duration-[280ms] ease-out flex flex-col ${showOverlay ? "scale-100 opacity-100" : "scale-[0.92] opacity-0"}`}
      >
        {/* Placeholder Audit Fix: Replaced grey placeholder with Gradient & Lucide Icon */}
        <div className="w-full h-[180px] bg-gradient-to-br from-[#eff4fe] to-[#dbeafe] flex items-center justify-center relative">
           <Sparkles size={56} className="text-[#0f4ff1] opacity-20" strokeWidth={1} />
        </div>

        <div className="p-[28px] flex flex-col">
          <div className="bg-[#eff4fe] text-[#0f4ff1] font-sans font-semibold text-[11px] uppercase tracking-[0.06em] h-[22px] rounded-full px-[10px] flex items-center self-start mb-[16px]">
            Announcement
          </div>
          
          <h2 className="font-heading font-bold text-[20px] text-[#0f172a] mb-[8px]">
            Welcome to the new Kreative Hub!
          </h2>
          
          <p className="font-sans font-normal text-[15px] text-[#4b5563] leading-[1.7] mb-[24px]">
            We've completely overhauled the platform to give you a pristine, agency-grade learning environment. You will find your video progress mapped directly to your grades using standard layouts.
          </p>

          <button 
            onClick={handleClose}
            className="w-full h-[48px] bg-[#0f4ff1] text-white rounded-[12px] font-heading font-semibold text-[15px] hover:bg-[#093094] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
