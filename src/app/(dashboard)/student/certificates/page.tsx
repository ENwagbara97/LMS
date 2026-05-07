"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Award, Download, Share2, ExternalLink, Loader2, BookOpen, CheckCircle2 } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import Link from "next/link";

export default function CertificatesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [certs, setCerts] = useState<any[]>([]);

  const loadCertificates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("student_id", user.id)
      .order("issued_at", { ascending: false });

    if (data) setCerts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleDownload = (cert: any) => {
    // In a real app, this would generate a PDF or trigger a download
    // For now, we'll alert the user and simulate success
    alert(`Downloading certificate for ${cert.course_title}...`);
  };

  const handleShare = (cert: any) => {
    const text = `I just earned my certification in ${cert.course_title} from LMS Master! 🎓`;
    const url = window.location.href; // In prod, this would be a public verification URL
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-[#0f4ff1] mb-4" size={32} />
      <p className="font-sans text-[#6b7280]">Validating credentials...</p>
    </div>
  );

  return (
    <div className="w-full flex-1 max-w-5xl pb-20">
      <BackButton fallbackPath="/student" />

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-[32px] gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-[32px] text-[#0f172a] leading-tight">My Certificates</h1>
          <p className="font-sans font-normal text-[15px] text-[#6b7280]">Verification and downloads for your completed certifications.</p>
        </div>
      </div>

      {certs.length === 0 ? (
        <div className="bg-white border border-[#e8edf5] rounded-[24px] p-20 text-center flex flex-col items-center shadow-sm">
           <div className="w-20 h-20 bg-[#f8fafc] rounded-full flex items-center justify-center mb-6 text-[#cbd5e1]">
              <Award size={40} />
           </div>
           <h3 className="font-heading font-bold text-[20px] text-[#0f172a]">No Certificates Earned</h3>
           <p className="font-sans text-[15px] text-[#6b7280] max-w-[320px] mx-auto mt-2 mb-8">
             Complete all lessons and quizzes in a course to unlock your official certification.
           </p>
           <Link href="/student/courses" className="h-[48px] px-8 bg-[#0f4ff1] text-white rounded-xl font-heading font-bold text-[14px] hover:bg-[#093094] transition-all flex items-center gap-2">
             <BookOpen size={18} /> Browse Courses
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {certs.map((cert) => (
             <div key={cert.id} className="bg-white border border-[#e8edf5] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="bg-[#eff4fe] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                   {/* Decorative Elements */}
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                   <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8 blur-xl" />
                   
                   <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#0f4ff1] mb-4 relative z-10">
                      <Award size={32} />
                   </div>
                   <div className="flex items-center gap-2 bg-[#0f4ff1] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider relative z-10">
                      <CheckCircle2 size={12} /> Verified
                   </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                   <span className="font-sans font-bold text-[11px] text-[#9ca3af] uppercase tracking-[0.1em] mb-2">OFFICIAL CERTIFICATION</span>
                   <h3 className="font-heading font-extrabold text-[22px] text-[#0f172a] leading-tight mb-2 group-hover:text-[#0f4ff1] transition-colors">{cert.course_title}</h3>
                   <div className="flex items-center gap-4 mt-auto pt-6 border-t border-[#f1f5f9]">
                      <div className="flex flex-col">
                         <span className="font-sans text-[11px] text-[#9ca3af] uppercase font-bold tracking-tight">ISSUED ON</span>
                         <span className="font-sans font-bold text-[14px] text-[#0f172a]">{new Date(cert.issued_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="font-sans text-[11px] text-[#9ca3af] uppercase font-bold tracking-tight">ID</span>
                         <span className="font-sans font-bold text-[14px] text-[#0f172a] truncate max-w-[120px]">{cert.certificate_id}</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 mt-8">
                      <button 
                        onClick={() => handleDownload(cert)}
                        className="h-[44px] border border-[#e8edf5] rounded-xl font-heading font-bold text-[13px] text-[#0f172a] hover:bg-[#f9fafb] transition-all flex items-center justify-center gap-2"
                      >
                         <Download size={16} className="text-[#0f4ff1]" /> Download
                      </button>
                      <button 
                        onClick={() => handleShare(cert)}
                        className="h-[44px] bg-[#0f172a] text-white rounded-xl font-heading font-bold text-[13px] hover:bg-black transition-all flex items-center justify-center gap-2"
                      >
                         <Share2 size={16} /> Share
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
