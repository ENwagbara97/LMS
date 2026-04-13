import React from "react";
import { Megaphone, CheckCircle, MessageSquare, Award, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const notifs = [
    { type: "Announcement", title: "New Assignment Rules Added", body: "Please review the updated submission guidelines before Friday.", date: "2 hrs ago", unread: true },
    { type: "Quiz", title: "Quiz Graded: UI Layouts", body: "You scored 95% on the latest module. Excellent work!", date: "Yesterday", unread: true },
    { type: "Project", title: "Project Feedback Available", body: "Instructor Maham left 2 comments on your typography submission.", date: "Oct 12", unread: false },
    { type: "Certificate", title: "Certificate Unlocked!", body: "You have completed UI Design Fundamentals. View your certificate.", date: "Oct 10", unread: false },
  ];

  return (
    <div className="w-full flex-1 max-w-4xl">
      <div className="flex items-end justify-between mb-[32px]">
        <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">Notifications</h1>
        <button className="flex items-center gap-2 font-heading font-semibold text-[14px] text-[#0f4ff1] hover:text-[#093094] transition-colors">
          <CheckCheck size={16} />
          Mark all as read
        </button>
      </div>

      <div className="flex flex-col gap-[12px]">
         {notifs.map((n, i) => {
           let Icon = Megaphone;
           let bgColor = "#eff4fe";
           let iconColor = "#0f4ff1";

           if (n.type === "Quiz") { Icon = CheckCircle; bgColor = "#ecfdf5"; iconColor = "#16a34a"; }
           if (n.type === "Project") { Icon = MessageSquare; bgColor = "#fef9c3"; iconColor = "#a16207"; }
           if (n.type === "Certificate") { Icon = Award; bgColor = "#f5f3ff"; iconColor = "#7c3aed"; }

           return (
             <div 
               key={i} 
               className={`flex items-start gap-[16px] px-[20px] py-[16px] bg-white border border-[#e8edf5] cursor-pointer hover:shadow-md transition-shadow ${
                 n.unread ? "bg-[#fdfeff] border-l-[3px] border-l-[#0f4ff1]" : ""
               }`}
               style={{ borderRadius: n.unread ? "0 12px 12px 0" : "12px" }}
             >
                <div className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: bgColor, color: iconColor }}>
                   <Icon size={18} strokeWidth={2} />
                </div>
                
                <div className="flex-1 flex flex-col pr-4">
                  <h3 className="font-heading font-semibold text-[14px] text-[#0f172a] mb-[2px]">{n.title}</h3>
                  <p className="font-sans font-normal text-[13px] text-[#6b7280] line-clamp-2 leading-[1.5]">{n.body}</p>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-[6px] pl-[12px]">
                  <span className="font-sans font-normal text-[12px] text-[#9ca3af]">{n.date}</span>
                  {n.unread && <div className="w-[8px] h-[8px] bg-[#0f4ff1] rounded-full"></div>}
                </div>
             </div>
           );
         })}
      </div>
    </div>
  )
}
