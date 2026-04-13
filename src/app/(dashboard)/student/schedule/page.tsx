import React from 'react';
import { CalendarDays, Clock } from 'lucide-react';

export default function SchedulePage() {
  const schedule = [
    { time: "09:00 AM", title: "Live Q&A: UI Layouts", type: "Webinar", duration: "45 min" },
    { time: "02:00 PM", title: "Design Critique Session", type: "Workshop", duration: "1 hr" },
    { time: "04:30 PM", title: "Study Group: Color Theory", type: "Peer Session", duration: "30 min" },
  ];

  return (
    <div className="w-full flex-1 max-w-4xl pb-10">
      <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] mb-[8px] leading-tight">My Schedule</h1>
      <p className="font-sans font-normal text-[15px] text-[#6b7280] mb-[32px]">Your upcoming live sessions and study groups for the week.</p>

      <div className="bg-white border border-[#e8edf5] rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.05)] p-[24px]">
        <div className="flex items-center justify-between mb-[24px] pb-[16px] border-b border-[#f1f5f9]">
          <h2 className="font-heading font-bold text-[18px] text-[#0f172a]">Today, Oct 15</h2>
          <span className="bg-[#eff4fe] text-[#0f4ff1] font-sans font-semibold text-[11px] uppercase tracking-[0.06em] px-3 py-1 rounded-full flex items-center gap-1">
             <CalendarDays size={14} /> View Month
          </span>
        </div>

        <div className="flex flex-col gap-[16px]">
          {schedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[40px] text-center">
              <div className="w-[56px] h-[56px] rounded-full bg-[#f8fafc] flex items-center justify-center mb-4">
                 <CalendarDays size={24} className="text-[#9ca3af]" />
              </div>
              <p className="font-heading font-semibold text-[15px] text-[#0f172a]">All caught up!</p>
              <p className="font-sans text-[13px] text-[#6b7280]">No live sessions scheduled for today.</p>
            </div>
          ) : (
            schedule.map((event, i) => (
               <div key={i} className="flex flex-col md:flex-row items-start md:items-center p-[16px] border border-[#e8edf5] rounded-[12px] hover:border-[#0f4ff1] transition-colors cursor-pointer group">
                  <div className="flex flex-col min-w-[120px] mb-3 md:mb-0">
                    <span className="font-heading font-bold text-[15px] text-[#0f172a] group-hover:text-[#0f4ff1] transition-colors">{event.time}</span>
                    <div className="flex items-center gap-[4px] mt-1 text-[#6b7280]">
                       <Clock size={12} />
                       <span className="font-sans text-[12px]">{event.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-1 border-l border-[#f1f5f9] md:pl-[20px]">
                    <h3 className="font-heading font-semibold text-[16px] text-[#0f172a] group-hover:text-[#0f4ff1] transition-colors">{event.title}</h3>
                    <span className="font-sans text-[13px] text-[#6b7280]">{event.type}</span>
                  </div>
                  
                  <button className="mt-4 md:mt-0 px-[16px] h-[36px] border border-[#0f4ff1] text-[#0f4ff1] font-heading font-semibold text-[13px] rounded-[10px] hover:bg-[#eff4fe] transition-colors">
                    Join Room
                  </button>
               </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
