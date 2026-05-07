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
  onDurationFetched?: (duration: number) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export function VideoPlayer({ src, onEnded, onDurationFetched }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [sourceType, setSourceType] = useState<'upload' | 'youtube' | 'vimeo'>('upload');
  
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState("Auto");
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  
  const playerRef = useRef<any>(null); // For YT
  const videoRef = useRef<HTMLVideoElement>(null); // For Native
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getSourceType = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    return 'upload';
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const type = getSourceType(src);
    setSourceType(type);
    
    if (type === 'youtube') {
      const ytId = getYoutubeId(src);
      if (ytId) loadYoutubeApi(ytId);
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
      window.onYouTubeIframeAPIReady = () => initYoutubePlayer(videoId);
    } else {
      initYoutubePlayer(videoId);
    }
  };

  const initYoutubePlayer = (videoId: string) => {
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
          const d = event.target.getDuration();
          setDuration(formatTime(d));
          if (onDurationFetched) onDurationFetched(d);
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
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (sourceType === 'youtube' && playerRef.current?.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        setProgress((current / total) * 100);
        setCurrentTime(formatTime(current));
      } else if (sourceType === 'upload' && videoRef.current) {
        const current = videoRef.current.currentTime;
        const total = videoRef.current.duration;
        setProgress((current / total) * 100);
        setCurrentTime(formatTime(current));
      }
    }, 500);
  };

  const togglePlay = () => {
    if (sourceType === 'youtube' && playerRef.current) {
      if (isPlaying) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
    } else if (sourceType === 'upload' && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        startTracking();
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const skip = (amount: number) => {
    if (sourceType === 'youtube' && playerRef.current) {
      const current = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(current + amount, true);
    } else if (sourceType === 'upload' && videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (sourceType === 'youtube' && playerRef.current) {
      playerRef.current.seekTo(pos * playerRef.current.getDuration(), true);
    } else if (sourceType === 'upload' && videoRef.current) {
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (sourceType === 'youtube' && playerRef.current) playerRef.current.setVolume(newVol);
    else if (sourceType === 'upload' && videoRef.current) videoRef.current.volume = newVol / 100;
    if (newVol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (sourceType === 'youtube' && playerRef.current) {
      nextMute ? playerRef.current.mute() : playerRef.current.unMute();
    } else if (sourceType === 'upload' && videoRef.current) {
      videoRef.current.muted = nextMute;
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (sourceType === 'youtube' && playerRef.current) playerRef.current.setPlaybackRate(speed);
    else if (sourceType === 'upload' && videoRef.current) videoRef.current.playbackRate = speed;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      setDuration(formatTime(d));
      if (onDurationFetched) onDurationFetched(d);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings && !showVolumeSlider) setShowControls(false);
    }, 3000);
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full relative bg-black transition-all duration-300 overflow-hidden group/player ${isTheaterMode ? "xl:fixed xl:inset-x-0 xl:top-[64px] xl:z-40 xl:h-[70vh] rounded-none" : "rounded-[16px] aspect-video"}`}
      onMouseMove={handleMouseMove}
    >
      {sourceType === 'youtube' ? (
        <div className="w-full h-full pointer-events-none scale-[1.01] overflow-hidden">
          <div id="youtube-player" className="w-full h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      ) : sourceType === 'vimeo' ? (
        <div className="w-full h-full flex items-center justify-center text-white font-sans">
           <iframe src={`https://player.vimeo.com/video/${src.split('/').pop()}?badge=0&autopause=0&player_id=0&app_id=58479`} className="w-full h-full" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
        </div>
      ) : (
        <video 
          ref={videoRef}
          src={src} 
          className="w-full h-full object-contain" 
          onLoadedMetadata={handleMetadataLoaded}
          onEnded={() => { setIsPlaying(false); onEnded(); }}
        />
      )}

      {/* Overlay for Controls Interaction */}
      <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay}></div>

      {/* Center Play/Pause Indicator */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-20 transition-opacity duration-300 ${!isPlaying || showControls ? 'opacity-100' : 'opacity-0'}`}>
        {!isPlaying && (
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm scale-110">
            <Play size={32} className="text-white fill-current ml-1" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 pt-16 pb-3 px-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 z-30 ${showControls ? "opacity-100" : "opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrubber */}
        <div className="w-full h-1 bg-white/20 group/scrubber hover:h-2 transition-all cursor-pointer relative mb-4 rounded-full" onClick={seek}>
          <div className="h-full bg-[#0f4ff1] absolute left-0 top-0 rounded-full" style={{ width: `${progress}%` }}></div>
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full transition-all group-hover/scrubber:scale-150 shadow-md"
            style={{ left: `${progress}%`, marginLeft: '-6px' }}
          ></div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:scale-110 transition-transform">
              {isPlaying ? <Pause size={20} className="text-white fill-white" /> : <Play size={20} className="text-white fill-white" />}
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => skip(-10)} className="hover:opacity-80"><RotateCcw size={18} className="text-white" /></button>
              <button onClick={() => skip(10)} className="hover:opacity-80"><RotateCw size={18} className="text-white" /></button>
            </div>
            <div className="relative flex items-center group/volume" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
              <button onClick={toggleMute} className="hover:opacity-80">
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
            <span className="font-sans font-medium text-[13px] text-white/90 tabular-nums">{currentTime} / {duration}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setShowSettings(!showSettings)} className="text-white hover:rotate-45 transition-transform">
                <Settings size={20} />
              </button>
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-4 bg-black/95 backdrop-blur-md border border-white/10 rounded-xl py-3 min-w-[160px] shadow-2xl z-50">
                  <div className="px-3 py-1 mb-1 text-[10px] text-white/40 uppercase font-bold tracking-widest">Speed</div>
                  <div className="flex flex-wrap px-2 gap-1">
                    {[0.5, 1, 1.5, 2].map((s) => (
                      <button 
                        key={s} onClick={() => changeSpeed(s)}
                        className={`flex-1 px-2 py-1 rounded-lg text-[11px] font-bold ${playbackSpeed === s ? "bg-[#0f4ff1] text-white" : "bg-white/5 text-white/60"}`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={toggleFullscreen} className="text-white hover:opacity-80">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

