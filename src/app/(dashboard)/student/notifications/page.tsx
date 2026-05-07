"use client";

import React, { useState, useEffect } from "react";
import { Megaphone, CheckCircle, MessageSquare, Award, CheckCheck, Loader2, BellOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useNotifications } from "@/hooks/NotificationContext";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const { refreshUnreadCount } = useNotifications();
  const { success, error } = useToast();

  const fetchNotifications = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error: err } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (!err) setNotifications(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    const { error: err } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    
    if (!err) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      refreshUnreadCount();
    }
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: err } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    
    if (!err) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      refreshUnreadCount();
      success("All notifications marked as read");
    } else {
      error("Failed to mark all as read");
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="w-full flex-1 max-w-4xl pb-10">
      <div className="flex items-end justify-between mb-[32px]">
        <div>
          <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">Notifications</h1>
          <p className="font-sans text-[14px] text-[#6b7280] mt-1">Stay updated with your progress and course announcements.</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 font-heading font-semibold text-[14px] text-[#0f4ff1] hover:text-[#093094] transition-colors bg-[#eff4fe] px-4 py-2 rounded-full"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-col gap-[12px]">
         {isLoading ? (
           <div className="flex flex-col items-center justify-center py-20 gap-4">
             <Loader2 size={32} className="animate-spin text-[#0f4ff1]" />
             <p className="font-sans text-[14px] text-[#6b7280]">Loading notifications...</p>
           </div>
         ) : notifications.length === 0 ? (
           <div className="bg-white border border-[#e8edf5] rounded-[16px] p-20 flex flex-col items-center text-center">
             <BellOff size={48} className="text-[#e8edf5] mb-4" />
             <h3 className="font-heading font-bold text-[18px] text-[#0f172a]">No notifications</h3>
             <p className="font-sans text-[14px] text-[#6b7280] mt-1">We'll let you know when something important happens.</p>
           </div>
         ) : (
           notifications.map((n) => {
             let Icon = Megaphone;
             let bgColor = "#eff4fe";
             let iconColor = "#0f4ff1";

             if (n.type === "quiz_result") { Icon = CheckCircle; bgColor = "#ecfdf5"; iconColor = "#16a34a"; }
             if (n.type === "feedback") { Icon = MessageSquare; bgColor = "#fef9c3"; iconColor = "#a16207"; }
             if (n.type === "certificate") { Icon = Award; bgColor = "#f5f3ff"; iconColor = "#7c3aed"; }

             return (
               <div 
                 key={n.id} 
                 onClick={() => !n.is_read && markAsRead(n.id)}
                 className={`flex items-start gap-[16px] px-[20px] py-[16px] bg-white border border-[#e8edf5] transition-all group ${
                   !n.is_read ? "bg-[#fdfeff] border-l-[3px] border-l-[#0f4ff1] shadow-sm" : "opacity-80"
                 } rounded-[12px] cursor-pointer`}
               >
                  <div className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: bgColor, color: iconColor }}>
                     <Icon size={18} strokeWidth={2} />
                  </div>
                  
                  <div className="flex-1 flex flex-col pr-4">
                    <h3 className="font-heading font-semibold text-[14px] text-[#0f172a] mb-[2px]">{n.title}</h3>
                    <p className="font-sans font-normal text-[13px] text-[#6b7280] line-clamp-2 leading-[1.5]">{n.body}</p>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-[6px] pl-[12px]">
                    <span className="font-sans font-normal text-[12px] text-[#9ca3af]">{getTimeAgo(n.created_at)}</span>
                    {!n.is_read && <div className="w-[8px] h-[8px] bg-[#0f4ff1] rounded-full"></div>}
                  </div>
               </div>
             );
           })
         )}
      </div>
    </div>
  )
}
