"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, X, Megaphone, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function AnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [announcement, setAnnouncement] = useState<{ id: string; title: string; body_html: string; image_url?: string } | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile & Role - ONLY show for students
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, last_announcement_seen")
        .eq("user_id", user.id)
        .single();

      if (!profile || profile.role === "admin") return;

      // 2. Fetch Latest Announcement
      const { data: latest } = await supabase
        .from("announcements")
        .select("id, title, body_html, image_url, published_at, created_at")
        .eq("target_scope", "all")
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latest) return;

      // 3. Check Session Storage (for "until relogin" dismissal)
      const isDismissedThisSession = sessionStorage.getItem(`announcement_dismissed_${latest.id}`);
      if (isDismissedThisSession) return;

      // 4. Check if user has permanently dismissed this specific announcement
      const { data: readRecord } = await supabase
        .from("announcement_reads")
        .select("is_read")
        .eq("student_id", user.id)
        .eq("announcement_id", latest.id)
        .maybeSingle();

      if (readRecord?.is_read) return;

      // 5. Fallback to last_announcement_seen logic
      const lastSeen = profile.last_announcement_seen ? new Date(profile.last_announcement_seen) : new Date(0);
      const publishDate = new Date(latest.published_at || latest.created_at);

      if (publishDate > lastSeen) {
        setAnnouncement(latest);
        const timer = setTimeout(() => {
          setIsOpen(true);
          setTimeout(() => setShowOverlay(true), 50);
        }, 2000);
        return () => clearTimeout(timer);
      }
    };

    load();
  }, []);

  const handleClose = async () => {
    setShowOverlay(false);
    setTimeout(() => setIsOpen(false), 300);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user && announcement) {
      if (dontShowAgain) {
        // Mark for this session as per "until relogin" request
        sessionStorage.setItem(`announcement_dismissed_${announcement.id}`, "true");
        
        // Also persist to DB so it doesn't show in the NEXT session either (true "Don't show again")
        await supabase.from("announcement_reads").upsert({
          student_id: user.id,
          announcement_id: announcement.id,
          is_read: true,
          read_at: new Date().toISOString()
        }, { onConflict: 'student_id, announcement_id' });
      }

      // Always update last_seen to mark this specific publish date as handled
      await supabase.from("profiles").update({
        last_announcement_seen: new Date().toISOString(),
      }).eq("user_id", user.id);
    }
  };

  if (!isOpen || !announcement) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-all duration-500 ease-out ${
        showOverlay ? "opacity-100 backdrop-blur-[8px]" : "opacity-0"
      }`}
      style={{ backgroundColor: "rgba(15,23,42,0.65)" }}
    >
      <div
        className={`bg-white rounded-[28px] w-full max-w-[500px] shadow-2xl overflow-hidden transition-all duration-[600ms] cubic-bezier(0.16, 1, 0.3, 1) flex flex-col ${
          showOverlay ? "scale-100 translate-y-0 opacity-100" : "scale-[0.85] translate-y-12 opacity-0"
        }`}
      >
        {/* Header graphic */}
        <div className="w-full h-[220px] bg-gradient-to-br from-[#eff4fe] to-[#dbeafe] flex items-center justify-center relative overflow-hidden shrink-0">
          {announcement.image_url ? (
            <img src={announcement.image_url} className="w-full h-full object-cover" alt="Announcement" />
          ) : (
            <div className="flex flex-col items-center gap-3">
               <div className="w-20 h-20 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
                 <Megaphone size={36} className="text-[#0f4ff1]" />
               </div>
               <Sparkles size={48} className="text-[#0f4ff1] opacity-10 absolute -bottom-4 -right-4" strokeWidth={1.5} />
            </div>
          )}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-[#0f172a] transition-all backdrop-blur-xl border border-white/30"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-10 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#0f4ff1] w-2 h-2 rounded-full animate-pulse" />
            <span className="text-[#0f4ff1] font-heading font-bold text-[12px] uppercase tracking-[0.15em]">Official Update</span>
          </div>

          <h2 className="font-heading font-extrabold text-[28px] text-[#0f172a] mb-4 leading-[1.2]">
            {announcement.title}
          </h2>

          <p className="font-sans font-medium text-[16px] text-[#64748b] leading-[1.6] mb-10">
            {announcement.body_html}
          </p>

          <div 
            className="flex items-center gap-3 mb-8 group cursor-pointer w-fit select-none" 
            onClick={() => setDontShowAgain(!dontShowAgain)}
          >
             <div className={`w-5 h-5 rounded-md border-[2px] flex items-center justify-center transition-all ${dontShowAgain ? "bg-[#0f4ff1] border-[#0f4ff1]" : "border-[#e2e8f0] group-hover:border-[#0f4ff1]"}`}>
                {dontShowAgain && <Check size={14} className="text-white" strokeWidth={4} />}
             </div>
             <span className="font-sans font-semibold text-[14px] text-[#64748b] group-hover:text-[#0f172a] transition-colors">Don't show this announcement again</span>
          </div>

          <button
            onClick={handleClose}
            className="w-full h-[56px] bg-[#0f4ff1] text-white rounded-[16px] font-heading font-bold text-[16px] hover:bg-[#093094] transition-all hover:shadow-[0_8px_25px_rgba(15,79,241,0.25)] active:scale-[0.98]"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

