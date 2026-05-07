"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, 
  Captions, Maximize, PictureInPicture, CheckCircle,
  ChevronLeft, ChevronRight, Info, Check, FileText, 
  ExternalLink, Video, Box, File, Loader2
} from "lucide-react";
import { VideoPlayer } from "@/components/features/video/VideoPlayer";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type TabType = 'Overview' | 'Transcript' | 'Resources' | 'Notes';

export default function LessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  
  // Lesson & Notes Data
  const [lessonData, setLessonData] = useState<any>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [studentNotes, setStudentNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [quizData, setQuizData] = useState<any[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const fetchQuiz = async (lesson: any, course: any) => {
    setIsQuizLoading(true);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_title: lesson.title,
          lesson_description: lesson.description,
          course_name: course.title,
          difficulty_level: course.level,
          lesson_duration_seconds: lesson.duration_seconds
        })
      });
      const data = await res.json();
      if (data.questions) {
        setQuizData(data.questions);
      }
    } catch (err) {
      console.error("Failed to fetch quiz:", err);
    } finally {
      setIsQuizLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { lessonId, id: courseId } = params;

      // 1. Fetch Lesson Data
      const { data: lesson } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      if (lesson) setLessonData(lesson);

      // 2. Fetch Course & All Lessons for navigation
      const { data: course } = await supabase.from('courses').select('*').eq('id', courseId).single();
      if (course) {
        setCourseData(course);
        if (lesson) fetchQuiz(lesson, course);
      }

      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, title, order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      if (lessons) setAllLessons(lessons);

      // 3. Fetch Student Notes
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: notes } = await supabase
          .from('student_notes')
          .select('content')
          .eq('student_id', user.id)
          .eq('lesson_id', lessonId)
          .single();
        if (notes) setStudentNotes(notes.content);

        // 4. Check if already completed
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('completed')
          .eq('student_id', user.id)
          .eq('lesson_id', lessonId)
          .single();
        if (progress?.completed) {
          setIsVideoEnded(true);
          setIsQuizComplete(true);
        }
      }
    };
    fetchData();
  }, [params.lessonId, params.id, supabase]);

  const handleNotesChange = (val: string) => {
    setStudentNotes(val);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('student_notes').upsert({
          student_id: user.id,
          lesson_id: params.lessonId,
          content: val,
          updated_at: new Date().toISOString()
        });
        setIsSaving(false);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      }
    }, 2000);
  };

  const handleVideoEnded = async () => {
    setIsVideoEnded(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user && lessonData) {
      await supabase.from('lesson_progress').upsert({
        student_id: user.id,
        lesson_id: params.lessonId,
        watch_percent: 100,
        last_position_seconds: lessonData.duration_seconds || 862,
        completed: true,
        completed_at: new Date().toISOString()
      }, { onConflict: 'student_id, lesson_id' });
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === quizData[qIndex].correct_index) {
      if (qIndex < quizData.length - 1) {
        setQIndex(qIndex + 1);
        setSelectedAnswer(null);
        setScore(score + 1);
      } else {
        const finalScore = score + 1;
        const percentage = Math.round((finalScore / quizData.length) * 100);
        setQuizFinished(true);
        setIsQuizComplete(true);
        
        const saveQuizResult = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('quiz_results').insert({
              student_id: user.id,
              lesson_id: params.lessonId,
              score_percent: percentage,
              answers_json: { score: finalScore, total: quizData.length }
            });
          }
        };
        saveQuizResult();
      }
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }
  };

  const currentIdx = allLessons.findIndex(l => l.id === params.lessonId);
  const prevLesson = allLessons[currentIdx - 1];
  const nextLesson = allLessons[currentIdx + 1];
  const isNextDisabled = !isVideoEnded || !isQuizComplete;

  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const startTime = parseInt(searchParams.get('t') || '0');

  return (
    <div className="w-full flex-1 pb-20 md:pb-10 relative overflow-x-hidden">
      <div className="flex flex-col xl:flex-row gap-6 w-full transition-all duration-500 ease-in-out">
        <div className={`transition-all duration-500 ease-in-out ${isVideoEnded ? "w-full xl:w-[65%]" : "w-full"}`}>
          <VideoPlayer 
            sourceType="youtube"
            url={lessonData?.video_url || ""} 
            onEnded={handleVideoEnded}
            startTime={startTime}
          />

          <div className="mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-bold text-[22px] md:text-[24px] text-[#0f172a] leading-tight">
                  {lessonData?.title || "Loading lesson..."}
                </h1>
                <div className="flex items-center gap-3 mt-3">
                   <span className="font-sans font-medium text-[14px] text-[#6b7280]">14m 22s</span>
                   <span className="w-1 h-1 rounded-full bg-[#d1d5db]"></span>
                   <div className="bg-[#eff4fe] text-[#0f4ff1] font-sans font-semibold text-[11px] uppercase tracking-[0.06em] h-[22px] rounded-full px-[10px] flex items-center">
                     {courseData?.category_tag || "LMS"}
                   </div>
                   <span className="w-1 h-1 rounded-full bg-[#d1d5db]"></span>
                   <div className="flex items-center gap-1 font-sans font-medium text-[13px]">
                     <CheckCircle size={14} className={isQuizComplete ? "text-[#16a34a]" : "text-[#cbd5e1]"} />
                     <span className={isQuizComplete ? "text-[#16a34a]" : "text-[#6b7280]"}>
                        {isQuizComplete ? "Mastered" : "In Progress"}
                     </span>
                   </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <button 
                  disabled={!prevLesson}
                  onClick={() => router.push(`/student/courses/${params.id}/lessons/${prevLesson.id}`)}
                  className="h-[44px] px-6 border border-[#e8edf5] rounded-[12px] font-heading font-semibold text-[14px] text-[#4b5563] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f9fafb] transition-all flex items-center gap-2"
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                
                <div className="group relative">
                  <button 
                    disabled={isNextDisabled || !nextLesson}
                    onClick={() => router.push(`/student/courses/${params.id}/lessons/${nextLesson.id}`)}
                    className={`h-[44px] px-6 rounded-[12px] font-heading font-semibold text-[14px] flex items-center gap-2 transition-all ${
                      isNextDisabled || !nextLesson
                        ? "bg-[#f1f5f9] text-[#9ca3af] cursor-not-allowed" 
                        : "bg-[#0f4ff1] text-white hover:bg-[#093094] shadow-md shadow-blue-200"
                    }`}
                  >
                    Next Lesson <ChevronRight size={18} />
                  </button>
                  {isNextDisabled && nextLesson && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1e293b] text-white text-[11px] font-sans rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Complete this lesson and quiz to continue.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-8 border-b border-[#e8edf5]">
               {(['Overview', 'Transcript', 'Resources', 'Notes'] as TabType[]).map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`font-heading font-semibold text-[14px] pb-3 transition-colors relative ${activeTab === tab ? "text-[#0f4ff1]" : "text-[#6b7280] hover:text-[#0f172a]"}`}
                 >
                   {tab}
                   {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f4ff1]" />}
                 </button>
               ))}
            </div>
            
            <div className="mt-6">
               {activeTab === 'Overview' && (
                 <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <p className="font-sans font-normal text-[15px] text-[#4b5563] leading-[1.7]">
                     {lessonData?.ai_overview || "No overview available."}
                   </p>
                 </div>
               )}
               {activeTab === 'Transcript' && (
                 <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {(lessonData?.transcript_json || []).map((row: any, i: number) => (
                      <div key={i} className="flex gap-4 group cursor-pointer hover:bg-[#f8faff] p-2 rounded-lg transition-colors">
                        <span className="font-sans font-bold text-[13px] text-[#0f4ff1] shrink-0 mt-0.5">{row.timestamp}</span>
                        <p className="font-sans text-[14px] text-[#4b5563] group-hover:text-[#0f172a]">{row.text}</p>
                      </div>
                    ))}
                 </div>
               )}
               {activeTab === 'Resources' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {[
                      ...(lessonData?.manual_resources_json || []),
                      ...(lessonData?.ai_resources_json || [])
                    ].map((item: any, i: number) => {
                      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(item.file_type?.toLowerCase() || '');
                      return (
                        <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 border border-[#e8edf5] rounded-[14px] hover:border-[#0f4ff1] hover:bg-[#eff4fe] transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[10px] bg-[#f1f5f9] group-hover:bg-white flex items-center justify-center overflow-hidden transition-colors">
                              {isImage ? (
                                <img src={item.url} className="w-full h-full object-cover" alt={item.title} />
                              ) : (
                                <File size={18} className="text-[#6b7280] group-hover:text-[#0f4ff1]" />
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h4 className="font-heading font-semibold text-[14px] text-[#0f172a] truncate">{item.title}</h4>
                              <p className="font-sans text-[12px] text-[#9ca3af]">{item.source || (item.file_type ? item.file_type.toUpperCase() : 'Resource')}</p>
                            </div>
                          </div>
                          <ExternalLink size={16} className="text-[#cbd5e1] group-hover:text-[#0f4ff1] shrink-0" />
                        </a>
                      );
                    })}
                    {(!lessonData?.manual_resources_json?.length && !lessonData?.ai_resources_json?.length) && (
                      <div className="col-span-2 py-10 flex flex-col items-center justify-center text-center">
                        <Box size={40} className="text-[#e8edf5] mb-3" />
                        <p className="font-sans text-[14px] text-[#6b7280]">No resources available for this lesson.</p>
                      </div>
                    )}
                 </div>
               )}
               {activeTab === 'Notes' && (
                 <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <textarea 
                      value={studentNotes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      placeholder="Type your personal lesson notes here..."
                      className="w-full min-h-[250px] p-5 font-sans text-[15px] border border-[#e8edf5] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0f4ff1]/10 focus:border-[#0f4ff1] transition-all resize-none placeholder:text-[#cbd5e1]"
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                       {isSaving ? <div className="text-[#9ca3af] text-[12px]">Saving...</div> : showSaved ? <div className="text-[#16a34a] text-[12px]">Saved</div> : null}
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div 
          className={`fixed inset-x-0 bottom-0 z-50 xl:relative xl:inset-auto xl:w-[35%] xl:h-[600px] bg-white border border-[#e8edf5] shadow-xl xl:shadow-sm overflow-hidden transition-all duration-500 ease-in-out transform ${isVideoEnded ? "translate-y-0 xl:translate-x-0 opacity-100" : "translate-y-full xl:translate-x-full opacity-0 pointer-events-none"}`}
          style={{ height: 'auto', maxHeight: '80vh' }}
        >
          <div className="bg-[#0f4ff1] w-full px-[20px] py-[24px]">
            <span className="font-sans font-semibold text-[11px] text-white/65 uppercase tracking-[0.06em] block">AI Quiz</span>
            <h2 className="font-heading font-bold text-[16px] text-white">{lessonData?.title}</h2>
            <div className="w-full h-[3px] bg-white/20 mt-5 rounded-full overflow-hidden">
               <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${quizFinished ? 100 : ((qIndex) / quizData.length) * 100}%` }}></div>
            </div>
          </div>

          <div className={`p-[20px] flex flex-col bg-white ${isShaking ? 'animate-shake' : ''} max-h-[60vh] overflow-y-auto`}>
            {isQuizLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 size={32} className="animate-spin text-[#0f4ff1]" />
                <p className="font-sans text-[13px] text-[#6b7280]">Gemini is generating your quiz...</p>
              </div>
            ) : quizFinished ? (
               <div className="flex flex-col items-center justify-center text-center py-6">
                  <CheckCircle size={32} className="text-[#16a34a] mb-4" />
                  <h3 className="font-heading font-bold text-[20px] mb-2">Quiz Complete!</h3>
                  <p className="font-sans text-[15px] text-[#6b7280]">You scored {score} out of {quizData.length}.</p>
                  <button onClick={() => { setQIndex(0); setScore(0); setQuizFinished(false); setSelectedAnswer(null); }} className="px-6 py-3 bg-[#eff4fe] text-[#0f4ff1] rounded-[12px] mt-6">Retake Quiz</button>
               </div>
            ) : quizData.length > 0 ? (
               <>
                  <span className="font-sans font-semibold text-[11px] text-[#9ca3af] uppercase mb-3">Question {qIndex + 1} of {quizData.length}</span>
                  <p className="font-heading font-semibold text-[15px] text-[#0f172a] mb-6">{quizData[qIndex].question}</p>
                  <div className="flex flex-col gap-3">
                     {quizData[qIndex].options.map((opt: string, i: number) => (
                       <div key={i} onClick={() => setSelectedAnswer(i)} className={`border rounded-[11px] px-[14px] py-[12px] cursor-pointer flex items-start gap-3 transition-colors ${selectedAnswer === i ? "border-[#0f4ff1] bg-[#eff4fe]" : "border-[#e8edf5] bg-white"}`}>
                          <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${selectedAnswer === i ? "border-[#0f4ff1] bg-[#0f4ff1]" : "border-[#e8edf5]"}`}>
                             {selectedAnswer === i && <div className="w-2 h-2 rounded-full bg-white"></div>}
                          </div>
                          <span className={`font-heading font-medium text-[14px] ${selectedAnswer === i ? "text-[#0f4ff1]" : "text-[#0f172a]"}`}>{opt}</span>
                       </div>
                     ))}
                  </div>
                  {quizData[qIndex].explanation && selectedAnswer !== null && (
                    <div className="mt-4 p-3 bg-[#f8fafc] rounded-lg border border-[#e8edf5] text-[12px] text-[#6b7280]">
                      <span className="font-bold text-[#0f172a] block mb-1">Tip:</span>
                      {quizData[qIndex].explanation}
                    </div>
                  )}
                  <button onClick={handleNextQuestion} disabled={selectedAnswer === null} className="w-full bg-[#0f4ff1] text-white font-heading font-semibold h-[44px] rounded-[12px] mt-8 disabled:opacity-50">
                    {qIndex === quizData.length - 1 ? "Finish Quiz" : "Next Question"}
                  </button>
               </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Info size={32} className="text-[#cbd5e1] mb-2" />
                <p className="font-sans text-[13px] text-[#6b7280]">No quiz available for this lesson.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
