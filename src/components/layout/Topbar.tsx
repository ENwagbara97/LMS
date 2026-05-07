"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/hooks/NotificationContext";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/hooks/UserContext";
import { RealtimeLogo } from "@/components/ui/RealtimeLogo";

export function Topbar() {
  const pathname = usePathname();
  const supabase = createClient();
  const { profile } = useUser();
  const isAdminRoute = pathname.startsWith("/admin");
  
  // Breadcrumb state
  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string | null>(null);

  useEffect(() => {
    const fetchTitles = async () => {
      const paths = pathname.split("/").filter(Boolean);
      
      // If we are in a course or lesson
      if (paths.includes("courses") && paths.length >= 3) {
        const courseId = paths[2];
        const { data: course } = await supabase.from("courses").select("title").eq("id", courseId).single();
        if (course) setCourseTitle(course.title);

        if (paths.includes("lessons") && paths.length >= 5) {
          const lessonId = paths[4];
          const { data: lesson } = await supabase.from("lessons").select("title").eq("id", lessonId).single();
          if (lesson) setLessonTitle(lesson.title);
        }
      } else {
        setCourseTitle(null);
        setLessonTitle(null);
      }
    };
    fetchTitles();
  }, [pathname, supabase]);
  
  // Breadcrumb generator logic
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const crumbs = [{ name: "Dashboard", href: paths[0] === 'admin' ? "/admin" : "/student" }];
    
    if (paths.length > 1) {
      paths.slice(1).forEach((segment, idx) => {
        let name = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");
        
        // Replace IDs with actual titles
        if (idx === 1 && courseTitle) name = courseTitle;
        if (idx === 3 && lessonTitle) name = lessonTitle;
        
        // Skip 'lessons' segment for cleaner breadcrumb
        if (segment === "lessons") return;

        crumbs.push({
          name,
          href: "/" + paths.slice(0, idx + 2).join("/")
        });
      });
    }
    
    return crumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const { unreadCount } = useNotifications();

  return (
    <header className="h-[60px] bg-white border-b border-[#e8edf5] px-[28px] flex items-center justify-between shrink-0 z-10 sticky top-0">
      <div className="flex items-center">
        {/* Mobile Logo Fallback */}
        <div className="md:hidden mr-[20px]">
          <RealtimeLogo collapsed={true} />
        </div>
        
        {/* Desktop Breadcrumbs */}
        <nav className="hidden md:flex items-center space-x-[8px]">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href}>
                <Link 
                  href={crumb.href} 
                  className={`transition-colors ${isLast ? "font-heading font-semibold text-[14px] text-[#0f172a]" : "font-sans font-normal text-[14px] text-[#6b7280] hover:text-[#0f172a]"}`}
                >
                  {crumb.name}
                </Link>
                {!isLast && (
                  <span className="text-[#d1d5db] font-sans font-normal text-[14px]">&gt;</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-[12px]">
        {/* Notification Bell */}
        <Link 
          href={isAdminRoute ? "/admin/announcements" : "/student/notifications"}
          className="flex items-center gap-[6px] p-1.5 rounded-full hover:bg-[#f9fafb] text-[#4b5563] transition-colors focus:outline-none"
        >
          <Bell size={20} strokeWidth={1.5} />
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <span className="bg-[#0f4ff1] text-white text-[10px] font-bold px-[6px] py-[2px] rounded-full shrink-0 leading-none flex items-center justify-center min-w-[20px] h-[20px]">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Chip */}
        <Link 
          href={isAdminRoute ? "/admin/settings" : "/student/settings"}
          className="flex items-center gap-[10px] pl-[6px] pr-[12px] py-[6px] rounded-full hover:bg-[#f9fafb] transition-colors border border-[#e8edf5] bg-white focus:outline-none"
        >
          <div className="w-[32px] h-[32px] rounded-full bg-[#0f4ff1] text-white flex items-center justify-center font-heading font-bold text-[12px] shrink-0 overflow-hidden" style={{ borderRadius: "50%" }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url.startsWith('http') ? profile.avatar_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`} alt="Avatar" className="w-[32px] h-[32px] object-cover" />
            ) : (
              (profile?.full_name || "JS").charAt(0).toUpperCase()
            )}
          </div>
          <div className="hidden md:flex flex-col items-start pr-1">
            <span className="font-heading font-semibold text-[13px] text-[#0f172a] leading-tight">
              {profile?.full_name ? profile.full_name.split(' ')[0] : 'Jane'}
            </span>
            <span className="font-sans font-normal text-[12px] text-[#6b7280] leading-tight mt-[1px]">
              {profile?.role === 'admin' ? "Instructor" : "Student"}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
