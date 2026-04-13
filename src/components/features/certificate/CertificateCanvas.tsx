"use client";

import React, { useRef } from "react";
// Dynamic import will be used in real version (Phase 4) because html2canvas/jspdf require window

export function CertificateCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    console.log("Mock triggering html2canvas -> jsPDF -> download()");
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center bg-white border border-border rounded-[18px] p-6 shadow-card">
      <h2 className="font-heading font-bold text-2xl text-foreground mb-4">Your Certificate is Ready</h2>
      <p className="text-muted-foreground text-[14px] mb-8 text-center max-w-md">
        Congratulations on your completion! Here is your generated certificate. You can download it as PDF or share via link.
      </p>

      {/* Certificate Preview Frame (A4 Aspect Ratio approx) */}
      <div 
        ref={canvasRef}
        className="w-full relative bg-surface-subtle border border-border shadow-sm rounded-lg overflow-hidden flex items-center justify-center p-8 mb-8"
        style={{ aspectRatio: "1.414 / 1" }}
      >
        <div className="text-center opacity-40 select-none">
           <p className="font-heading text-2xl mb-2">Background Template Rendering</p>
           <p className="font-serif italic text-4xl text-black">Jane Student</p>
           <p className="mt-4 text-xs font-mono">UID: K-HUB-98214-992</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 w-full md:w-auto">
        <button 
          onClick={handleDownload}
          className="flex-1 md:w-[200px] h-[48px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-[12px] transition-colors"
        >
          Download PDF
        </button>
        <button className="flex-1 md:w-[200px] h-[48px] bg-white border border-border hover:bg-surface-subtle text-foreground font-semibold rounded-[12px] transition-colors">
          Copy share link
        </button>
      </div>
    </div>
  );
}
