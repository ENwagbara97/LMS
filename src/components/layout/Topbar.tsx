"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";

export function Topbar() {
  const pathname = usePathname();
  
  // Breadcrumb generator logic
  const generateBreadcrumbs = () => {
    if (pathname === "/student" || pathname === "/student/") {
       return [{ name: "Dashboard", href: "/student" }];
    }
    
    const paths = pathname.split("/").filter(Boolean);
    return [
      { name: "Kreative Hub", href: "/student" },
      ...paths.slice(1).map((segment, idx) => ({
        name: segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " "),
        href: "/" + paths.slice(0, idx + 2).join("/")
      }))
    ];
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="h-[60px] bg-white border-b border-[#e8edf5] px-[28px] flex items-center justify-between shrink-0 z-10 sticky top-0">
      <div className="flex items-center">
        {/* Mobile Logo Fallback */}
        <div className="md:hidden font-heading font-bold text-[17px] text-[#0f172a] mr-[20px]">
          Kreative Hub
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
        <button className="flex items-center gap-[6px] p-1.5 rounded-full hover:bg-[#f9fafb] text-[#4b5563] transition-colors focus:outline-none">
          <Bell size={20} strokeWidth={1.5} />
          {/* Notification Badge */}
          <span className="bg-[#0f4ff1] text-white text-[10px] font-bold px-[6px] py-[2px] rounded-full shrink-0 leading-none flex items-center justify-center min-w-[20px] h-[20px]">
            3
          </span>
        </button>

        {/* User Chip */}
        <button className="flex items-center gap-[10px] pl-[6px] pr-[12px] py-[6px] rounded-full hover:bg-[#f9fafb] transition-colors border border-[#e8edf5] bg-white focus:outline-none">
          <div className="w-[32px] h-[32px] rounded-full bg-[#0f4ff1] text-white flex items-center justify-center font-heading font-bold text-[12px] shrink-0">
            JS
          </div>
          <div className="hidden md:flex flex-col items-start pr-1">
            <span className="font-heading font-semibold text-[13px] text-[#0f172a] leading-tight">Jane S.</span>
            <span className="font-sans font-normal text-[12px] text-[#6b7280] leading-tight mt-[1px]">Student</span>
          </div>
        </button>
      </div>
    </header>
  );
}
