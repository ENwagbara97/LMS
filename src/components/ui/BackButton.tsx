"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  fallbackPath?: string;
  label?: string;
  className?: string;
}

export function BackButton({ fallbackPath, label = "Back", className = "" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else if (fallbackPath) {
      router.push(fallbackPath);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`group flex items-center gap-2 text-[#6b7280] hover:text-[#0f172a] transition-colors mb-6 ${className}`}
    >
      <div className="w-8 h-8 rounded-full border border-[#e8edf5] flex items-center justify-center group-hover:border-[#0f172a] transition-all">
        <ChevronLeft size={18} />
      </div>
      <span className="font-sans font-semibold text-[13px] uppercase tracking-wider">{label}</span>
    </button>
  );
}
