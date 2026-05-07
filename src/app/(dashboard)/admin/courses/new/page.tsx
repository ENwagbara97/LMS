"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, UploadCloud, Link as LinkIcon, Video, Trash2, GripVertical, Plus, ChevronDown, ChevronUp, Loader2, Image as ImageIcon, Pencil, Sparkles, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoPlayer } from '@/components/features/video/VideoPlayer';
import { createClient } from '@/utils/supabase/client';
import { BackButton } from '@/components/ui/BackButton';
import { useSearchParams } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Module {
  id: string;
  title: string;
  description: string;
  display_order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  video_url: string;
  video_source_type: 'upload' | 'youtube';
  duration_seconds: number;
  serial_number: number;
  display_order: number;
  resources?: { title: string; url: string; file_type: string }[];
}

export default function NewCoursePage() {
  const { success, error } = useToast();
  const supabase = createClient();
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [course, setCourse] = useState({ 
    title: '', 
    desc: '', 
    difficulty: 'Beginner', 
    course_group: '', 
    thumbnail_url: '',
    total_duration_minutes: 0,
    total_videos: 0
  });

  const [modules, setModules] = useState<Module[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingGroups, setExistingGroups] = useState<string[]>([]);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  // Load existing course groups for autocomplete
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Groups
      const { data: groupData } = await supabase.from('courses').select('course_group').not('course_group', 'is', null);
      if (groupData) {
        const groups = Array.from(new Set(groupData.map(d => d.course_group))).filter(Boolean) as string[];
        setExistingGroups(groups);
      }

      // If Editing, Fetch Course Data
      if (editId) {
        const { data: cData } = await supabase.from('courses').select('*').eq('id', editId).single();
        if (cData) {
          setCourse({
            title: cData.title,
            desc: cData.description,
            difficulty: cData.level || 'Beginner',
            course_group: cData.course_group || '',
            thumbnail_url: cData.thumbnail_url || '',
            total_duration_minutes: cData.total_duration_minutes,
            total_videos: cData.total_videos
          });

          // Fetch Modules & Lessons
          const { data: mData } = await supabase
            .from('course_modules')
            .select(`
              *,
              lessons (*)
            `)
            .eq('course_id', editId)
            .order('display_order', { ascending: true });
          
          if (mData) {
            setModules(mData.map(m => ({
              id: m.id,
              title: m.title,
              description: m.description,
              display_order: m.display_order,
              lessons: (m.lessons || []).sort((a: any, b: any) => a.display_order - b.display_order).map((l: any) => ({
                id: l.id,
                title: l.title,
                video_url: l.video_url,
                video_source_type: l.video_source_type,
                duration_seconds: l.duration_seconds,
                serial_number: l.serial_number,
                display_order: l.display_order,
                resources: l.manual_resources_json || []
              }))
            })));
          }
        }
      }
    };
    fetchData();
  }, [editId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const updated = arrayMove(items, oldIndex, newIndex);
        return updated.map((m, idx) => ({ ...m, display_order: idx }));
      });
    }
  };

  const addModule = () => {
    const newModule: Module = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      display_order: modules.length,
      lessons: []
    };
    setModules([...modules, newModule]);
  };

  const updateModule = (id: string, field: keyof Module, value: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const deleteModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const addLesson = (moduleId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        const newLesson: Lesson = {
          id: crypto.randomUUID(),
          title: '',
          video_url: '',
          video_source_type: 'youtube',
          duration_seconds: 0,
          serial_number: m.lessons.length + 1,
          display_order: m.lessons.length,
          resources: []
        };
        return { ...m, lessons: [...m.lessons, newLesson] };
      }
      return m;
    }));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 20MB limit (20 * 1024 * 1024 bytes)
    if (file.size > 20 * 1024 * 1024) {
      error("Thumbnail is too large. Maximum size is 20MB.");
      return;
    }

    setUploadingThumb(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('course-thumbnails')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('course-thumbnails').getPublicUrl(fileName);
      setCourse({ ...course, thumbnail_url: publicUrl });
      success("Thumbnail uploaded successfully");
    } catch (err: any) {
      console.error("Upload error:", err);
      error(err.message || "Thumbnail upload failed. Please check your connection.");
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleAction = async (isDraft: boolean) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Upsert Course
      const coursePayload = {
        id: editId || undefined,
        title: course.title || 'Untitled Course',
        description: course.desc,
        difficulty: course.difficulty,
        course_group: course.course_group || null,
        level: course.difficulty || null,
        thumbnail_url: course.thumbnail_url || null,
        total_videos: modules.reduce((acc, m) => acc + m.lessons.length, 0),
        total_duration_minutes: Math.round(modules.reduce((acc, m) => acc + m.lessons.reduce((a, l) => a + (l.duration_seconds || 0), 0), 0) / 60),
        created_by: user.id
      };
      const { data: courseData, error: insertError } = await supabase.from('courses').upsert(coursePayload).select().single();
      if (insertError) {
        console.error('Course save error:', insertError);
        throw new Error(insertError.message);
      }

      // insertError already handled above

      // 2. Create Modules & Lessons
      for (const mod of modules) {
        const { data: modData, error: modError } = await supabase.from('course_modules').upsert({
          id: (typeof mod.id === 'string' && mod.id.includes('-')) ? mod.id : undefined, // Check if it's a UUID
          course_id: courseData.id,
          title: mod.title || 'Untitled Module',
          description: mod.description,
          display_order: mod.display_order
        }).select().single();

        if (modError) throw modError;

        if (mod.lessons.length > 0) {
          const lessonsToInsert = mod.lessons.map((less, idx) => ({
            id: (typeof less.id === 'string' && less.id.includes('-')) ? less.id : undefined,
            course_id: courseData.id,
            module_id: modData.id,
            title: less.title || 'Untitled Lesson',
            video_url: less.video_url,
            video_source_type: less.video_source_type,
            duration_seconds: less.duration_seconds,
            manual_resources_json: less.resources || [],
            serial_number: less.serial_number,
            display_order: idx
          }));

          const { error: lessError } = await supabase.from('lessons').upsert(lessonsToInsert);
          if (lessError) throw lessError;
        }
      }

      success(isDraft ? "Draft saved successfully" : "Course published successfully!");
      if (!isDraft) {
        setTimeout(() => { window.location.href = '/admin'; }, 1500);
      }
    } catch (err: any) {
      error(`Failed to save: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1 max-w-4xl pb-20">
      <BackButton fallbackPath="/admin/courses" />
      <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] mb-2 leading-tight">
        {editId ? 'Edit Course' : 'Create New Course'}
      </h1>
      <p className="font-sans font-normal text-[15px] text-[#6b7280] mb-[32px]">
        {editId ? 'Modify your course structure and content.' : 'Structure your course with groups, modules, and lessons using standard hierarchies.'}
      </p>

      <div className="flex flex-col gap-8">
        {/* Basic Course Info */}
        <div className="bg-white border border-[#e8edf5] rounded-[16px] shadow-sm p-6 md:p-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex flex-col gap-2">
                <label className="font-sans font-medium text-[13px] text-[#0f172a]">Course Title</label>
                <input 
                  type="text" 
                  className="w-full h-[44px] px-4 font-sans text-[14px] rounded-[12px] border border-[#e8edf5] focus:border-[#0f4ff1] outline-none"
                  value={course.title}
                  onChange={(e) => setCourse({...course, title: e.target.value})}
                  placeholder="e.g. Master Class: Branding Design"
                />
             </div>
             <div className="flex flex-col gap-2">
                <label className="font-sans font-medium text-[13px] text-[#0f172a]">Course Group (Category)</label>
                <input 
                  list="course-groups"
                  type="text" 
                  className="w-full h-[44px] px-4 font-sans text-[14px] rounded-[12px] border border-[#e8edf5] focus:border-[#0f4ff1] outline-none"
                  value={course.course_group}
                  onChange={(e) => setCourse({...course, course_group: e.target.value})}
                  placeholder="e.g. Graphic Design"
                />
                <datalist id="course-groups">
                  {existingGroups.map(g => <option key={g} value={g} />)}
                </datalist>
             </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-sans font-medium text-[13px] text-[#0f172a]">Description</label>
            <textarea 
              className="w-full h-[100px] p-4 font-sans text-[14px] rounded-[12px] border border-[#e8edf5] focus:border-[#0f4ff1] outline-none resize-none"
              value={course.desc}
              onChange={(e) => setCourse({...course, desc: e.target.value})}
              placeholder="Provide a brief summary of the curriculum..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex flex-col gap-2">
                <label className="font-sans font-medium text-[13px] text-[#0f172a]">Difficulty Level</label>
                <select 
                  className="w-full h-[44px] px-4 font-sans text-[14px] rounded-[12px] border border-[#e8edf5] outline-none bg-white"
                  value={course.difficulty}
                  onChange={(e) => setCourse({...course, difficulty: e.target.value})}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
             </div>
              <div className="flex flex-col gap-2">
                <label className="font-sans font-medium text-[13px] text-[#0f172a]">Course Thumbnail (Max 20MB)</label>
                <div 
                  onClick={() => thumbInputRef.current?.click()}
                  className="w-full h-[120px] rounded-[16px] border-2 border-dashed border-[#e8edf5] bg-[#f8fafc] hover:bg-[#f1f5f9] transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
                >
                  {uploadingThumb ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-[#0f4ff1]" />
                      <span className="font-sans text-[12px] text-[#6b7280]">Uploading...</span>
                    </div>
                  ) : course.thumbnail_url ? (
                    <>
                      <img src={course.thumbnail_url} className="absolute inset-0 w-full h-full object-cover" alt="Thumb" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                         <span className="text-white font-heading font-bold text-[13px] flex items-center gap-2">
                           <ImageIcon size={16} /> Replace Image
                         </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={32} className="text-[#cbd5e1] mb-2" />
                      <span className="font-sans text-[13px] text-[#6b7280]">Click to upload course image</span>
                      <span className="font-sans text-[11px] text-[#9ca3af] mt-1 text-center">Standard course card preview</span>
                    </>
                  )}
                  <input type="file" ref={thumbInputRef} className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
                </div>
             </div>
          </div>
        </div>

        {/* Module Builder */}
        <div className="flex flex-col gap-4">
           <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-[20px] text-[#0f172a]">Course Modules</h2>
              <button 
                onClick={addModule}
                className="h-[36px] px-4 bg-[#eff4fe] text-[#0f4ff1] rounded-[8px] font-sans font-bold text-[12px] uppercase tracking-wider flex items-center gap-2 hover:bg-[#dbeafe] transition-colors"
              >
                 <Plus size={16} /> Add Module
              </button>
           </div>

           <DndContext 
             sensors={sensors}
             collisionDetection={closestCenter}
             onDragEnd={handleDragEnd}
           >
             <SortableContext 
               items={modules.map(m => m.id)}
               strategy={verticalListSortingStrategy}
             >
               <div className="flex flex-col gap-4">
                 {modules.map((mod) => (
                   <SortableModule 
                     key={mod.id} 
                     module={mod} 
                     onUpdate={updateModule}
                     onDelete={deleteModule}
                     onAddLesson={addLesson}
                     setModules={setModules}
                   />
                 ))}
                 {modules.length === 0 && (
                   <div className="py-12 border-2 border-dashed border-[#e8edf5] rounded-[20px] flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-[#f8fafc] rounded-full flex items-center justify-center mb-4 text-[#cbd5e1]">
                        <Plus size={24} />
                      </div>
                      <p className="font-heading font-semibold text-[#0f172a]">No modules added</p>
                      <p className="font-sans text-[13px] text-[#6b7280] mt-1">Start by adding a module to organize your lessons.</p>
                   </div>
                 )}
               </div>
             </SortableContext>
           </DndContext>
        </div>

        {/* Global Save */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#e8edf5]">
           <button 
             onClick={() => handleAction(true)}
             disabled={isSubmitting}
             className="h-[48px] px-6 border border-[#e8edf5] text-[#4b5563] font-heading font-semibold text-[14px] rounded-[12px] hover:bg-[#f9fafb]"
           >
             Save Draft
           </button>
           <button 
             onClick={() => handleAction(false)}
             disabled={isSubmitting}
             className="h-[48px] px-8 bg-[#0f4ff1] text-white font-heading font-semibold text-[14px] rounded-[12px] hover:bg-[#093094] flex items-center gap-2"
           >
             {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Publish Course</>}
           </button>
        </div>
      </div>
    </div>
  );
}

function SortableModule({ module, onUpdate, onDelete, onAddLesson, setModules }: { 
  module: Module, 
  onUpdate: any, 
  onDelete: any,
  onAddLesson: any,
  setModules: any
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1
  };

  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div ref={setNodeRef} style={style} className={`bg-white border border-[#e8edf5] rounded-[20px] overflow-hidden ${isDragging ? 'shadow-2xl' : 'shadow-sm'}`}>
      <div className="p-5 flex items-center gap-4 bg-[#fdfefe] border-b border-[#f1f5f9]">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-[#cbd5e1] hover:text-[#9ca3af]">
          <GripVertical size={20} />
        </button>
        <div className="flex-1 flex flex-col gap-1">
           <input 
             type="text"
             className="font-heading font-bold text-[16px] text-[#0f172a] bg-transparent outline-none placeholder:text-[#cbd5e1] w-full"
             placeholder="Module Title (e.g. Foundations of Typography)"
             value={module.title}
             onChange={(e) => onUpdate(module.id, 'title', e.target.value)}
           />
           <div className="flex items-center gap-3">
             <span className="bg-[#eff4fe] text-[#0f4ff1] font-sans font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
               {module.lessons.length} Lessons
             </span>
             <input 
               type="text"
               className="font-sans text-[12px] text-[#6b7280] bg-transparent outline-none placeholder:text-[#cbd5e1] flex-1"
               placeholder="Short description..."
               value={module.description}
               onChange={(e) => onUpdate(module.id, 'description', e.target.value)}
             />
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setIsExpanded(!isExpanded)}
             className="p-2 text-[#9ca3af] hover:text-[#0f172a] transition-colors"
           >
             {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
           </button>
           <button 
             onClick={() => onDelete(module.id)}
             className="p-2 text-[#9ca3af] hover:text-[#dc2626] transition-colors"
           >
             <Trash2 size={18} />
           </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 bg-white flex flex-col gap-3">
           <DndContext collisionDetection={closestCenter} onDragEnd={(e) => {
             const { active, over } = e;
             if (over && active.id !== over.id) {
               setModules((mods: Module[]) => mods.map(m => {
                 if (m.id === module.id) {
                   const oldIndex = m.lessons.findIndex(l => l.id === active.id);
                   const newIndex = m.lessons.findIndex(l => l.id === over.id);
                   return { ...m, lessons: arrayMove(m.lessons, oldIndex, newIndex) };
                 }
                 return m;
               }));
             }
           }}>
             <SortableContext items={module.lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
               {module.lessons.map((lesson) => (
                 <LessonCard 
                   key={lesson.id} 
                   lesson={lesson} 
                   onDelete={(id: string) => {
                     setModules((mods: Module[]) => mods.map(m => m.id === module.id ? { ...m, lessons: m.lessons.filter(l => l.id !== id) } : m));
                   }}
                   onUpdate={(id: string, updates: any) => {
                     setModules((mods: Module[]) => mods.map(m => m.id === module.id ? { ...m, lessons: m.lessons.map(l => l.id === id ? { ...l, ...updates } : l) } : m));
                   }}
                 />
               ))}
             </SortableContext>
           </DndContext>
           
           <button 
             onClick={() => onAddLesson(module.id)}
             className="w-full h-[48px] border-2 border-dashed border-[#e8edf5] rounded-[12px] flex items-center justify-center gap-2 text-[13px] font-sans font-semibold text-[#6b7280] hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all"
           >
             <Plus size={18} /> Add Lesson Video
           </button>
        </div>
      )}
    </div>
  );
}

function LessonCard({ lesson, onDelete, onUpdate }: { lesson: Lesson, onDelete: any, onUpdate: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1
  };

  const [isEditing, setIsEditing] = useState(!lesson.title);
  const [tempTitle, setTempTitle] = useState(lesson.title);
  const [tempUrl, setTempUrl] = useState(lesson.video_url);

  const getYoutubeThumb = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/default.jpg` : null;
  };

  const thumbUrl = lesson.video_source_type === 'youtube' ? getYoutubeThumb(lesson.video_url) : null;

  return (
    <div ref={setNodeRef} style={style} className={`flex flex-col md:flex-row md:items-center gap-4 p-4 border border-[#e8edf5] rounded-[14px] bg-white group ${isDragging ? 'shadow-lg ring-2 ring-[#0f4ff1]/10' : 'hover:border-[#cbd5e1]'}`}>
       <div className="flex items-center gap-4 w-full md:w-auto">
         <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-[#cbd5e1] group-hover:text-[#9ca3af] transition-colors">
           <GripVertical size={18} />
         </button>

         <div className="w-[32px] h-[32px] rounded-full bg-[#eff4fe] flex items-center justify-center font-mono text-[11px] font-bold text-[#0f4ff1] shrink-0">
           #{lesson.serial_number}
         </div>

         <div className="w-[48px] h-[48px] rounded-[8px] bg-[#f1f5f9] border border-[#e8edf5] overflow-hidden flex items-center justify-center shrink-0">
            {thumbUrl ? (
              <img src={thumbUrl} className="w-full h-full object-cover" alt="Video Thumb" />
            ) : (
              <Video size={20} className="text-[#cbd5e1]" />
            )}
         </div>
       </div>

       <div className="flex-1 flex flex-col gap-0.5 overflow-hidden w-full">
          {isEditing ? (
            <div className="flex flex-col gap-3">
               <input 
                 autoFocus
                 type="text"
                 className="font-heading font-semibold text-[14px] text-[#0f172a] bg-transparent border-b border-[#0f4ff1] outline-none w-full"
                 value={tempTitle}
                 onChange={(e) => setTempTitle(e.target.value)}
                 placeholder="Lesson Title"
               />
               <input 
                 type="text"
                 className="font-sans text-[12px] text-[#6b7280] bg-transparent border-b border-[#cbd5e1] outline-none w-full"
                 value={tempUrl}
                 onChange={(e) => setTempUrl(e.target.value)}
                 placeholder="Video URL (YouTube or direct link)"
               />
               
               {/* Resources Section */}
               <div className="flex flex-col gap-2 mt-2 bg-[#f8fafc] p-3 rounded-lg border border-[#e8edf5]">
                 <div className="flex items-center justify-between mb-1">
                   <label className="font-sans font-bold text-[10px] text-[#6b7280] uppercase tracking-wider">Lesson Materials</label>
                   <button 
                     onClick={async () => {
                       if (!tempTitle) return alert("Please enter a title first");
                       const supabase = createClient();
                       const { data, error } = await supabase.functions.invoke('generate-overview', {
                         body: { lesson_title: tempTitle, course_name: course.title }
                       });
                       if (!error && data.overview) {
                         onUpdate(lesson.id, { ai_overview: data.overview });
                         alert("AI Overview generated and saved!");
                       }
                     }}
                     className="flex items-center gap-1 text-[10px] font-bold text-[#7c3aed] hover:text-[#5b21b6] bg-[#f5f3ff] px-2 py-0.5 rounded-full border border-[#ddd6fe] transition-colors"
                   >
                     <Sparkles size={10} /> AI Magic
                   </button>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {(lesson.resources || []).map((res, i) => (
                     <div key={i} className="flex items-center gap-2 bg-white px-2 py-1 rounded-md border border-[#e8edf5] text-[11px] font-medium text-[#4b5563]">
                       <File size={12} />
                       <span className="max-w-[100px] truncate">{res.title}</span>
                       <button onClick={() => {
                         const newRes = (lesson.resources || []).filter((_, idx) => idx !== i);
                         onUpdate(lesson.id, { resources: newRes });
                       }} className="text-[#ef4444] hover:text-[#b91c1c] ml-1">×</button>
                     </div>
                   ))}
                   <label className="flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-[#cbd5e1] text-[11px] text-[#9ca3af] hover:border-[#0f4ff1] hover:text-[#0f4ff1] cursor-pointer transition-colors">
                     <Plus size={12} /> Add File
                     <input 
                       type="file" 
                       className="hidden" 
                       onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (!file) return;
                         const supabase = createClient();
                         const fileExt = file.name.split('.').pop();
                         const fileName = `${crypto.randomUUID()}.${fileExt}`;
                         const { error: err } = await supabase.storage.from('lesson-materials').upload(fileName, file);
                         if (!err) {
                           const { data: { publicUrl } } = supabase.storage.from('lesson-materials').getPublicUrl(fileName);
                           const newRes = [...(lesson.resources || []), { title: file.name, url: publicUrl, file_type: fileExt || '' }];
                           onUpdate(lesson.id, { resources: newRes });
                         }
                       }} 
                     />
                   </label>
                 </div>
               </div>

               <div className="flex gap-3 mt-1">
                 <button 
                   onClick={() => {
                     const isYT = tempUrl.includes('youtube.com') || tempUrl.includes('youtu.be');
                     onUpdate(lesson.id, { 
                       title: tempTitle, 
                       video_url: tempUrl, 
                       video_source_type: isYT ? 'youtube' : 'upload' 
                     });
                     setIsEditing(false);
                   }}
                   className="text-[11px] font-bold text-[#0f4ff1] hover:underline"
                 >
                   Save
                 </button>
                 <button onClick={() => setIsEditing(false)} className="text-[11px] font-bold text-[#6b7280] hover:underline">Cancel</button>
               </div>
            </div>
          ) : (
            <>
               <span className="font-heading font-bold text-[14px] text-[#0f172a] truncate">{lesson.title || "Untitled Lesson"}</span>
               <div className="flex items-center gap-2 text-[12px] text-[#9ca3af]">
                  <span className="font-mono">{lesson.duration_seconds > 0 ? `${Math.floor(lesson.duration_seconds/60)}m ${lesson.duration_seconds%60}s` : '0m 00s'}</span>
                  <span className="w-1 h-1 rounded-full bg-[#cbd5e1]" />
                  <span className="truncate">{lesson.video_source_type === 'youtube' ? 'YouTube' : 'Upload'}</span>
                  {lesson.resources && lesson.resources.length > 0 && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-[#cbd5e1]" />
                      <span className="flex items-center gap-1 text-[#0f4ff1] font-medium">
                        <File size={10} /> {lesson.resources.length} Materials
                      </span>
                    </>
                  )}
               </div>
            </>
          )}
       </div>

       {!isEditing && (
         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setIsEditing(true)} 
              className="p-2 text-[#9ca3af] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-lg transition-all"
              title="Edit Lesson"
            >
              <Pencil size={16} />
            </button>
            <button 
              onClick={() => { if(confirm("Delete this lesson?")) onDelete(lesson.id); }} 
              className="p-2 text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
              title="Delete Lesson"
            >
              <Trash2 size={16} />
            </button>
         </div>
       )}
    </div>
  );
}


