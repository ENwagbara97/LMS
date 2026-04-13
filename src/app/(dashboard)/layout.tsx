import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AnnouncementModal } from "@/components/features/AnnouncementModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - Hidden on mobile */}
      <Sidebar />
      <AnnouncementModal />
      
      <div className="flex flex-col flex-1 w-full relative">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-6 pb-[80px] md:pb-6 relative z-0">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        
        {/* Bottom Nav - Hidden on desktop */}
        <BottomNav />
      </div>
    </div>
  );
}
