"use client";

import React, { useEffect, useState } from "react";
import { PlayCircle, BookOpen, Clock, Award, Play, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { AnnouncementModal } from "@/components/features/AnnouncementModal";

export default function StudentDashboardOverview() {
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState(0);
  const [hours, setHours] = useState(0);
  const [certs, setCerts] = useState(0);
  const [progress, setProgress] = useState(0);
  const [firstName, setFirstName] = useState("Student");
  const [lastActiveLesson, setLastActiveLesson] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let enrollmentsCount = 0;
      let totalSeconds = 0;
      let certsCount = 0;

      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();
      
      if (profile?.full_name) {
        setFirstName(profile.full_name.split(" ")[0]);
      }

      // 2. Fetch Stats
      const { count: enrollCount } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("student_id", user.id);
      if (enrollCount) enrollmentsCount = enrollCount;

      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("last_position_seconds")
        .eq("student_id", user.id);
      
      if (progressData) {
        totalSeconds = progressData.reduce((acc, curr) => acc + Number(curr.last_position_seconds || 0), 0);
      }

      const { count: cCount } = await supabase
        .from("certificates")
        .select("*", { count: "exact", head: true })
        .eq("student_id", user.id);
      if (cCount) certsCount = cCount;

      // 3. Fetch Last Active
      const { data: lastActive } = await supabase
        .from("lesson_progress")
        .select(`
          lesson_id,
          watch_percent,
          last_position_seconds,
          lessons (
            id,
            title,
            courses (id, title, category_tag)
          )
        `)
        .eq("student_id", user.id)
        .eq("completed", false)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (lastActive) {
        setLastActiveLesson(lastActive);
      }

      // 4. Fetch Recent Activity
      const { data: activity } = await supabase
        .from("lesson_progress")
        .select(`
          updated_at,
          watch_percent,
          completed,
          lessons (
            title,
            courses (title)
          )
        `)
        .eq("student_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);
      
      if (activity) {
        setRecentActivity(activity);
      }

      // Stats Animation
      const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
      const duration = 600;
      const startTime = performance.now();
      
      const animate = (time: number) => {
        const elapsed = time - startTime;
        const ratio = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - ratio, 3);
        
        setCourses(Math.floor(easeOut * enrollmentsCount));
        setHours(Math.round(easeOut * totalHours * 10) / 10);
        setCerts(Math.floor(easeOut * certsCount));
        
        if (ratio < 1) {
          requestAnimationFrame(animate);
        } else {
          setCourses(enrollmentsCount);
          setHours(totalHours);
          setCerts(certsCount);
          if (lastActive) setProgress(lastActive.watch_percent || 0);
        }
      };
      requestAnimationFrame(animate);
    };

    loadData();
  }, []);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full flex-1 pb-10">
      <AnnouncementModal />
      
      <div className={`w-full bg-[#0f4ff1] rounded-[20px] px-[36px] py-[32px] mb-[32px] flex flex-col md:flex-row shadow-sm relative overflow-hidden transition-all duration-400 ease-out ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
          <svg width="100%" height="100%"><defs><pattern id="diag" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M 0 0 L 0 32" fill="none" stroke="#fff" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#diag)" /></svg>
        </div>
        <div className="relative z-10 w-full flex flex-col items-start pr-4 max-w-2xl">
          <span className="font-sans font-medium text-[11px] tracking-[0.12em] text-white/65 uppercase">WELCOME BACK</span>
          <h1 className="font-heading font-extrabold text-[36px] text-white leading-[1.1] mt-[6px]">Hi, {firstName}!</h1>
          <p className="font-sans font-normal text-[15px] text-white/80 leading-[1.6] max-w-[480px] mt-[8px] mb-[24px]">
            {lastActiveLesson ? `You are ${lastActiveLesson.watch_percent}% through "${lastActiveLesson.lessons.title}".` : "Start your journey today."}
          </p>
          <Link href={lastActiveLesson ? `/student/courses/${lastActiveLesson.lessons.courses.id}/lessons/${lastActiveLesson.lesson_id}` : "/student/courses"} className="bg-white text-[#0f4ff1] h-[44px] rounded-[12px] px-[22px] font-heading font-semibold text-[14px] hover:bg-[#f0f4ff] transition-colors flex items-center gap-2">
            <span>{lastActiveLesson ? "Resume Learning" : "Explore Courses"}</span>
            <PlayCircle size={16} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] mb-[32px]">
        {[
          { label: "Active Courses", val: courses, icon: BookOpen, bg: "bg-[#eff4fe]", text: "text-[#0f4ff1]", href: "/student/courses" },
          { label: "Hours Learned", val: `${hours}h`, icon: Clock, bg: "bg-[#ecfdf5]", text: "text-[#16a34a]", href: "/student/progress" },
          { label: "Certificates", val: certs, icon: Award, bg: "bg-[#f5f3ff]", text: "text-[#7c3aed]", href: "/student/certificates" }
        ].map((stat, i) => (
          <Link key={i} href={stat.href} className="bg-white border border-[#e8edf5] rounded-[14px] py-[20px] px-[24px] flex items-center gap-[16px] shadow-sm hover:translate-y-[-2px] transition-all hover:border-[#0f4ff1]/30">
            <div className={`w-[48px] h-[48px] rounded-[12px] ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={22} className={stat.text} strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-normal text-[13px] text-[#6b7280] mb-[4px]">{stat.label}</span>
              <span className="font-heading font-bold text-[28px] text-[#0f172a] leading-none">{stat.val}</span>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="font-heading font-bold text-[20px] text-[#0f172a] mb-[16px]">Jump Back In</h2>
      {lastActiveLesson ? (
        <Link 
          href={`/student/courses/${lastActiveLesson.lessons.courses.id}/lessons/${lastActiveLesson.lesson_id}`}
          className="bg-white border border-[#e8edf5] rounded-[16px] flex flex-col md:flex-row w-full hover:shadow-md transition-all group"
        >
          <div className="w-full md:w-[180px] h-[120px] bg-gradient-to-br from-[#eff4fe] to-[#dbeafe] flex items-center justify-center rounded-t-[16px] md:rounded-tr-none md:rounded-l-[16px]">
            <Play size={40} className="text-[#0f4ff1] opacity-20" />
          </div>
          <div className="p-[20px] flex-1 flex flex-col justify-center">
            <span className="bg-[#eff4fe] text-[#0f4ff1] font-sans font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full w-fit mb-2">
              {lastActiveLesson.lessons.courses.category_tag || "Course"}
            </span>
            <h3 className="font-heading font-bold text-[17px] text-[#0f172a]">{lastActiveLesson.lessons.title}</h3>
            <p className="font-sans text-[14px] text-[#6b7280]">{lastActiveLesson.lessons.courses.title}</p>
            <div className="mt-4 w-full h-[6px] bg-[#f1f5f9] rounded-full overflow-hidden">
              <div className="h-full bg-[#0f4ff1] rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="hidden md:flex items-center px-6">
            <ChevronRight size={20} className="text-[#9ca3af] group-hover:text-[#0f4ff1]" />
          </div>
        </Link>
      ) : (
        <div className="bg-white border border-[#e8edf5] border-dashed rounded-[16px] p-8 text-center text-[#9ca3af]">
          No active lessons. Start a course to see it here!
        </div>
      )}

      <div className="mt-[48px]">
        <h2 className="font-heading font-bold text-[20px] text-[#0f172a] mb-[20px]">Recent Activity</h2>
        <div className="bg-white border border-[#e8edf5] rounded-[20px] overflow-hidden shadow-sm">
          {recentActivity.length > 0 ? (
            <div className="flex flex-col">
              {recentActivity.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 px-[24px] py-[16px] border-b border-[#f1f5f9] last:border-0 hover:bg-[#fafafc] transition-colors group">
                  <div className={`w-[10px] h-[10px] rounded-full shrink-0 ${item.completed ? "bg-[#16a34a]" : "bg-[#0f4ff1]"}`} />
                  <div className="flex-1">
                    <p className="font-sans font-medium text-[14px] text-[#0f172a]">
                      {item.completed ? "Completed" : "Watched"} <span className="font-bold">"{item.lessons.title}"</span>
                    </p>
                    <p className="font-sans text-[12px] text-[#6b7280]">{item.lessons.courses.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans font-semibold text-[13px] text-[#0f172a]">{item.completed ? "100%" : `${item.watch_percent}%`}</p>
                    <p className="font-sans text-[11px] text-[#9ca3af]">{formatTimeAgo(item.updated_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-[#9ca3af]">No recent activity found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
