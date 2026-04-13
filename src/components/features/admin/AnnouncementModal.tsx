"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface AnnouncementModalProps {
  title: string;
  bodyHtml: string;
  imageUrl?: string;
  onDismiss: () => void;
}

export function AnnouncementModal({ title, bodyHtml, imageUrl, onDismiss }: AnnouncementModalProps) {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300); // allow fade out
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-300">
      {/* Modal Container */}
      <div className="bg-white max-w-[520px] w-full mx-4 rounded-[18px] shadow-modal overflow-hidden transform animate-in zoom-in-95 duration-300 relative">
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full text-foreground transition-colors z-10"
        >
          <X size={18} />
        </button>

        {imageUrl && (
           <div className="w-full h-[200px] bg-muted relative">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={imageUrl} alt="Announcement" className="w-full h-full object-cover" />
           </div>
        )}

        <div className={`p-8 ${!imageUrl ? 'pt-10' : ''}`}>
          <h2 className="font-heading font-bold text-xl text-foreground mb-3 leading-tight">
            {title}
          </h2>
          <div 
            className="text-[14px] text-muted-foreground leading-relaxed mb-8"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          <button 
            onClick={handleDismiss}
            className="w-full h-[44px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-[12px] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
