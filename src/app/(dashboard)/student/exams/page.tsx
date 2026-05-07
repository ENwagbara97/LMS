"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, BookOpen, Award, CheckCircle, RefreshCcw, ArrowUpRight } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import Link from "next/link";

export default function ExamsQuizzesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    gp: 0,
    total: 0,
    best: 0
  });

  const calculateGP = (score: number) => {
    if (score >= 90) return 4.0;
    if (score >= 80) return 3.5;
    if (score >= 70) return 3.0;
    if (score >= 60) return 2.0;
    if (score >= 50) return 1.0;
    return 0.0;
  };

  const loadQuizData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: results, error } = await supabase
      .from("quiz_results")
      .select(`
        *,
        lessons (
          id,
          title,
          course_id,
          courses (title)
        )
      `)
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (results) {
      const formatted = results.map(r => ({
        ...r,
        title: r.lessons?.title || "Unknown Lesson",
        course: r.lessons?.courses?.title || "Unknown Course",
        gp: calculateGP(r.score_percent),
        date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: r.score_percent >= 70 ? "Passed" : "Retake"
      }));

      setHistory(formatted);

      // Calculate Stats
      const total = results.length;
      const best = total > 0 ? Math.max(...results.map(r => Number(r.score_percent))) : 0;
      const totalGP = formatted.reduce((acc, curr) => acc + curr.gp, 0);
      const avgGP = total > 0 ? Number((totalGP / total).toFixed(1)) : 0.0;

      setStats({
        gp: avgGP,
        total,
        best
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQuizData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-[#0f4ff1] mb-4" size={32} />
      <p className="font-sans text-[#6b7280]">Aggregating results node...</p>
    </div>
  );

  return (
    <div className="w-full flex-1 pb-20">
      <BackButton fallbackPath="/student" />

      <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] mb-[4px] leading-tight">Exams & Quizzes</h1>
      <p className="font-sans font-normal text-[15px] text-[#6b7280] mb-[32px]">Your academic performance tracking and grade history.</p>

      {/* Summary Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] mb-[40px]">
          <div className="bg-white border border-[#e8edf5] rounded-[20px] p-[28px] flex flex-col justify-center shadow-sm hover:shadow-md transition-all">
             <span className="font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-wider mb-2">Cumulative GP</span>
             <span className="font-heading font-extrabold text-[40px] text-[#0f4ff1] leading-none">{stats.gp.toFixed(1)}</span>
          </div>
          <div className="bg-white border border-[#e8edf5] rounded-[20px] p-[28px] flex flex-col justify-center shadow-sm hover:shadow-md transition-all">
             <span className="font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-wider mb-2">Quizzes Attempted</span>
             <span className="font-heading font-extrabold text-[40px] text-[#0f172a] leading-none">{stats.total}</span>
          </div>
          <div className="bg-white border border-[#e8edf5] rounded-[20px] p-[28px] flex flex-col justify-center shadow-sm hover:shadow-md transition-all">
             <span className="font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-wider mb-2">Top Percentile</span>
             <span className="font-heading font-extrabold text-[40px] text-[#16a34a] leading-none">{stats.best}<span className="text-[20px] font-bold">%</span></span>
          </div>
      </div>

      {/* History Table */}
      <h3 className="font-heading font-bold text-[20px] text-[#0f172a] mb-[20px] flex items-center gap-2">
        Academic History
        <span className="font-sans font-medium text-[13px] text-[#9ca3af]">({history.length} attempts)</span>
      </h3>
      
      <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#e8edf5] scrollbar-track-transparent">
        <div className="bg-white rounded-[20px] min-w-[850px] border border-[#f1f5f9] overflow-hidden shadow-sm">
           <div className="grid grid-cols-12 gap-4 px-[28px] py-[18px] bg-[#f9fafb] border-b border-[#f1f5f9]">
              <div className="col-span-4 font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-widest">Curriculum Node</div>
              <div className="col-span-2 font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-widest">Submission Date</div>
              <div className="col-span-1 font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-widest text-center">Score</div>
              <div className="col-span-2 font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-widest text-center">GP Weight</div>
              <div className="col-span-1 font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-widest text-center">Attempt</div>
              <div className="col-span-2 font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-widest text-right">Performance</div>
           </div>

           {history.length === 0 ? (
             <div className="py-20 text-center flex flex-col items-center">
                <BookOpen size={40} className="text-[#cbd5e1] mb-3" />
                <p className="font-heading font-semibold text-[#0f172a]">No quiz records yet</p>
                <p className="font-sans text-[14px] text-[#6b7280]">Complete your first lesson quiz to see your performance here.</p>
             </div>
           ) : (
             history.map((q, i) => (
               <div key={q.id} className="grid grid-cols-12 gap-4 px-[28px] py-[22px] items-center border-b border-[#f1f5f9] last:border-0 hover:bg-[#fafafc] transition-colors group">
                  <div className="col-span-4">
                    <h4 className="font-heading font-bold text-[15px] text-[#0f172a]">{q.title}</h4>
                    <span className="font-sans text-[12px] text-[#6b7280]">{q.course}</span>
                  </div>
                  <div className="col-span-2 font-sans font-medium text-[14px] text-[#6b7280]">{q.date}</div>
                  <div className="col-span-1 text-center">
                     <span className={`font-heading font-extrabold text-[16px] ${q.score_percent >= 70 ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
                       {q.score_percent}%
                     </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-sans font-bold text-[12px] ${q.gp >= 3.0 ? "bg-[#ecfdf5] text-[#16a34a]" : "bg-[#fef2f2] text-[#dc2626]"}`}>
                      {q.gp.toFixed(1)} GP
                    </div>
                  </div>
                  <div className="col-span-1 font-sans font-bold text-[14px] text-[#6b7280] text-center">{q.attempt_number || 1}</div>
                  
                  <div className="col-span-2 flex justify-end">
                     {q.status === "Passed" ? (
                       <Link 
                         href={`/student/courses/${q.lessons.course_id}/lessons/${q.lessons.id}`}
                         className="flex items-center gap-1.5 font-heading font-bold text-[13px] text-[#0f4ff1] hover:underline"
                       >
                         Review <ArrowUpRight size={14} />
                       </Link>
                     ) : (
                       <Link 
                         href={`/student/courses/${q.lessons.course_id}/lessons/${q.lessons.id}`}
                         className="h-[36px] px-5 bg-[#0f4ff1] text-white rounded-xl font-heading font-bold text-[12px] hover:bg-[#093094] transition-all flex items-center gap-2 shadow-sm"
                       >
                         <RefreshCcw size={14} /> Retake
                       </Link>
                     )}
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
