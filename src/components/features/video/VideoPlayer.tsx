"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX,
  Captions, Maximize, PictureInPicture, Settings,
  Check, ChevronUp, Minimize
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  onEnded: () => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export function VideoPlayer({ src, onEnded }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [isYoutube, setIsYoutube] = useState(false);
  
  // New States for Controls
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState("Auto");
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const ytId = getYoutubeId(src);
    if (ytId) {
      setIsYoutube(true);
      loadYoutubeApi(ytId);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [src]);

  const loadYoutubeApi = (videoId: string) => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => initPlayer(videoId);
    } else {
      initPlayer(videoId);
    }
  };

  const initPlayer = (videoId: string) => {
    playerRef.current = new window.YT.Player(`youtube-player`, {
      videoId: videoId,
      playerVars: {
        controls: 0,
        disablekb: 1,
        rel: 0,
        modestbranding: 1,
        showinfo: 0,
        fs: 0,
        iv_load_policy: 3,
        autohide: 1
      },
      events: {
        onReady: (event: any) => {
          setDuration(formatTime(event.target.getDuration()));
          event.target.setVolume(volume);
          startTracking();
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
          else if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
          else if (event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            onEnded();
          }
        }
      }
    });
  };

  const startTracking = () => {
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        setProgress((current / total) * 100);
        setCurrentTime(formatTime(current));
      }
    }, 500);
  };

  const togglePlay = () => {
    if (isYoutube && playerRef.current) {
      if (isPlaying) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings && !showVolumeSlider) setShowControls(false);
    }, 3000);
  };

  const skip = (amount: number) => {
    if (isYoutube && playerRef.current) {
      const current = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(current + amount, true);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (isYoutube && playerRef.current) playerRef.current.seekTo(pos * playerRef.current.getDuration(), true);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (playerRef.current) playerRef.current.setVolume(newVol);
    if (newVol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (playerRef.current) playerRef.current.setPlaybackRate(speed);
  };

  const changeQuality = (q: string) => {
    setQuality(q);
    if (playerRef.current && playerRef.current.setPlaybackQuality) {
       playerRef.current.setPlaybackQuality(q.toLowerCase());
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleCaptions = () => {
    setCaptionsOn(!captionsOn);
    if (playerRef.current) {
      if (!captionsOn) playerRef.current.loadModule('captions');
      else playerRef.current.unloadModule('captions');
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full relative bg-black transition-all duration-300 overflow-hidden group/player ${isTheaterMode ? "xl:fixed xl:inset-x-0 xl:top-[64px] xl:z-40 xl:h-[70vh] rounded-none" : "rounded-[16px] aspect-video"}`}
      onMouseMove={handleMouseMove}
    >
      {isYoutube ? (
        <div className="w-full h-full pointer-events-none scale-[1.01] overflow-hidden">
          <div id="youtube-player" className="w-full h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      ) : (
        <video src={src} className="w-full h-full object-cover" />
      )}

      {/* Invisible Overlay for Controls */}
      <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay}></div>

      {/* Center Play/Pause Overlay */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-20 transition-opacity duration-300 ${!isPlaying || showControls ? 'opacity-100' : 'opacity-0'}`}>
        {!isPlaying && (
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm scale-110">
            <Play size={32} className="text-white fill-current ml-1" />
          </div>
        )}
      </div>

      {/* Custom Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 pt-16 pb-3 px-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 z-30 ${showControls ? "opacity-100" : "opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Scrubber */}
        <div className="w-full h-1.5 md:h-1 bg-white/20 group/scrubber hover:h-2 transition-all cursor-pointer relative mb-4 rounded-full" onClick={seek}>
          <div className="h-full bg-[#0f4ff1] absolute left-0 top-0 rounded-full" style={{ width: `${progress}%` }}></div>
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-[20px] h-[20px] md:w-3 md:h-3 bg-white rounded-full transition-all group-hover/scrubber:scale-125 md:group-hover/scrubber:scale-150 shadow-md ring-4 ring-black/10"
            style={{ left: `${progress}%`, marginLeft: progress > 50 ? '-10px' : '0px' }}
          ></div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-5">
            <button onClick={togglePlay} className="hover:scale-110 transition-transform p-1">
              {isPlaying ? <Pause size={20} className="text-white fill-white" /> : <Play size={20} className="text-white fill-white" />}
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => skip(-10)} className="p-1 hover:opacity-80 transition-opacity"><RotateCcw size={18} className="text-white" /></button>
              <button onClick={() => skip(10)} className="p-1 hover:opacity-80 transition-opacity"><RotateCw size={18} className="text-white" /></button>
            </div>

            {/* Volume Control */}
            <div className="relative flex items-center group/volume" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
              <button onClick={toggleMute} className="p-1 hover:opacity-80 transition-opacity">
                {isMuted || volume === 0 ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
              </button>
              <div className={`transition-all duration-300 flex items-center ${showVolumeSlider ? "w-20 opacity-100 ml-2" : "w-0 opacity-0 pointer-events-none"}`}>
                <input 
                  type="range" min="0" max="100" value={isMuted ? 0 : volume} 
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-[#0f4ff1]"
                />
              </div>
            </div>

            <span className="font-sans font-medium text-[clamp(11px,2.5vw,13px)] text-white/90 tracking-wide tabular-nums">{currentTime} / {duration}</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative">
             <div className="relative group/cc">
              <button onClick={toggleCaptions} className={`p-1 transition-all flex flex-col items-center group-hover:scale-110 ${captionsOn ? "text-[#0f4ff1]" : "text-white hover:text-white/80"}`}>
                <Captions size={20} />
                <span className="text-[7px] font-bold mt-[-2px] uppercase">{captionsOn ? "ON" : "OFF"}</span>
              </button>
            </div>
            
            {/* Speed & Quality Settings Menu */}
            <div className="relative">
              <button onClick={() => setShowSettings(!showSettings)} className="p-1 text-white hover:rotate-45 transition-transform">
                <Settings size={20} />
              </button>
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-4 bg-black/95 backdrop-blur-md border border-white/10 rounded-xl py-3 min-w-[180px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                  {/* Speed Section */}
                  <div className="px-3 py-1 mb-1 text-[10px] text-white/40 uppercase font-bold tracking-widest">Playback Speed</div>
                  <div className="flex flex-wrap px-2 gap-1 mb-3">
                    {[0.5, 1, 1.5, 2].map((s) => (
                      <button 
                        key={s} onClick={() => changeSpeed(s)}
                        className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${playbackSpeed === s ? "bg-[#0f4ff1] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  {/* Quality Section */}
                  <div className="px-3 py-1 mb-1 border-t border-white/5 pt-3 text-[10px] text-white/40 uppercase font-bold tracking-widest">Quality</div>
                  {["Auto", "1080p", "720p", "480p"].map((q) => (
                    <button 
                      key={q} onClick={() => changeQuality(q)}
                      className="w-full px-4 py-2 flex items-center justify-between text-[13px] text-white hover:bg-white/10 transition-colors"
                    >
                      <span className={quality === q ? "text-[#0f4ff1] font-bold" : ""}>{q}</span>
                      {quality === q && <Check size={14} className="text-[#0f4ff1]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setIsTheaterMode(!isTheaterMode)} className="hidden md:block p-1 text-white hover:opacity-80 transition-opacity">
              {isTheaterMode ? <Minimize size={20} /> : <PictureInPicture size={20} />}
            </button>
            
            <button onClick={toggleFullscreen} className="p-1 text-white hover:opacity-80 transition-opacity">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
