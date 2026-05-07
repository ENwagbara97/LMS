"use client";

import React, { useState, useEffect } from "react";
import { CalendarDays, Clock, ChevronLeft, ChevronRight, X, Download, ExternalLink, Video, BookOpen, Loader2, Award } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { BackButton } from "@/components/ui/BackButton";

export default function SchedulePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  const fetchSchedule = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 0. Fetch Profile & Cohort
    const { data: prof } = await supabase
      .from("profiles")
      .select("*, cohorts(*)")
      .eq("user_id", user.id)
      .single();
    if (prof) setProfile(prof);

    // 1. Fetch Global Webinars
    const { data: webinarData } = await supabase
      .from("webinar_sessions")
      .select("*")
      .order("session_date", { ascending: true });

    // 2. Fetch Personal Calendar Events
    const { data: calendarData } = await supabase
      .from("calendar_events")
      .select(`
        *,
        lessons (
          title,
          courses (title)
        )
      `)
      .eq("student_id", user.id)
      .order("event_date", { ascending: true });

    // 3. Merge and Normalize
    const normalizedWebinars = (webinarData || []).map(w => ({
      id: w.id,
      title: w.title,
      description: w.description || "Live Webinar Session",
      date: new Date(`${w.session_date}T${w.session_time}`),
      type: 'webinar',
      join_url: w.join_url,
      displayDate: w.session_date,
      displayTime: w.session_time.slice(0, 5)
    }));

    const normalizedCalendar = (calendarData || []).map(c => {
      const date = new Date(c.event_date);
      return {
        id: c.id,
        title: c.event_title,
        description: c.description || c.lessons?.courses?.title || "Curriculum Event",
        date: date,
        type: c.event_type || 'event',
        lesson_title: c.lessons?.title,
        join_url: c.join_url,
        displayDate: date.toISOString().split('T')[0],
        displayTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      };
    });

    // 3. Add Cohort Milestones
    const milestones: any[] = [];
    if (prof?.cohorts) {
      if (prof.cohorts.start_date) {
        const d = new Date(prof.cohorts.start_date);
        milestones.push({
          id: `start-${prof.cohorts.id}`,
          title: "Cohort Launch",
          description: `Welcome to ${prof.cohorts.name}!`,
          date: d,
          type: 'milestone',
          displayDate: prof.cohorts.start_date,
          displayTime: "09:00"
        });
      }
      if (prof.cohorts.end_date) {
        const d = new Date(prof.cohorts.end_date);
        milestones.push({
          id: `end-${prof.cohorts.id}`,
          title: "Program Completion",
          description: "Graduation Day!",
          date: d,
          type: 'milestone',
          displayDate: prof.cohorts.end_date,
          displayTime: "17:00"
        });
      }
    }

    const combined = [...normalizedWebinars, ...normalizedCalendar, ...milestones].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    setEvents(combined);
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const downloadICS = (event: any) => {
    const start = event.date;
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const format = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${format(start)}`,
      `DTEND:${format(end)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      event.join_url ? `LOCATION:${event.join_url}` : "",
      "END:VEVENT",
      "END:VCALENDAR"
    ].filter(Boolean).join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    link.click();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-[#0f4ff1] mb-4" size={32} />
      <p className="font-sans text-[#6b7280]">Syncing your timeline...</p>
    </div>
  );

  return (
    <div className="w-full flex-1 max-w-4xl pb-20">
      <BackButton fallbackPath="/student" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-[32px] gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">My Schedule</h1>
          <p className="font-sans font-normal text-[15px] text-[#6b7280]">Your curated timeline of live sessions and milestones.</p>
        </div>
        <button 
          onClick={() => setShowMonthModal(true)}
          className="bg-white border border-[#e8edf5] text-[#0f172a] font-heading font-semibold text-[13px] px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#f9fafb] transition-all shadow-sm"
        >
           <CalendarDays size={16} className="text-[#0f4ff1]" /> 
           Calendar View
        </button>
      </div>

      <div className="bg-white border border-[#e8edf5] rounded-[20px] overflow-hidden shadow-sm p-[32px]">
        <div className="flex flex-col gap-[20px]">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[60px] text-center">
              <div className="w-[64px] h-[64px] rounded-full bg-[#f8fafc] flex items-center justify-center mb-4 text-[#cbd5e1]">
                 <CalendarDays size={32} />
              </div>
              <h3 className="font-heading font-bold text-[18px] text-[#0f172a]">Empty Timeline</h3>
              <p className="font-sans text-[14px] text-[#6b7280] max-w-[280px] mx-auto mt-2">You have no upcoming events. Check back soon for workshops!</p>
            </div>
          ) : (
            events.map((event) => (
               <div key={event.id} className="flex flex-col md:flex-row items-start md:items-center p-[24px] border border-[#f1f5f9] rounded-[20px] hover:border-[#0f4ff1] hover:bg-[#fafafc]/30 transition-all group relative">
                  <div className="flex items-center gap-5 min-w-[150px] mb-4 md:mb-0">
                    <div className={`w-[52px] h-[52px] rounded-[14px] flex flex-col items-center justify-center shrink-0 ${
                      event.type === 'webinar' ? "bg-[#eff4fe] text-[#0f4ff1]" : 
                      event.type === 'milestone' ? "bg-[#fff7ed] text-[#ea580c]" :
                      "bg-[#f5f3ff] text-[#7c3aed]"
                    }`}>
                      <span className="font-heading font-bold text-[18px] leading-none">{event.date.getDate()}</span>
                      <span className="font-sans font-bold text-[10px] uppercase mt-1 opacity-80">{event.date.toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-heading font-bold text-[15px] text-[#0f172a]">{event.displayTime}</span>
                      <span className="font-sans font-medium text-[12px] text-[#9ca3af]">{event.type === 'webinar' ? "Live Session" : event.type === 'milestone' ? "Milestone" : "Personal"}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 md:pl-[28px] md:border-l border-[#f1f5f9]">
                    <div className="flex items-center gap-2 mb-1">
                      {event.type === 'webinar' ? <Video size={14} className="text-[#0f4ff1]" /> : 
                       event.type === 'milestone' ? <Award size={14} className="text-[#ea580c]" /> : 
                       <BookOpen size={14} className="text-[#7c3aed]" />}
                      <span className={`font-sans font-bold text-[10px] uppercase tracking-wider ${
                        event.type === 'webinar' ? "text-[#0f4ff1]" : 
                        event.type === 'milestone' ? "text-[#ea580c]" :
                        "text-[#7c3aed]"
                      }`}>
                        {event.type === 'webinar' ? "Workshop" : event.type === 'milestone' ? "Certification" : "Curriculum"}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-[18px] text-[#0f172a] group-hover:text-[#0f4ff1] transition-colors">{event.title}</h3>
                    <p className="font-sans text-[14px] text-[#6b7280] mt-1 line-clamp-1">{event.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-6 md:mt-0">
                    <button 
                      onClick={() => downloadICS(event)}
                      className="w-10 h-10 flex items-center justify-center text-[#9ca3af] hover:text-[#0f4ff1] hover:bg-[#eff4fe] rounded-xl transition-all"
                      title="Add to Calendar"
                    >
                      <Download size={18} />
                    </button>
                    {event.join_url ? (
                      <a 
                        href={event.join_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`h-[44px] px-6 rounded-xl font-heading font-semibold text-[13px] flex items-center justify-center gap-2 transition-all ${
                          isPast(event.date) && !isToday(event.date)
                            ? "bg-[#f1f5f9] text-[#9ca3af] cursor-not-allowed"
                            : "bg-[#0f4ff1] text-white hover:bg-[#093094] shadow-sm"
                        }`}
                        onClick={(e) => {
                          if (isPast(event.date) && !isToday(event.date)) e.preventDefault();
                        }}
                      >
                        Join Room
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <button className="h-[44px] px-6 rounded-xl bg-[#f8fafc] text-[#0f172a] border border-[#e8edf5] font-heading font-semibold text-[13px] hover:bg-[#f1f5f9] transition-all">
                        View Details
                      </button>
                    )}
                  </div>
               </div>
            ))
          )}
        </div>
      </div>

      {/* Month Calendar Modal */}
      {showMonthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm" onClick={() => setShowMonthModal(false)} />
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[28px] shadow-2xl flex flex-col relative z-10 animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-[#e8edf5] flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1))}
                    className="w-10 h-10 rounded-full hover:bg-[#f8fafc] flex items-center justify-center text-[#9ca3af] transition-colors border border-[#e8edf5]"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1))}
                    className="w-10 h-10 rounded-full hover:bg-[#f8fafc] flex items-center justify-center text-[#9ca3af] transition-colors border border-[#e8edf5]"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div>
                  <h2 className="font-heading font-bold text-[28px] text-[#0f172a] capitalize">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <p className="font-sans text-[15px] text-[#6b7280]">Interactive Monthly Schedule</p>
                </div>
              </div>
              <button onClick={() => setShowMonthModal(false)} className="w-12 h-12 rounded-full hover:bg-[#f8fafc] flex items-center justify-center text-[#9ca3af] transition-colors">
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-7 gap-[12px] h-full">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="pb-4 text-center font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-widest">{day}</div>
                ))}
                
                {/* Dynamic Month Logic */}
                {(() => {
                  const year = currentMonth.getFullYear();
                  const month = currentMonth.getMonth();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const firstDay = new Date(year, month, 1).getDay();
                  const today = new Date();
                  
                  return (
                    <>
                      {/* Empty cells for padding */}
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-[#f8fafc]/30 rounded-[20px] min-h-[120px]" />
                      ))}
                      
                      {/* Actual Days */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateObj = new Date(year, month, day);
                        const dateStr = dateObj.toISOString().split('T')[0];
                        const dayEvents = events.filter(e => e.displayDate === dateStr);
                        const isCurrentDay = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                        return (
                          <div key={day} className={`bg-white border border-[#f1f5f9] rounded-[20px] min-h-[120px] p-4 flex flex-col gap-2 transition-all hover:shadow-md hover:border-[#0f4ff1]/30 ${isCurrentDay ? "bg-[#f8faff] border-[#0f4ff1]/20 ring-1 ring-[#0f4ff1]/10" : ""}`}>
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full font-heading font-bold text-[14px] ${
                              isCurrentDay ? "bg-[#0f4ff1] text-white" : "text-[#0f172a]"
                            }`}>
                              {day}
                            </span>
                            {dayEvents.map(ev => (
                              <div key={ev.id} className={`p-2 rounded-[10px] border-l-2 ${
                                ev.type === 'webinar' ? "bg-[#eff4fe] border-[#0f4ff1]" : 
                                ev.type === 'milestone' ? "bg-[#fff7ed] border-[#ea580c]" :
                                "bg-[#f5f3ff] border-[#7c3aed]"
                              }`}>
                                <p className={`font-sans font-bold text-[10px] line-clamp-2 leading-tight ${
                                  ev.type === 'webinar' ? "text-[#0f4ff1]" : 
                                  ev.type === 'milestone' ? "text-[#ea580c]" :
                                  "text-[#7c3aed]"
                                }`}>{ev.title}</p>
                                <span className="font-sans font-medium text-[9px] text-[#9ca3af] mt-1 block">{ev.displayTime}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
