"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, 
  Captions, Maximize, PictureInPicture, CheckCircle,
  ChevronLeft, ChevronRight, Info, Check, FileText, 
  ExternalLink, Video, Box, File
} from "lucide-react";
import { VideoPlayer } from "@/components/features/video/VideoPlayer";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type TabType = 'Overview' | 'Transcript' | 'Resources' | 'Notes';

export default function VideoLessonPage() {
  const params = useParams();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [persistedScore, setPersistedScore] = useState<number | null>(null);
  
  // Lesson & Notes Data
  const [lessonData, setLessonData] = useState<any>(null);
  const [studentNotes, setStudentNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Quiz Data
  const quizData = [
    { question: "When applying the 8pt grid system to a layout, which of the following internal paddings is considered invalid?", options: ["15px", "32px", "24px"], correct: 0 },
    { question: "Why is Inter the standard for body typography?", options: ["High legibility at smaller sizes", "It's a serif font", "No reason"], correct: 0 },
    { question: "What is the primary brand color hexadecimal?", options: ["#16a34a", "#0f4ff1", "#eff4fe"], correct: 1 }
  ];
  
  const [qIndex, setQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Load persistence & Lesson Data
  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Lesson AI Content
      const { data: lesson } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (lesson) setLessonData(lesson);

      // 2. Fetch Student Notes
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: notes } = await supabase
          .from('student_notes')
          .select('content')
          .eq('student_id', user.id)
          .eq('lesson_id', params.id)
          .single();
        
        if (notes) setStudentNotes(notes.content);
      }

      // 3. Quiz Score from LocalStorage (Demo mode)
      const saved = localStorage.getItem(`quiz_score_${params.id}`);
      if (saved) {
        setPersistedScore(parseInt(saved));
        setIsQuizComplete(true);
      }
    };

    fetchData();
  }, [params.id, supabase]);

  // Debounced Auto-save for Notes
  const handleNotesChange = (val: string) => {
    setStudentNotes(val);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('student_notes').upsert({
          student_id: user.id,
          lesson_id: params.id,
          content: val,
          updated_at: new Date().toISOString()
        });
        setIsSaving(false);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      }
    }, 2000);
  };

  const handleNextQuestion = () => {
    const isCorrect = selectedAnswer === quizData[qIndex].correct;
    
    if (!isCorrect) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      return;
    }

    if (qIndex < quizData.length - 1) {
      setQIndex(qIndex + 1);
      setSelectedAnswer(null);
      setScore(score + 1);
    } else {
      const finalScore = score + 1;
      const percentage = Math.round((finalScore / quizData.length) * 100);
      localStorage.setItem(`quiz_score_${params.id}`, percentage.toString());
      setPersistedScore(percentage);
      setQuizFinished(true);
      setIsQuizComplete(true);
    }
  };

  const isNextDisabled = !isVideoEnded || !isQuizComplete;

  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'article': return <FileText size={18} />;
      case 'pdf': return <File size={18} />;
      case 'tool': return <Box size={18} />;
      case 'video': return <Video size={18} />;
      default: return <ExternalLink size={18} />;
    }
  };

  return (
    <div className="w-full flex-1 pb-20 md:pb-10 relative overflow-x-hidden">
      
      {/* Top Section: Video & Quiz Container */}
      <div className="flex flex-col xl:flex-row gap-6 w-full transition-all duration-500 ease-in-out">
        
        {/* LEFT COLUMN: Video Player */}
        <div 
          className={`transition-all duration-500 ease-in-out ${
            isVideoEnded ? "w-full xl:w-[65%]" : "w-full"
          }`}
        >
          <VideoPlayer 
            src={lessonData?.video_url || "https://youtu.be/QZakfvLu5Qk?si=Hx0KllUW7KX9X1JV"} 
            onEnded={() => setIsVideoEnded(true)}
          />

          {/* Video Meta row below */}
          <div className="mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading font-bold text-[22px] md:text-[24px] text-[#0f172a] leading-tight">
                  {lessonData?.title || "Typography Layouts & Grids"}
                </h1>
                <div className="flex items-center gap-3 mt-3">
                   <span className="font-sans font-medium text-[14px] text-[#6b7280]">14m 22s</span>
                   <span className="w-1 h-1 rounded-full bg-[#d1d5db]"></span>
                   <div className="bg-[#eff4fe] text-[#0f4ff1] font-sans font-semibold text-[11px] uppercase tracking-[0.06em] h-[22px] rounded-full px-[10px] flex items-center">
                     UI DESIGN
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

              {/* DESKTOP NAVIGATION BUTTONS */}
              <div className="hidden md:flex items-center gap-3">
                <button 
                  disabled={params.id === '1'}
                  className="h-[44px] px-6 border border-[#e8edf5] rounded-[12px] font-heading font-semibold text-[14px] text-[#4b5563] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f9fafb] transition-all flex items-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                
                <div className="group relative">
                  <button 
                    disabled={isNextDisabled}
                    className={`h-[44px] px-6 rounded-[12px] font-heading font-semibold text-[14px] flex items-center gap-2 transition-all ${
                      isNextDisabled 
                        ? "bg-[#f1f5f9] text-[#9ca3af] cursor-not-allowed" 
                        : "bg-[#0f4ff1] text-white hover:bg-[#093094] shadow-md shadow-blue-200"
                    }`}
                  >
                    Next Lesson
                    <ChevronRight size={18} />
                  </button>
                  {isNextDisabled && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1e293b] text-white text-[11px] font-sans rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Complete this lesson and quiz to continue.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex items-center gap-6 mt-8 border-b border-[#e8edf5]">
               {(['Overview', 'Transcript', 'Resources', 'Notes'] as TabType[]).map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`font-heading font-semibold text-[14px] pb-3 transition-colors relative ${
                     activeTab === tab ? "text-[#0f4ff1]" : "text-[#6b7280] hover:text-[#0f172a]"
                   }`}
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
                     {lessonData?.ai_overview || "In this lesson, we break down the fundamental mathematical rules behind spacing blocks of text inside digital interfaces. We strictly adhere to the 8pt grid pattern layout to ensure consistency and visual harmony across all breakpoints."}
                   </p>
                 </div>
               )}

               {activeTab === 'Transcript' && (
                 <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {(lessonData?.transcript_json || [
                      { timestamp: "00:00", text: "Introduction to Typography layouts." },
                      { timestamp: "02:15", text: "Understanding the base 8 spacing system." },
                      { timestamp: "05:40", text: "Vertical rhythm and line height calculations." }
                    ]).map((row: any, i: number) => (
                      <div key={i} className="flex gap-4 group cursor-pointer hover:bg-[#f8faff] p-2 rounded-lg transition-colors">
                        <span className="font-sans font-bold text-[13px] text-[#0f4ff1] shrink-0 mt-0.5">{row.timestamp}</span>
                        <p className="font-sans text-[14px] text-[#4b5563] group-hover:text-[#0f172a]">{row.text}</p>
                      </div>
                    ))}
                 </div>
               )}

               {activeTab === 'Resources' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {(lessonData?.ai_resources_json || [
                      { title: "8pt Grid Mastery Guide", type: "article", source: "Design Specs" },
                      { title: "Grid Calculator Tool", type: "tool", source: "External" }
                    ]).map((item: any, i: number) => (
                      <a key={i} href={item.url || "#"} className="flex items-center justify-between p-4 border border-[#e8edf5] rounded-[14px] hover:border-[#0f4ff1] hover:bg-[#eff4fe] transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#f1f5f9] group-hover:bg-white flex items-center justify-center text-[#6b7280] group-hover:text-[#0f4ff1] transition-colors">
                            {getResourceIcon(item.type)}
                          </div>
                          <div>
                            <h4 className="font-heading font-semibold text-[14px] text-[#0f172a]">{item.title}</h4>
                            <p className="font-sans text-[12px] text-[#9ca3af]">{item.source}</p>
                          </div>
                        </div>
                        <ExternalLink size={16} className="text-[#cbd5e1] group-hover:text-[#0f4ff1]" />
                      </a>
                    ))}
                 </div>
               )}

               {activeTab === 'Notes' && (
                 <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <textarea 
                      value={studentNotes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      placeholder="Type your personal lesson notes here... they auto-save as you type."
                      className="w-full min-h-[250px] p-5 font-sans text-[15px] border border-[#e8edf5] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0f4ff1]/10 focus:border-[#0f4ff1] transition-all resize-none placeholder:text-[#cbd5e1]"
                    ></textarea>
                    
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                       {isSaving ? (
                         <div className="flex items-center gap-2 text-[#9ca3af] text-[12px] font-sans">
                            <div className="w-3 h-3 border-2 border-[#0f4ff1]/30 border-t-[#0f4ff1] rounded-full animate-spin" />
                            Saving...
                         </div>
                       ) : showSaved ? (
                         <div className="flex items-center gap-1.5 text-[#16a34a] text-[12px] font-sans font-medium bg-[#ecfdf5] px-2.5 py-1 rounded-full animate-in fade-in zoom-in duration-300">
                            <Check size={12} strokeWidth={3} />
                            Saved
                         </div>
                       ) : null}
                    </div>
                 </div>
               )}
            </div>

            {/* MOBILE NAVIGATION BUTTONS (Stacked) */}
            <div className="flex md:hidden flex-col gap-3 mt-10">
               <button 
                  disabled={isNextDisabled}
                  className={`w-full h-[48px] rounded-[12px] font-heading font-semibold text-[15px] flex items-center justify-center gap-2 transition-all ${
                    isNextDisabled 
                      ? "bg-[#f1f5f9] text-[#9ca3af] cursor-not-allowed" 
                      : "bg-[#0f4ff1] text-white"
                  }`}
                >
                  Next Lesson
                  <ChevronRight size={20} />
                </button>
                <button 
                  disabled={params.id === '1'}
                  className="w-full h-[48px] border border-[#e8edf5] rounded-[12px] font-heading font-semibold text-[15px] text-[#4b5563] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={20} />
                  Previous Lesson
                </button>
                {isNextDisabled && (
                  <div className="flex items-center gap-2 text-[#6b7280] text-[12px] justify-center">
                    <Info size={14} />
                    Complete lesson and quiz to unlock next.
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quiz Panel */}
        <div 
          className={`fixed inset-x-0 bottom-0 z-50 xl:relative xl:inset-auto xl:w-[35%] xl:h-[600px] bg-white border border-[#e8edf5] shadow-xl xl:shadow-sm overflow-hidden transition-all duration-500 ease-in-out transform ${
            isVideoEnded 
              ? "translate-y-0 xl:translate-x-0 opacity-100" 
              : "translate-y-full xl:translate-x-full opacity-0 pointer-events-none"
          }`}
          style={{ height: 'auto', maxHeight: '80vh' }}
        >
          {/* Header */}
          <div className="bg-[#0f4ff1] w-full px-[20px] py-[24px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans font-semibold text-[11px] text-white/65 uppercase tracking-[0.06em] block">AI Quiz</span>
              {/* Force Finish for Demo */}
              <button onClick={() => setIsVideoEnded(false)} className="xl:hidden text-white/60 hover:text-white transition-colors">
                <CheckCircle size={20} />
              </button>
            </div>
            <h2 className="font-heading font-bold text-[16px] text-white">Typography Layouts & Grids</h2>
            
            <div className="w-full h-[3px] bg-white/20 mt-5 rounded-full overflow-hidden">
               <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${quizFinished ? 100 : ((qIndex) / quizData.length) * 100}%` }}></div>
            </div>
          </div>

          {/* Body */}
          <div className={`p-[20px] flex flex-col bg-white ${isShaking ? 'animate-shake' : ''} max-h-[60vh] overflow-y-auto`}>
            
            {quizFinished ? (
               <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300 py-6">
                  <div className="w-16 h-16 bg-[#ecfdf5] rounded-full flex items-center justify-center mb-4 text-[#16a34a]">
                     <CheckCircle size={32} className="fill-current" />
                  </div>
                  <h3 className="font-heading font-bold text-[20px] text-[#0f172a] mb-2">Quiz Complete!</h3>
                  <p className="font-sans text-[15px] text-[#6b7280] mb-6">You scored {score} out of {quizData.length}. This score has been added to your Grade Point average.</p>
                  <button onClick={() => { setQIndex(0); setScore(0); setQuizFinished(false); setSelectedAnswer(null); }} className="px-6 py-3 bg-[#eff4fe] text-[#0f4ff1] font-heading font-semibold text-[14px] rounded-[12px] hover:bg-[#dbeafe] transition-colors">
                    Retake Quiz
                  </button>
               </div>
            ) : (
               <>
                  <span className="font-sans font-semibold text-[11px] text-[#9ca3af] uppercase tracking-[0.06em] mb-3">Question {qIndex + 1} of {quizData.length}</span>
                  <p className="font-heading font-semibold text-[15px] text-[#0f172a] leading-[1.5] mb-6">
                    {quizData[qIndex].question}
                  </p>

                  <div className="flex flex-col gap-3">
                     {quizData[qIndex].options.map((opt, i) => {
                        const isSelected = selectedAnswer === i;
                        return (
                           <div 
                              key={i}
                              onClick={() => setSelectedAnswer(i)}
                              className={`border rounded-[11px] px-[14px] py-[12px] cursor-pointer flex items-start gap-3 transition-colors ${
                                 isSelected ? "border-[#0f4ff1] bg-[#eff4fe]" : "border-[#e8edf5] bg-white hover:border-[#0f4ff1]"
                              }`}
                           >
                              <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${isSelected ? "border-[#0f4ff1] bg-[#0f4ff1]" : "border-[#e8edf5]"}`}>
                                 {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                              </div>
                              <span className={`font-heading font-medium text-[14px] ${isSelected ? "text-[#0f4ff1]" : "text-[#0f172a]"}`}>{opt}</span>
                           </div>
                        );
                     })}
                  </div>

                  <button 
                     onClick={handleNextQuestion}
                     disabled={selectedAnswer === null}
                     className="w-full bg-[#0f4ff1] text-white font-heading font-semibold text-[14px] h-[44px] rounded-[12px] mt-8 hover:bg-[#093094] transition-colors disabled:opacity-50 disabled:hover:bg-[#0f4ff1]"
                  >
                    {qIndex === quizData.length - 1 ? "Finish Quiz" : "Next Question"}
                  </button>
               </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
