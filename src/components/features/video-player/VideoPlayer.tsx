"use client";

import React, { useState, useEffect } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Rewind, FastForward, 
  Settings2, Maximize, PictureInPicture, Captions, Lock 
} from "lucide-react";

interface VideoPlayerProps {
  sourceType: "youtube" | "upload";
  url: string;
  isLocked?: boolean;
}

export function VideoPlayer({ sourceType, url, isLocked }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [ccActive, setCcActive] = useState(false);

  // Phase 4: Track 10s interval video logic pushing to local state
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isLocked) {
      interval = setInterval(() => {
        console.log(`[Tracking] Syncing playback progress to Supabase for ${url}...`);
      }, 10000); // 10 seconds
    }
    return () => clearInterval(interval);
  }, [isPlaying, isLocked, url]);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* 16:9 Aspect Ratio Container */}
      <div 
        className="relative w-full overflow-hidden bg-black rounded-[12px] group"
        style={{ aspectRatio: "16/9" }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {isLocked ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white">
            <Lock size={48} className="mb-4 opacity-70" />
            <h2 className="text-xl font-heading font-medium">Lesson Locked</h2>
            <p className="text-sm opacity-80 mt-2">Complete the previous lesson to unlock.</p>
          </div>
        ) : (
          <>
            {/* Fake Video Display for Mock */}
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white/20 select-none">
              {sourceType === "youtube" ? "YouTube Frame Placeholder" : "HTML5 Video Placeholder"}
            </div>

            {/* Custom Controls Overlay */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
               {/* Progress Bar (Thin Brand Blue Fill) */}
               <div className="w-full h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer relative overflow-hidden">
                 <div className="absolute top-0 left-0 bottom-0 bg-primary w-[30%] transition-all duration-300 ease-out" />
               </div>

               <div className="flex items-center justify-between text-white">
                 <div className="flex items-center space-x-3 md:space-x-4">
                   <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-primary transition-colors">
                     {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                   </button>
                   <button className="hover:text-primary transition-colors hidden md:block">
                     <Rewind size={18} />
                   </button>
                   <button className="hover:text-primary transition-colors hidden md:block">
                     <FastForward size={18} />
                   </button>
                   
                   <div className="flex items-center space-x-2 group/vol hidden md:flex">
                     <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="hover:text-primary transition-colors">
                       {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                     </button>
                     <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-0 group-hover/vol:w-16 transition-all duration-300 accent-primary opacity-0 group-hover/vol:opacity-100" />
                   </div>
                   
                   <span className="text-xs font-mono opacity-80">04:20 / 14:00</span>
                 </div>

                 <div className="flex items-center space-x-3 md:space-x-4">
                   <button onClick={() => setCcActive(!ccActive)} className={`transition-colors ${ccActive ? 'text-primary' : 'hover:text-primary opacity-80'}`}>
                     <Captions size={18} />
                   </button>
                   <button className="hover:text-primary transition-colors opacity-80 text-xs font-bold w-8">
                     {speed}x
                   </button>
                   <button className="hover:text-primary transition-colors opacity-80 hidden md:block">
                     <PictureInPicture size={18} />
                   </button>
                   <button className="hover:text-primary transition-colors opacity-80">
                     <Maximize size={18} />
                   </button>
                 </div>
               </div>
            </div>
          </>
        )}
      </div>
      
      {/* Tabs Below Video */}
      <div className="flex items-center space-x-6 border-b border-border mt-4 px-2">
        {['Overview', 'Transcript', 'Resources', 'Notes'].map((tab, i) => (
          <button key={tab} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${i === 0 ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
