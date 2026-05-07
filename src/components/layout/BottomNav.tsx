"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, TrendingUp, Bell, User2, Menu, FileText } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminRoute = pathname.startsWith('/admin');

  const studentLinks = [
    { name: "Home", href: "/student", icon: Home },
    { name: "Courses", href: "/student/courses", icon: BookOpen },
    { name: "Exams", href: "/student/exams", icon: FileText },
    { name: "Settings", href: "/student/settings", icon: User2 },
  ];

  const adminLinks = [
    { name: "Home", href: "/admin", icon: Home },
    { name: "Users", href: "/admin/users", icon: BookOpen },
    { name: "Alerts", href: "/admin/announcements", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: User2 },
  ];

  const navLinks = isAdminRoute ? adminLinks : studentLinks;

  if (!mounted) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full h-auto bg-white border-t border-[#e8edf5] flex items-center justify-around z-50 pt-[12px] pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-1px_3px_rgba(15,23,42,0.03)]">
      {navLinks.map(tab => {
        const isActive = tab.name === "Home" 
           ? pathname === tab.href 
           : pathname.startsWith(tab.href);
           
        return (
          <Link key={tab.href} href={tab.href} className="flex flex-col items-center justify-center w-[20%] h-full relative cursor-pointer">
            <tab.icon size={20} className={isActive ? "text-[#0f4ff1]" : "text-[#9ca3af]"} strokeWidth={1.5} />
            <span className={`font-sans font-medium text-[10px] mt-[4px] ${isActive ? "text-[#0f4ff1]" : "text-[#9ca3af]"}`}>
              {tab.name}
            </span>
            {isActive && <div className="w-[4px] h-[4px] bg-[#0f4ff1] rounded-full absolute bottom-[4px]"></div>}
          </Link>
        )
      })}
    </div>
  )
}
