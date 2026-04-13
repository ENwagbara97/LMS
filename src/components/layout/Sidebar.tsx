"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  CalendarDays,
  FileText,
  TrendingUp,
  Settings,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Megaphone,
  ChevronRight,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    }
    return false;
  });

  React.useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const isAdminRoute = pathname.startsWith('/admin');

  const studentLinks = [
    { name: "Overview", href: "/student", icon: Home, exact: true },
    { name: "Courses", href: "/student/courses", icon: BookOpen },
    { name: "Schedule", href: "/student/schedule", icon: CalendarDays },
    { name: "Exams & Quizzes", href: "/student/exams", icon: FileText },
    { name: "Progress", href: "/student/progress", icon: TrendingUp },
  ];

  const adminLinks = [
    { name: "Overview", href: "/admin", icon: Home, exact: true },
    { name: "Manage Users", href: "/admin/users", icon: Users },
    { name: "Create Course", href: "/admin/courses/new", icon: BookOpen },
    { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { name: "Reports", href: "/admin/reports", icon: TrendingUp },
  ];

  const mainLinks = isAdminRoute ? adminLinks : studentLinks;

  const studentOptions = [
    { name: "Notifications", href: "/student/notifications", icon: Bell, badge: 2 },
    { name: "Settings", href: "/student/settings", icon: Settings },
  ];

  const adminOptions = [
    { name: "Platform Settings", href: "/admin/settings", icon: Settings },
  ];

  const bottomLinks = isAdminRoute ? adminOptions : studentOptions;

  const LinkItem = ({ item }: { item: any }) => {
    const isActive = item.exact 
      ? pathname === item.href 
      : pathname.startsWith(item.href);

    return (
      <Link
        href={item.href}
        className={`flex items-center h-[42px] mb-1 transition-all duration-120 group relative px-[12px] ${
          isActive 
            ? "font-heading font-semibold text-[#0f4ff1] bg-[#eff4fe]" 
            : "font-sans font-medium text-[#4b5563] hover:bg-[#f9fafb] hover:text-[#1a1f36]"
        }`}
        style={{
          borderRadius: isActive ? "0 10px 10px 0" : "10px",
          borderLeft: isActive ? "3px solid #0f4ff1" : "3px solid transparent",
          marginRight: "12px",
          marginLeft: isActive ? "0px" : "12px",
          paddingLeft: isActive ? "9px" : "12px" // To offset the 3px border
        }}
      >
        <item.icon 
          className="shrink-0" 
          size={18} 
          strokeWidth={1.5} 
          color={isActive ? "#0f4ff1" : "#6b7280"} 
        />
        {!isCollapsed && (
          <span className="ml-[12px] text-[14px] truncate flex-1 leading-none pt-0.5">{item.name}</span>
        )}
        {!isCollapsed && item.badge && (
          <span className="ml-auto bg-[#0f4ff1] text-white text-[10px] font-bold px-[6px] py-[2px] rounded-full shrink-0 leading-none flex items-center justify-center min-w-[20px] h-[20px]">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-[#e8edf5] relative transition-all duration-300 ${
        isCollapsed ? "w-[64px]" : "w-[248px]"
      } h-full z-10 shrink-0`}
    >
      <div className="h-[60px] flex items-center justify-between px-[20px] shrink-0">
         {!isCollapsed && (
          <span className="font-heading font-bold text-[17px] text-[#0f172a] truncate">
            Kreative Hub
          </span>
        )}
         {isCollapsed && <span className="font-heading font-bold text-lg text-[#0f4ff1] mx-auto">K</span>}
        
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-md text-[#6b7280] hover:text-[#1a1f36] hover:bg-[#f9fafb] transition-colors"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-10 bg-white border border-[#e8edf5] border-l-0 rounded-r-md flex items-center justify-center text-[#9ca3af] hover:text-[#0f4ff1] shadow-sm z-50 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <div className="flex-1 overflow-y-auto py-[16px] scrollbar-hide">
        {!isCollapsed && (
          <div className="pl-[20px] pr-[12px] pt-[8px] pb-[4px]">
            <span className="font-sans font-medium text-[11px] text-[#9ca3af] tracking-[0.1em] uppercase">
              MAIN MENU
            </span>
          </div>
        )}
        <nav className="flex flex-col">
          {mainLinks.map((link) => (
            <LinkItem key={link.href} item={link} />
          ))}
        </nav>
      </div>

      <div className="pb-[24px] pt-[16px] border-t border-[#e8edf5] shrink-0">
         {!isCollapsed && (
            <div className="pl-[20px] pr-[12px] pt-[8px] pb-[4px]">
              <span className="font-sans font-medium text-[11px] text-[#9ca3af] tracking-[0.1em] uppercase">
                OPTIONS
              </span>
            </div>
          )}
        <nav className="flex flex-col">
          {bottomLinks.map((link) => (
            <LinkItem key={link.href} item={link} />
          ))}
        </nav>

        {!isCollapsed && (
          <div className="mt-[24px] px-[20px] flex items-center gap-[12px] cursor-pointer group relative">
            <div className="w-[36px] h-[36px] rounded-full bg-[#1e293b] text-white flex items-center justify-center font-heading font-bold text-[14px] shrink-0">
              JS
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-heading font-semibold text-[13px] text-[#1a1f36] truncate leading-tight">
                {isAdminRoute ? "Admin User" : "Jane Student"}
              </span>
              <span className="font-sans font-normal text-[12px] text-[#6b7280] truncate leading-tight pt-0.5">
                {isAdminRoute ? "Instructor" : "UI Design"}
              </span>
            </div>
            
            <div className="absolute bottom-[calc(100%+0px)] left-[20px] pb-[8px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
              <div className="bg-white border border-[#e8edf5] shadow-dropdown p-2 rounded-[12px] flex flex-col min-w-[150px]">
                 <Link href={isAdminRoute ? "/student" : "/admin"} className="font-sans text-[13px] font-medium text-[#0f172a] hover:bg-[#f9fafb] px-3 py-2 rounded-md transition-colors text-left block">
                   {isAdminRoute ? "Student Portal" : "Admin Dashboard"}
                 </Link>
                 <Link href="/login" onClick={() => document.cookie = "user_role=; max-age=0; path=/;"} className="font-sans text-[13px] font-medium text-[#dc2626] hover:bg-[#fef2f2] px-3 py-2 rounded-md cursor-pointer text-left transition-colors mt-1 block">
                   Log Out
                 </Link>
              </div>
            </div>
          </div>
        )}
        {isCollapsed && (
           <div className="mt-[24px] flex justify-center">
             <div className="w-[36px] h-[36px] rounded-full bg-[#1e293b] text-white flex items-center justify-center font-heading font-bold text-[14px]">
               JS
             </div>
           </div>
        )}
      </div>
    </aside>
  );
}
