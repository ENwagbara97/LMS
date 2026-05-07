"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, ChevronDown, CheckCircle, Clock, Lock, Award, BookOpen } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export default function ProgressPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [stats, setStats] = useState({
    percent: 0,
    completedLessons: 0,
    totalLessons: 0,
    gpa: 0,
    daysActive: 0
  });

  useEffect(() => {
    const loadInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Enrollments
      const { data: enrollData } = await supabase
        .from("enrollments")
        .select(`
          *,
          courses (*)
        `)
        .eq("student_id", user.id);

      if (enrollData && enrollData.length > 0) {
        setEnrollments(enrollData);
        setSelectedCourse(enrollData[0]);
      } else {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;

    const loadCourseProgress = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch all lessons for this course
      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", selectedCourse.course_id)
        .order("order_index", { ascending: true });

      if (!lessonData) return;

      // 2. Fetch progress & quiz results for these lessons
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("student_id", user.id);

      const { data: quizData } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("student_id", user.id);

      // 3. Map everything together
      const mappedLessons = lessonData.map((lesson, idx) => {
        const prog = progressData?.find(p => p.lesson_id === lesson.id);
        const quiz = quizData?.find(q => q.lesson_id === lesson.id);
        
        let status = "Locked";
        if (prog?.completed) {
          status = "Completed";
        } else if (idx === 0 || (progressData?.find(p => p.lesson_id === lessonData[idx-1]?.id)?.completed)) {
          status = "In Progress";
        }

        return {
          ...lesson,
          percent: prog?.watch_percent || 0,
          score: quiz?.score_percent || null,
          status
        };
      });

      setLessons(mappedLessons);

      // 4. Calculate Stats
      const completed = mappedLessons.filter(l => l.status === "Completed").length;
      const total = mappedLessons.length;
      const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const calculateGP = (score: number) => {
        if (score >= 90) return 4.0;
        if (score >= 80) return 3.5;
        if (score >= 70) return 3.0;
        if (score >= 60) return 2.0;
        if (score >= 50) return 1.0;
        return 0.0;
      };

      const gpPoints = mappedLessons
        .filter(l => l.score !== null)
        .map(l => calculateGP(Number(l.score)));
      
      const avgGpa = gpPoints.length > 0 ? Number((gpPoints.reduce((a, b) => a + b, 0) / gpPoints.length).toFixed(1)) : 0.0;

      // Days active simulation
      const enrollDate = new Date(selectedCourse.enrolled_at);
      const diffTime = Math.abs(new Date().getTime() - enrollDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setStats({
        percent: progressPercent,
        completedLessons: completed,
        totalLessons: total,
        gpa: avgGpa,
        daysActive: diffDays
      });

      setLoading(false);
    };

    loadCourseProgress();
  }, [selectedCourse]);

  if (loading && !selectedCourse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#0f4ff1] mb-4" size={32} />
        <p className="font-sans text-[#6b7280]">Initializing progress node...</p>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="w-full flex-1">
        <BackButton fallbackPath="/student" />
        <div className="bg-white border border-[#e8edf5] rounded-[20px] p-12 text-center shadow-sm">
           <BookOpen size={48} className="mx-auto text-[#cbd5e1] mb-4" />
           <h2 className="font-heading font-bold text-[20px] text-[#0f172a]">No Enrollments Found</h2>
           <p className="font-sans text-[15px] text-[#6b7280] mt-2 mb-6">You are not currently enrolled in any curriculum tracks.</p>
           <a href="/student/courses" className="bg-[#0f4ff1] text-white px-6 py-2.5 rounded-xl font-heading font-semibold text-[14px] hover:bg-[#093094] transition-colors">Browse Courses</a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 pb-20">
      <BackButton fallbackPath="/student" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-[32px] gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">My Progress</h1>
          <p className="font-sans font-normal text-[15px] text-[#6b7280]">Real-time curriculum tracking and performance analytics.</p>
        </div>

        {enrollments.length > 1 && (
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-[#e8edf5] rounded-xl px-4 pr-10 py-2.5 font-heading font-semibold text-[14px] text-[#0f172a] focus:outline-none focus:border-[#0f4ff1] shadow-sm cursor-pointer"
              value={selectedCourse.id}
              onChange={(e) => setSelectedCourse(enrollments.find(en => en.id === e.target.value))}
            >
              {enrollments.map(en => (
                <option key={en.id} value={en.id}>{en.courses.title}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
          </div>
        )}
      </div>

      {/* Progress Card Overview */}
      <div className="bg-white border border-[#e8edf5] rounded-[16px] w-full flex flex-col md:flex-row p-[32px] gap-[48px] items-center mb-[40px] shadow-sm transition-all hover:shadow-md">
         
         {/* SVG Donut */}
         <div className="relative w-[140px] h-[140px] shrink-0">
           <svg viewBox="0 0 100 100" className="rotate-[-90deg] w-full h-full">
             <circle cx="50" cy="50" r="44" fill="transparent" stroke="#eff4fe" strokeWidth="10" />
             <circle 
                cx="50" cy="50" r="44" fill="transparent" stroke="#0f4ff1" strokeWidth="10" 
                strokeDasharray="276.46" 
                strokeDashoffset={276.46 - (276.46 * stats.percent) / 100} 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-out"
             />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-none">{stats.percent}<span className="text-[18px]">%</span></span>
           </div>
         </div>

         {/* Stats Row */}
         <div className="flex-1 flex flex-col w-full text-center md:text-left">
            <h2 className="font-heading font-bold text-[26px] text-[#0f172a] mb-6">{selectedCourse.courses.title}</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
               <div className="flex flex-col">
                 <span className="font-sans font-medium text-[13px] text-[#6b7280] mb-1">Lessons Done</span>
                 <span className="font-heading font-bold text-[22px] text-[#0f172a]">{stats.completedLessons} <span className="text-[#9ca3af] text-[16px]">/ {stats.totalLessons}</span></span>
               </div>
               
               <div className="w-[1px] h-10 bg-[#e8edf5] hidden md:block"></div>
               
               <div className="flex flex-col">
                 <span className="font-sans font-medium text-[13px] text-[#6b7280] mb-1">Grade Avg</span>
                 <span className="font-heading font-bold text-[22px] text-[#16a34a]">{stats.gpa} GPA</span>
               </div>
               
               <div className="w-[1px] h-10 bg-[#e8edf5] hidden md:block"></div>
               
               <div className="flex flex-col">
                 <span className="font-sans font-medium text-[13px] text-[#6b7280] mb-1">Days Active</span>
                 <span className="font-heading font-bold text-[22px] text-[#0f172a]">{stats.daysActive}</span>
               </div>
            </div>
         </div>
      </div>

      {/* Breakdown Table Header */}
      <h3 className="font-heading font-bold text-[18px] text-[#0f172a] mb-[16px]">Curriculum Breakdown</h3>
      
      {/* Table Container */}
      <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#e8edf5] scrollbar-track-transparent">
        <div className="bg-white rounded-[16px] min-w-[850px] border border-[#f1f5f9] overflow-hidden shadow-sm">
           <div className="grid grid-cols-12 gap-4 px-[24px] py-[16px] bg-[#f9fafb] border-b border-[#f1f5f9]">
              <div className="col-span-1 font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-wider">#</div>
              <div className="col-span-5 font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-wider">Lesson Title</div>
              <div className="col-span-3 font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-wider">Watch Progress</div>
              <div className="col-span-1 font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-wider">Quiz</div>
              <div className="col-span-2 font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-wider text-right">Status</div>
           </div>

           {lessons.map((les, i) => (
             <div key={les.id} className="grid grid-cols-12 gap-4 px-[24px] py-[18px] items-center border-b border-[#f1f5f9] last:border-0 hover:bg-[#fafafc] transition-colors">
                <div className="col-span-1 font-sans font-medium text-[14px] text-[#9ca3af]">{(i+1).toString().padStart(2, '0')}</div>
                <div className="col-span-5 flex items-center gap-3">
                   <div className={`p-1.5 rounded-lg shrink-0 ${les.status === "Completed" ? "bg-[#ecfdf5] text-[#16a34a]" : les.status === "In Progress" ? "bg-[#eff4fe] text-[#0f4ff1]" : "bg-[#f1f5f9] text-[#cbd5e1]"}`}>
                      {les.status === "Completed" ? <CheckCircle size={14} /> : les.status === "In Progress" ? <Clock size={14} /> : <Lock size={14} />}
                   </div>
                   <span className={`font-heading font-bold text-[15px] ${les.status === "Locked" ? "text-[#9ca3af]" : "text-[#0f172a]"}`}>{les.title}</span>
                </div>
                <div className="col-span-3 flex items-center pr-8">
                   <div className="w-full h-[6px] bg-[#f1f5f9] rounded-full mr-3">
                      <div className="h-full bg-[#0f4ff1] rounded-full transition-all duration-700" style={{ width: `${les.percent}%` }}></div>
                   </div>
                   <span className="font-sans font-medium text-[12px] text-[#6b7280] w-[32px] text-right">{les.percent}%</span>
                </div>
                <div className="col-span-1">
                  {les.score !== null ? (
                     <span className="font-heading font-semibold text-[15px] text-[#16a34a]">{les.score}%</span>
                  ) : (
                     <span className="font-sans font-medium text-[14px] text-[#d1d5db]">-</span>
                  )}
                </div>
                <div className="col-span-2 flex justify-end">
                   {les.status === "Completed" && <span className="bg-[#ecfdf5] text-[#16a34a] font-sans font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">Completed</span>}
                   {les.status === "In Progress" && <span className="bg-[#eff4fe] text-[#0f4ff1] font-sans font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">In Progress</span>}
                   {les.status === "Locked" && <span className="bg-[#f1f5f9] text-[#9ca3af] font-sans font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">Locked</span>}
                </div>
             </div>
           ))}

           {lessons.length === 0 && (
             <div className="py-20 text-center text-[#9ca3af] font-sans text-[14px]">
                No lessons found for this curriculum node.
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
