"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Megaphone, 
  CheckCircle, 
  Loader2, 
  Clock, 
  Globe, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  CalendarDays, 
  Plus, 
  Link as LinkIcon, 
  Pencil 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { BackButton } from "@/components/ui/BackButton";
import { useToast } from "@/hooks/use-toast";

type AdminTab = 'Broadcasts' | 'Schedule';

export default function AnnouncementsAdminPage() {
  const { success, error } = useToast();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<AdminTab>('Broadcasts');
  
  // Announcements State
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [pastAnnouncements, setPastAnnouncements] = useState<any[]>([]);
  const [isLoadingPast, setIsLoadingPast] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Schedule State
  const [sessions, setSessions] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [activeManager, setActiveManager] = useState<'Webinars' | 'Calendar'>('Webinars');
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'announcement' | 'webinar' | 'calendar' } | null>(null);

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const fetchData = async () => {
    if (activeTab === 'Broadcasts') {
      setIsLoadingPast(true);
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(10);
      setPastAnnouncements(data || []);
      setIsLoadingPast(false);
    } else {
      setIsLoadingSchedule(true);
      const { data: wData } = await supabase.from("webinar_sessions").select("*").order("session_date", { ascending: true });
      if (wData) setSessions(wData);
      const { data: cData } = await supabase.from("calendar_events").select("*").order("event_date", { ascending: true });
      if (cData) setCalendarEvents(cData);
      setIsLoadingSchedule(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // ─── Announcement Handlers ──────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        error("Image must be under 2MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const triggerGlobalAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || null;

      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('announcement-images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('announcement-images').getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { error: insertError } = await supabase.from("announcements").insert({
        title: headline,
        body_html: body,
        image_url: imageUrl,
        type: "Announcement",
        target_scope: "all",
        created_by: userId,
        published_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;
      success("Announcement published!");
      setSent(true);
      setHeadline(""); setBody(""); setImageFile(null); setImagePreview(null);
      setTimeout(() => setSent(false), 3000);
      fetchData();
    } catch (err: any) {
      error(err.message || "Failed to broadcast.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const { error: delError } = await supabase.from("announcements").delete().eq("id", id);
    if (!delError) {
      success("Deleted.");
      setPastAnnouncements(prev => prev.filter(a => a.id !== id));
      setDeleteConfirm(null);
    }
  };

  // ─── Schedule Handlers ──────────────────────────────────────────────────────
  const handleScheduleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (activeManager === 'Webinars') {
      const data = {
        title: formData.get("title"),
        session_date: formData.get("date"),
        session_time: formData.get("time"),
        join_url: formData.get("url"),
        description: formData.get("description"),
      };
      const promise = editingEvent 
        ? supabase.from("webinar_sessions").update(data).eq("id", editingEvent.id)
        : supabase.from("webinar_sessions").insert(data);
      
      const { error: err } = await promise;
      if (err) error(err.message);
      else { success(editingEvent ? "Updated" : "Scheduled"); setEditingEvent(null); setIsAddingEvent(false); fetchData(); }
    } else {
      const data = {
        event_title: formData.get("title"),
        event_date: `${formData.get("date")}T${formData.get("time")}`,
        event_type: formData.get("type"),
        description: formData.get("description"),
        join_url: formData.get("url"),
      };
      const promise = editingEvent 
        ? supabase.from("calendar_events").update(data).eq("id", editingEvent.id)
        : supabase.from("calendar_events").insert({ ...data, student_id: (await supabase.auth.getUser()).data.user?.id });
      
      const { error: err } = await promise;
      if (err) error(err.message);
      else { success(editingEvent ? "Updated" : "Scheduled"); setEditingEvent(null); setIsAddingEvent(false); fetchData(); }
    }
  };

  const handleDeleteEvent = async (id: string, type: 'webinar' | 'calendar') => {
    const table = type === 'webinar' ? "webinar_sessions" : "calendar_events";
    const { error: err } = await supabase.from(table).delete().eq("id", id);
    if (!err) { 
      success("Removed."); 
      fetchData(); 
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="w-full flex-1 max-w-4xl pb-10">
      <BackButton fallbackPath="/admin" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">
            Communications & Events
          </h1>
          <p className="font-sans font-normal text-[15px] text-[#6b7280]">
            Broadcast announcements and manage the student schedule.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 md:gap-8 border-b border-[#e8edf5] mb-8 overflow-x-auto scrollbar-hide whitespace-nowrap">
        <button 
          onClick={() => setActiveTab('Broadcasts')}
          className={`pb-4 font-heading font-bold text-[14px] md:text-[15px] relative transition-colors ${activeTab === 'Broadcasts' ? "text-[#0f4ff1]" : "text-[#6b7280] hover:text-[#0f172a]"}`}
        >
          Broadcasts
          {activeTab === 'Broadcasts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f4ff1]" />}
        </button>
        <button 
          onClick={() => setActiveTab('Schedule')}
          className={`pb-4 font-heading font-bold text-[14px] md:text-[15px] relative transition-colors ${activeTab === 'Schedule' ? "text-[#0f4ff1]" : "text-[#6b7280] hover:text-[#0f172a]"}`}
        >
          Event Schedule
          {activeTab === 'Schedule' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f4ff1]" />}
        </button>
      </div>

      {activeTab === 'Broadcasts' ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white border border-[#e8edf5] rounded-[16px] p-6 md:p-8 flex flex-col mb-8 shadow-sm">
            <form onSubmit={triggerGlobalAnnouncement} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-sans font-medium text-[13px] text-[#0f172a]">Headline</label>
                    <input type="text" placeholder="Special Update!" value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full h-[44px] px-4 rounded-[12px] border border-[#e8edf5] focus:border-[#0f4ff1] outline-none" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-sans font-medium text-[13px] text-[#0f172a]">Message</label>
                    <textarea className="w-full h-[120px] p-4 rounded-[12px] border border-[#e8edf5] focus:border-[#0f4ff1] outline-none resize-none" placeholder="Details..." value={body} onChange={(e) => setBody(e.target.value)} required />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans font-medium text-[13px] text-[#0f172a]">Cover Image</label>
                  <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-[#e8edf5] rounded-[16px] flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-[#f9fafb] relative overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-[#cbd5e1] mb-2" />
                        <span className="text-[13px] text-[#6b7280]">Click to upload</span>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isSending || sent} className="h-[44px] px-6 bg-[#0f4ff1] text-white font-heading font-semibold text-[14px] rounded-[12px] hover:bg-[#093094] flex items-center gap-2 w-fit">
                {isSending ? <Loader2 className="animate-spin" /> : <Megaphone size={16} />}
                {sent ? "Published!" : "Broadcast to All Students"}
              </button>
            </form>
          </div>
          
          <h2 className="font-heading font-bold text-[18px] text-[#0f172a] mb-4">Broadcast History</h2>
          {isLoadingPast ? <Loader2 className="animate-spin mx-auto mt-8" /> : (
            <div className="flex flex-col gap-3">
              {pastAnnouncements.map(ann => (
                <div key={ann.id} className="bg-white border border-[#e8edf5] rounded-[14px] p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4 truncate">
                    {ann.image_url ? <img src={ann.image_url} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-[#eff4fe] rounded-lg flex items-center justify-center"><Megaphone className="text-[#0f4ff1]" size={20} /></div>}
                    <div className="truncate">
                      <p className="font-heading font-bold text-[14px] truncate">{ann.title}</p>
                      <p className="font-sans text-[12px] text-[#6b7280] truncate">{ann.body_html}</p>
                    </div>
                  </div>
                  <button onClick={() => setDeleteConfirm({ id: ann.id, type: 'announcement' })} className="text-[#9ca3af] hover:text-[#ef4444] p-1"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-4 bg-[#f1f5f9] p-1 rounded-xl w-fit">
                <button onClick={() => setActiveManager('Webinars')} className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${activeManager === 'Webinars' ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"}`}>Webinars</button>
                <button onClick={() => setActiveManager('Calendar')} className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${activeManager === 'Calendar' ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"}`}>Meetings</button>
              </div>
              <button onClick={() => setIsAddingEvent(true)} className="bg-[#0f4ff1] text-white h-[40px] px-4 rounded-[10px] font-heading font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-[#093094] w-full md:w-fit">
                <Plus size={16} /> Add {activeManager === 'Webinars' ? 'Webinar' : 'Meeting'}
              </button>
           </div>

           {isLoadingSchedule ? <Loader2 className="animate-spin mx-auto" /> : (
             <div className="flex flex-col gap-3">
               {(activeManager === 'Webinars' ? sessions : calendarEvents).map(s => (
                 <div key={s.id} className="bg-white border border-[#e8edf5] rounded-[16px] p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${activeManager === 'Webinars' ? "bg-[#eff4fe] text-[#0f4ff1]" : "bg-[#f5f3ff] text-[#7c3aed]"}`}>
                        <span className="text-[14px] font-bold">{new Date(s.session_date || s.event_date).getDate()}</span>
                        <span className="text-[9px] font-bold uppercase">{new Date(s.session_date || s.event_date).toLocaleString('default', {month:'short'})}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-bold text-[15px] truncate">{s.title || s.event_title}</p>
                        <p className="font-sans text-[12px] text-[#6b7280] flex items-center gap-2">
                           <Clock size={12} /> {s.session_time?.slice(0,5) || new Date(s.event_date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                       <button onClick={() => setEditingEvent(s)} className="p-2 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"><Pencil size={16} /></button>
                       <button onClick={() => setDeleteConfirm({ id: s.id, type: activeManager === 'Webinars' ? 'webinar' : 'calendar' })} className="p-2 text-[#ef4444] hover:bg-[#fef2f2] rounded-lg"><Trash2 size={16} /></button>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="bg-white rounded-[20px] p-6 w-full max-w-sm relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-heading font-bold text-[18px] text-[#0f172a] mb-2">Are you sure?</h3>
            <p className="font-sans text-[14px] text-[#6b7280] mb-6">This action cannot be undone. This item will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-11 rounded-xl font-bold text-[#64748b] hover:bg-[#f8fafc] transition-colors">Cancel</button>
              <button 
                onClick={() => {
                  if (deleteConfirm.type === 'announcement') handleDeleteAnnouncement(deleteConfirm.id);
                  else handleDeleteEvent(deleteConfirm.id, deleteConfirm.type);
                }}
                className="flex-1 h-11 bg-[#ef4444] text-white rounded-xl font-bold hover:bg-[#dc2626] transition-colors shadow-lg shadow-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {(isAddingEvent || editingEvent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setIsAddingEvent(false); setEditingEvent(null); }} />
          <div className="bg-white w-full max-w-md rounded-[24px] p-8 relative z-10 shadow-xl">
             <h3 className="font-heading font-bold text-[20px] mb-6">{editingEvent ? "Edit" : "Schedule"} {activeManager === 'Webinars' ? "Webinar" : "Meeting"}</h3>
             <form onSubmit={handleScheduleSubmit} className="flex flex-col gap-4">
               <div>
                 <label className="text-[13px] font-medium text-[#6b7280] mb-1.5 block">Title</label>
                 <input name="title" defaultValue={editingEvent?.title || editingEvent?.event_title} required className="w-full h-11 px-4 border border-[#e8edf5] rounded-xl outline-none focus:border-[#0f4ff1]" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[13px] font-medium text-[#6b7280] mb-1.5 block">Date</label>
                   <input name="date" type="date" defaultValue={editingEvent?.session_date || editingEvent?.event_date?.split('T')[0]} required className="w-full h-11 px-4 border border-[#e8edf5] rounded-xl outline-none" />
                 </div>
                 <div>
                   <label className="text-[13px] font-medium text-[#6b7280] mb-1.5 block">Time</label>
                   <input name="time" type="time" defaultValue={editingEvent?.session_time || (editingEvent?.event_date ? new Date(editingEvent.event_date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}) : '')} required className="w-full h-11 px-4 border border-[#e8edf5] rounded-xl outline-none" />
                 </div>
               </div>
               {activeManager === 'Calendar' && (
                 <div>
                   <label className="text-[13px] font-medium text-[#6b7280] mb-1.5 block">Type</label>
                   <select name="type" defaultValue={editingEvent?.event_type || 'meeting'} className="w-full h-11 px-4 border border-[#e8edf5] rounded-xl outline-none bg-white">
                      <option value="meeting">Meeting</option>
                      <option value="deadline">Deadline</option>
                      <option value="milestone">Milestone</option>
                   </select>
                 </div>
               )}
               <div>
                 <label className="text-[13px] font-medium text-[#6b7280] mb-1.5 block">Join Link (Optional)</label>
                 <input name="url" defaultValue={editingEvent?.join_url} type="url" placeholder="https://..." className="w-full h-11 px-4 border border-[#e8edf5] rounded-xl outline-none" />
               </div>
               <div>
                 <label className="text-[13px] font-medium text-[#6b7280] mb-1.5 block">Description</label>
                 <textarea name="description" defaultValue={editingEvent?.description} className="w-full h-24 p-4 border border-[#e8edf5] rounded-xl outline-none resize-none" />
               </div>
               <div className="flex gap-3 mt-4">
                 <button type="button" onClick={() => { setIsAddingEvent(false); setEditingEvent(null); }} className="flex-1 h-12 font-bold text-[#64748b] hover:bg-[#f8fafc] rounded-xl">Cancel</button>
                 <button type="submit" className="flex-1 h-12 bg-[#0f4ff1] text-white font-bold rounded-xl shadow-lg shadow-blue-100">Save</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
