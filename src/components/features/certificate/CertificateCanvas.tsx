"use client";

import React, { useRef } from "react";
import { Award, Download, Share2, ShieldCheck, CheckCircle2 } from "lucide-react";

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  date: string;
  certificateId: string;
}

export function CertificateCanvas({ studentName, courseTitle, date, certificateId }: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // In a real production app, we'd use html2canvas or a server-side PDF generator.
    // For this high-fidelity demo, we simulate the success.
    alert("Downloading High-Resolution Certificate PDF...");
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center animate-in fade-in zoom-in duration-500">
      
      {/* Certificate Frame */}
      <div 
        ref={certRef}
        className="w-full relative bg-white border-[16px] border-[#0f172a] shadow-2xl overflow-hidden p-12 md:p-20 flex flex-col items-center text-center"
        style={{ aspectRatio: "1.414 / 1" }}
      >
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="certGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f172a" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#certGrid)" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0f4ff1] opacity-[0.05] blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0f4ff1] opacity-[0.05] blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

        {/* Certificate Content */}
        <div className="relative z-10 w-full h-full border border-[#e2e8f0] p-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-10">
             <div className="w-12 h-12 bg-[#0f4ff1] rounded-xl flex items-center justify-center text-white">
                <Award size={28} />
             </div>
             <span className="font-heading font-black text-2xl text-[#0f172a] tracking-tight">KREATIVHUB</span>
          </div>

          <h1 className="font-heading font-bold text-[14px] text-[#6b7280] uppercase tracking-[0.4em] mb-6">
            Certificate of Completion
          </h1>

          <p className="font-sans text-[18px] text-[#6b7280] mb-2">This is to certify that</p>
          <h2 className="font-heading font-black text-[42px] md:text-[56px] text-[#0f172a] mb-6 leading-tight">
            {studentName}
          </h2>

          <p className="font-sans text-[18px] text-[#6b7280] max-w-2xl leading-relaxed mb-10">
            Has successfully completed all curriculum requirements, practical assessments, and modular examinations for the course:
            <br />
            <span className="font-heading font-bold text-[#0f4ff1] text-[24px] mt-4 inline-block">{courseTitle}</span>
          </p>

          <div className="mt-auto w-full flex flex-col md:flex-row items-end justify-between gap-10">
             <div className="flex flex-col items-start">
                <div className="mb-2">
                   <p className="font-serif italic text-[24px] text-[#0f172a]">Kreativhub Academy</p>
                   <div className="w-40 h-[1px] bg-[#e2e8f0] mt-1"></div>
                </div>
                <p className="font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-widest">Authorized Signature</p>
             </div>

             <div className="flex flex-col items-center bg-[#f8fafc] px-6 py-4 rounded-2xl border border-[#eff4fe]">
                <ShieldCheck size={32} className="text-[#16a34a] mb-2" />
                <p className="font-sans font-bold text-[10px] text-[#6b7280] uppercase tracking-tighter">Verified Achievement</p>
                <p className="font-mono text-[11px] text-[#0f4ff1] mt-1 font-bold">{certificateId}</p>
             </div>

             <div className="flex flex-col items-end">
                <p className="font-heading font-bold text-[18px] text-[#0f172a]">{date}</p>
                <div className="w-32 h-[1px] bg-[#e2e8f0] mt-1"></div>
                <p className="font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-widest mt-1">Date of Issue</p>
             </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row items-center gap-4 mt-12 w-full max-w-md">
        <button 
          onClick={handleDownload}
          className="w-full h-[56px] bg-[#0f4ff1] text-white rounded-[16px] font-heading font-bold text-[16px] flex items-center justify-center gap-3 hover:bg-[#093094] transition-all shadow-lg shadow-blue-200"
        >
          <Download size={20} />
          Download PDF
        </button>
        <button className="w-full h-[56px] bg-white border border-[#e2e8f0] text-[#0f172a] rounded-[16px] font-heading font-bold text-[16px] flex items-center justify-center gap-3 hover:bg-[#f8fafc] transition-all">
          <Share2 size={20} />
          Share to LinkedIn
        </button>
      </div>

      <div className="mt-8 flex items-center gap-2 text-[#16a34a] bg-[#ecfdf5] px-4 py-2 rounded-full border border-[#d1fae5]">
         <CheckCircle2 size={16} />
         <span className="font-sans font-semibold text-[13px]">Verified by Kreativhub Security Node</span>
      </div>
    </div>
  );
}
