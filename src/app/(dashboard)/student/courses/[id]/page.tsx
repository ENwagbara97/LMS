"use client";

import React, { useState, useEffect } from "react";
import { 
  PlayCircle, CheckCircle, Lock, Clock, Award, 
  ChevronRight, Play, Info, ArrowLeft 
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/ui/BackButton";

export default function CourseOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { info } = useToast();
  
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const courseId = params.id;
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Fetch Course
      const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
      if (courseData) setCourse(courseData);

      // 2. Fetch Lessons
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('display_order', { ascending: true });
      if (lessonData) setLessons(lessonData);

      // 3. Fetch Progress
      if (user) {
        const { data: prog } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('student_id', user.id);
        if (prog) setProgress(prog);
      }
      setLoading(false);
    };
    fetchData();
  }, [params.id, supabase]);

  const getLessonStatus = (lessonId: string, index: number) => {
    const prog = progress.find(p => p.lesson_id === lessonId);
    if (prog?.completed) return "completed";
    
    // Logic for locking: first lesson is always unlocked, 
    // others require previous lesson to be completed.
    if (index === 0) return "available";
    
    const prevLessonId = lessons[index - 1]?.id;
    const prevProg = progress.find(p => p.lesson_id === prevLessonId);
    return (prevProg?.completed || prevProg?.watch_percent > 90) ? "available" : "locked";
  };

  const handleLessonClick = (lesson: any, status: string) => {
    if (status === "locked") {
      info("Complete the previous lesson to unlock this one.");
      return;
    }
    router.push(`/student/courses/${params.id}/lessons/${lesson.id}`);
  };

  const completedCount = progress.filter(p => p.completed && lessons.some(l => l.id === p.lesson_id)).length;
  const totalLessons = lessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (loading) return <div className="p-10 text-[#9ca3af]">Loading course curriculum...</div>;

  return (
    <div className="w-full flex-1 pb-20">
      <BackButton fallbackPath="/student/courses" label="Back to Courses" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Course Header & Lessons */}
        <div className="flex-1">
          <div className="mb-10">
            <div className="bg-[#eff4fe] text-[#0f4ff1] font-sans font-semibold text-[11px] uppercase tracking-[0.08em] h-[24px] rounded-full px-3 flex items-center inline-flex mb-4">
              {course?.category_tag || "LMS"}
            </div>
            <h1 className="font-heading font-extrabold text-[32px] md:text-[40px] text-[#0f172a] leading-tight mb-4">
              {course?.title}
            </h1>
            <p className="font-sans text-[16px] text-[#6b7280] leading-relaxed max-w-2xl">
              {course?.description}
            </p>
          </div>

          <h2 className="font-heading font-bold text-[20px] text-[#0f172a] mb-6 flex items-center gap-3">
            Course Content
            <span className="font-sans font-medium text-[13px] text-[#9ca3af]">{lessons.length} Lessons</span>
          </h2>

          <div className="flex flex-col gap-3">
            {lessons.map((lesson, idx) => {
              const status = getLessonStatus(lesson.id, idx);
              return (
                <div 
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson, status)}
                  className={`flex items-center gap-4 p-4 border rounded-[16px] transition-all group cursor-pointer ${
                    status === "locked" 
                      ? "bg-[#f8fafc] border-[#f1f5f9] opacity-60" 
                      : "bg-white border-[#e8edf5] hover:border-[#0f4ff1] hover:shadow-md"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    status === "completed" ? "bg-[#ecfdf5] text-[#16a34a]" : 
                    status === "locked" ? "bg-[#f1f5f9] text-[#9ca3af]" : 
                    "bg-[#eff4fe] text-[#0f4ff1]"
                  }`}>
                    {status === "completed" ? <CheckCircle size={20} /> :
                     status === "locked" ? <Lock size={18} /> :
                     <Play size={18} className="fill-current" />}
                  </div>

                  <div className="flex-1">
                    <h4 className={`font-heading font-bold text-[15px] ${status === "locked" ? "text-[#6b7280]" : "text-[#0f172a]"}`}>
                      {lesson.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5 text-[#9ca3af] font-sans text-[12px]">
                        <Clock size={12} />
                        <span>14:22</span>
                      </div>
                    </div>
                  </div>

                  {status !== "locked" && (
                    <ChevronRight size={18} className="text-[#cbd5e1] group-hover:text-[#0f4ff1] transition-colors" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Progress Sidebar */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="bg-white border border-[#e8edf5] rounded-[20px] p-6 sticky top-6 shadow-sm">
            <h3 className="font-heading font-bold text-[18px] text-[#0f172a] mb-6">Your Progress</h3>
            
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans font-semibold text-[13px] text-[#0f172a]">{progressPercent}% Complete</span>
              <span className="font-sans font-medium text-[12px] text-[#6b7280]">{completedCount}/{totalLessons} Lessons</span>
            </div>
            
            <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden mb-8">
              <div 
                className="h-full bg-[#0f4ff1] rounded-full transition-all duration-1000" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#f8faff] rounded-[12px] border border-[#eff4fe]">
                <Award size={20} className="text-[#0f4ff1]" />
                <div>
                  <p className="font-heading font-bold text-[13px] text-[#0f172a]">Certification</p>
                  <p className="font-sans text-[11px] text-[#6b7280]">Complete course to unlock</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  const firstIncomplete = lessons.find((l, i) => getLessonStatus(l.id, i) !== "locked" && !progress.find(p => p.lesson_id === l.id && p.completed));
                  if (firstIncomplete) {
                    router.push(`/student/courses/${params.id}/lessons/${firstIncomplete.id}`);
                  } else if (lessons.length > 0) {
                    router.push(`/student/courses/${params.id}/lessons/${lessons[0].id}`);
                  }
                }}
                className="w-full bg-[#0f4ff1] text-white h-[48px] rounded-[12px] font-heading font-semibold text-[14px] hover:bg-[#093094] transition-colors"
              >
                Resume Learning
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
