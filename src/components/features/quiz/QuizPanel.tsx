"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function QuizPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showError, setShowError] = useState(false);
  
  if (!isOpen) return null;

  const handleSelect = (idx: number) => {
    setSelectedOpt(idx);
    if (idx !== 1) { // 1 is correct mock
      setShowError(true);
      setTimeout(() => setShowError(false), 400); // end shake
    } else {
      setShowError(false);
    }
  };

  return (
    // Desktop: slides from right. Mobile: bottom sheet style.
    <div className="fixed md:static inset-0 z-50 md:z-0 flex justify-end md:justify-center items-end md:items-start bg-black/20 md:bg-transparent animate-in fade-in duration-200">
      <div className="w-full md:w-full h-[80vh] md:h-full bg-white md:bg-transparent rounded-t-2xl md:rounded-none shadow-modal md:shadow-none p-6 pb-12 overflow-y-auto animate-in slide-in-from-bottom-full md:slide-in-from-right-10 duration-300">
        
        {/* Mobile drag handle */}
        <div className="w-10 h-1.5 bg-border rounded-full mx-auto mb-6 md:hidden" onClick={onClose} />

        <div className="flex items-center justify-between mb-8">
          <h3 className="font-heading font-bold text-lg text-foreground">AI Quiz</h3>
          <span className="text-xs font-semibold text-primary bg-primary-light px-3 py-1 rounded-full">
            Question 2 of 4
          </span>
        </div>

        {/* Thin Progress Bar */}
        <div className="w-full h-1 bg-border rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-primary w-[50%] transition-all duration-500 ease-out" />
        </div>

        <div className="space-y-6">
          <p className="text-foreground font-medium text-[15px] leading-relaxed">
            What is the primary function of whitespace in modern UI design layouts?
          </p>

          <div className="space-y-3">
            {["A. Providing decorative distraction", "B. Grouping elements and creating focus", "C. Accelerating load times", "D. Minimizing color palette usage"].map((opt, idx) => {
              
              const isSelected = selectedOpt === idx;
              const isCorrect = isSelected && idx === 1;
              const isWrong = isSelected && idx !== 1;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl border text-[14px] font-medium transition-all flex items-center justify-between
                    ${isCorrect ? "bg-status-success-bg border-status-success-text/30 text-status-success-text shadow-sm" : 
                      isWrong ? "bg-status-error-bg border-status-error-text/30 text-status-error-text" : 
                      "bg-white border-border hover:border-primary/50 hover:bg-surface-subtle text-foreground"}
                    ${showError && isWrong ? "animate-[shake_0.3s_ease-in-out]" : ""}
                  `}
                >
                  <span className="flex-1">{opt}</span>
                  {isCorrect && <CheckCircle2 className="w-5 h-5 ml-2 text-status-success-text shrink-0 animate-in zoom-in" />}
                  {isWrong && <AlertCircle className="w-5 h-5 ml-2 text-status-error-text shrink-0 animate-in zoom-in" />}
                </button>
              )
            })}
          </div>

          <div className="pt-6">
             <button className="w-full bg-primary text-white h-[44px] rounded-xl font-semibold opacity-90 hover:opacity-100 transition-opacity disabled:opacity-50" disabled={selectedOpt === null}>
               Next Question
             </button>
          </div>
        </div>

      </div>
      
      {/* Add global shake animation logic in globals or inline if necessary */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}} />
    </div>
  );
}
