"use client";

import React, { useState, useEffect } from "react";
import { CalendarDays, Clock, Plus, Trash2, Link as LinkIcon, Loader2, Pencil } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminScheduleManager() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [activeManager, setActiveManager] = useState<'Webinars' | 'Calendar'>('Webinars');
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const supabase = createClient();
  const { success, error } = useToast();

  const fetchData = async () => {
    setLoading(true);
    // 1. Fetch Webinars
    const { data: wData } = await supabase
      .from("webinar_sessions")
      .select("*")
      .order("session_date", { ascending: true });
    if (wData) setSessions(wData);

    // 2. Fetch Calendar Events
    const { data: cData } = await supabase
      .from("calendar_events")
      .select("*")
      .order("event_date", { ascending: true });
    if (cData) setCalendarEvents(cData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (activeManager === 'Webinars') {
      const sessionData = {
        title: formData.get("title"),
        session_date: formData.get("date"),
        session_time: formData.get("time"),
        join_url: formData.get("url"),
        description: formData.get("description"),
      };

      if (editingSession) {
        const { error: err } = await supabase.from("webinar_sessions").update(sessionData).eq("id", editingSession.id);
        if (err) error(err.message);
        else { success("Session updated"); setEditingSession(null); fetchData(); }
      } else {
        const { error: err } = await supabase.from("webinar_sessions").insert(sessionData);
        if (err) error(err.message);
        else { success("Session scheduled"); setIsAdding(false); fetchData(); }
      }
    } else {
      const eventData = {
        event_title: formData.get("title"),
        event_date: `${formData.get("date")}T${formData.get("time")}`,
        event_type: formData.get("type"),
        description: formData.get("description"),
        join_url: formData.get("url"),
      };

      if (editingSession) {
        const { error: err } = await supabase.from("calendar_events").update(eventData).eq("id", editingSession.id);
        if (err) error(err.message);
        else { success("Event updated"); setEditingSession(null); fetchData(); }
      } else {
        const { error: err } = await supabase.from("calendar_events").insert({
          ...eventData,
          student_id: (await supabase.auth.getUser()).data.user?.id // Placeholder: in production, you'd select students
        });
        if (err) error(err.message);
        else { success("Event scheduled"); setIsAdding(false); fetchData(); }
      }
    }
  };

  const handleDelete = async (id: string, type: 'webinar' | 'calendar') => {
    const table = type === 'webinar' ? "webinar_sessions" : "calendar_events";
    const { error: err } = await supabase.from(table).delete().eq("id", id);
    if (err) error(err.message);
    else {
      success("Removed successfully");
      fetchData();
    }
  };

  return (
    <div className="w-full flex-1 pb-10">
      <div className="flex items-center justify-between mb-[32px]">
        <div>
          <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] mb-[8px] leading-tight">Schedule Manager</h1>
          <p className="font-sans font-normal text-[15px] text-[#6b7280]">Manage live webinars and workshop sessions.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#0f4ff1] text-white h-[44px] px-[20px] rounded-[12px] font-heading font-semibold text-[14px] hover:bg-[#093094] transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Session
        </button>
      </div>

      <div className="flex items-center gap-6 border-b border-[#e8edf5] mb-8">
        <button 
          onClick={() => setActiveManager('Webinars')}
          className={`pb-4 font-heading font-bold text-[15px] relative transition-colors ${activeManager === 'Webinars' ? "text-[#0f4ff1]" : "text-[#6b7280] hover:text-[#0f172a]"}`}
        >
          Webinars
          {activeManager === 'Webinars' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f4ff1]" />}
        </button>
        <button 
          onClick={() => setActiveManager('Calendar')}
          className={`pb-4 font-heading font-bold text-[15px] relative transition-colors ${activeManager === 'Calendar' ? "text-[#0f4ff1]" : "text-[#6b7280] hover:text-[#0f172a]"}`}
        >
          Calendar Events
          {activeManager === 'Calendar' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f4ff1]" />}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-[16px]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#0f4ff1]" />
          </div>
        ) : (activeManager === 'Webinars' ? sessions : calendarEvents).length === 0 ? (
          <div className="bg-white border border-[#e8edf5] rounded-[16px] p-20 flex flex-col items-center text-center">
            <CalendarDays size={48} className="text-[#e8edf5] mb-4" />
            <h3 className="font-heading font-bold text-[18px] text-[#0f172a]">No {activeManager.toLowerCase()} scheduled</h3>
            <p className="font-sans text-[14px] text-[#6b7280] mt-1">Click "Add Session" to create your first {activeManager === 'Webinars' ? 'webinar' : 'event'}.</p>
          </div>
        ) : (
          (activeManager === 'Webinars' ? sessions : calendarEvents).map((s) => (
            <div key={s.id} className="bg-white border border-[#e8edf5] rounded-[16px] p-[24px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-[20px]">
                <div className={`w-[56px] h-[56px] rounded-[14px] flex flex-col items-center justify-center shrink-0 ${activeManager === 'Webinars' ? "bg-[#eff4fe] text-[#0f4ff1]" : "bg-[#f5f3ff] text-[#7c3aed]"}`}>
                  <span className="font-heading font-bold text-[18px] leading-none">
                    {new Date(s.session_date || s.event_date).getDate()}
                  </span>
                  <span className="font-sans font-bold text-[10px] uppercase tracking-wider mt-1">
                    {new Date(s.session_date || s.event_date).toLocaleString('default', { month: 'short' })}
                  </span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[17px] text-[#0f172a]">{s.title || s.event_title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-[#6b7280]">
                      <Clock size={14} />
                      <span className="font-sans text-[13px]">{s.session_time?.slice(0, 5) || new Date(s.event_date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    {(s.join_url) && (
                      <div className="flex items-center gap-1.5 text-[#0f4ff1]">
                        <LinkIcon size={14} />
                        <a href={s.join_url} target="_blank" rel="noopener noreferrer" className="font-sans text-[13px] hover:underline">Join Link</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingSession(s)}
                    className="text-[#6b7280] p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => { if(confirm("Delete this?")) handleDelete(s.id, activeManager === 'Webinars' ? 'webinar' : 'calendar'); }}
                    className="text-[#ef4444] p-2 hover:bg-[#fef2f2] rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
            </div>
          ))
        )}
      </div>

      {(isAdding || editingSession) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setIsAdding(false); setEditingSession(null); }} />
          <div className="bg-white rounded-[24px] w-full max-w-md p-[32px] relative shadow-xl z-10 mx-4">
            <h2 className="font-heading font-bold text-[22px] text-[#0f172a] mb-[24px]">
              {editingSession ? 'Edit Session' : 'Schedule New Session'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[13px] font-medium text-[#6b7280]">Session Title</label>
                <input name="title" defaultValue={editingSession?.title} required type="text" placeholder="e.g. Portfolio Review" className="h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] focus:border-[#0f4ff1] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[13px] font-medium text-[#6b7280]">Date</label>
                  <input name="date" defaultValue={editingSession?.session_date || editingSession?.event_date?.split('T')[0]} required type="date" className="h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] focus:border-[#0f4ff1] outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[13px] font-medium text-[#6b7280]">Time</label>
                  <input name="time" defaultValue={editingSession?.session_time || (editingSession?.event_date ? new Date(editingSession.event_date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}) : '')} required type="time" className="h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] focus:border-[#0f4ff1] outline-none" />
                </div>
              </div>
              {activeManager === 'Calendar' && (
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[13px] font-medium text-[#6b7280]">Event Type</label>
                  <select name="type" defaultValue={editingSession?.event_type || 'meeting'} className="h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] focus:border-[#0f4ff1] outline-none bg-white">
                    <option value="meeting">Meeting</option>
                    <option value="deadline">Deadline</option>
                    <option value="milestone">Milestone</option>
                    <option value="event">Event</option>
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[13px] font-medium text-[#6b7280]">Join URL (Optional)</label>
                <input name="url" defaultValue={editingSession?.join_url} type="url" placeholder="https://zoom.us/j/..." className="h-[48px] border border-[#e8edf5] rounded-[10px] px-[16px] focus:border-[#0f4ff1] outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[13px] font-medium text-[#6b7280]">Description</label>
                <textarea name="description" defaultValue={editingSession?.description} className="h-[100px] border border-[#e8edf5] rounded-[10px] p-[16px] focus:border-[#0f4ff1] outline-none resize-none" placeholder="What is this session about?" />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => { setIsAdding(false); setEditingSession(null); }} className="flex-1 h-[48px] rounded-[12px] font-heading font-semibold text-[14px] text-[#6b7280] hover:bg-[#f8fafc]">Cancel</button>
                <button type="submit" className="flex-1 h-[48px] bg-[#0f4ff1] text-white rounded-[12px] font-heading font-semibold text-[14px] hover:bg-[#093094]">
                  {editingSession ? 'Update' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
