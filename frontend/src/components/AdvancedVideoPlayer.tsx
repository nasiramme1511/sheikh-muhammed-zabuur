import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Settings, PictureInPicture, SkipBack, SkipForward,
  Monitor, Sun, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SKIP_SECONDS = 10;

interface Props {
  src: string;
  title?: string;
  videoId: string | number;
  autoPlay?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (time: number, duration: number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  className?: string;
}

export default function AdvancedVideoPlayer({
  src, title, videoId, autoPlay, onEnded, onTimeUpdate,
  onPrevious, onNext, hasPrevious, hasNext, className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resume playback
  useEffect(() => {
    const savedPos = localStorage.getItem(`video-pos-${videoId}`);
    if (savedPos && videoRef.current) {
      videoRef.current.currentTime = parseFloat(savedPos);
    }
  }, [videoId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const resetControlsTimeout = useCallback(() => {
    setIsHovering(true);
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSettings) {
          setIsHovering(false);
          setShowControls(false);
        }
      }, 3000);
    }
  }, [isPlaying, showSettings]);

  const handleMouseMove = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setCurrentTime(current);
    setProgress(total > 0 ? (current / total) * 100 : 0);
    onTimeUpdate?.(current, total);

    if (current > 0 && current % 5 < 1) {
      localStorage.setItem(`video-pos-${videoId}`, current.toString());
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (autoPlay) videoRef.current.play().catch(() => {});
    }
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const time = pct * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      setProgress(pct * 100);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      setIsMuted(v === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleTheaterMode = () => setIsTheaterMode(prev => !prev);

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {}
  };

  const skip = (amount: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += amount;
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
      setShowSettings(false);
    }
  };

  const formatTime = (t: number) => {
    if (!t || !isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black overflow-hidden group ${isTheaterMode ? 'max-w-5xl mx-auto rounded-none' : 'rounded-2xl'} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying && !showSettings) {
          setIsHovering(false);
          setShowControls(false);
        }
      }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain cursor-pointer"
        style={{ maxHeight: isTheaterMode ? '80vh' : '70vh' }}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          localStorage.removeItem(`video-pos-${videoId}`);
          onEnded?.();
        }}
        playsInline
      />

      {/* Center Play Overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-icc-500/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm pointer-events-auto cursor-pointer hover:bg-icc-600 transition-colors"
              onClick={togglePlay}
            >
              <Play className="w-8 h-8 md:w-10 md:h-10 ml-1" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {(showControls || !isPlaying) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-12 md:p-4 md:pt-16 flex flex-col gap-2"
          >
            {/* Progress Bar */}
            <div
              className="relative h-1.5 md:h-2 bg-white/20 rounded-full cursor-pointer group/progress mb-1 md:mb-2"
              onClick={handleSeekClick}
            >
              <div
                className="absolute top-0 left-0 h-full bg-icc-500 rounded-full pointer-events-none"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              {/* Left */}
              <div className="flex items-center gap-1 md:gap-3">
                <button onClick={togglePlay} className="text-white hover:text-icc-400 transition-colors p-1">
                  {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6" />}
                </button>

                <button onClick={onPrevious} disabled={!hasPrevious} className={`p-1 transition-colors ${hasPrevious ? 'text-white/80 hover:text-white' : 'text-white/20'}`}>
                  <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button onClick={() => skip(-SKIP_SECONDS)} className="p-1 text-white/60 hover:text-white transition-colors hidden md:block">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => skip(SKIP_SECONDS)} className="p-1 text-white/60 hover:text-white transition-colors hidden md:block">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={onNext} disabled={!hasNext} className={`p-1 transition-colors ${hasNext ? 'text-white/80 hover:text-white' : 'text-white/20'}`}>
                  <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {/* Volume */}
                <div className="hidden md:flex items-center gap-1">
                  <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors p-1">
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-0 opacity-0 group-hover/controls:w-16 group-hover/controls:opacity-100 transition-all duration-300 accent-icc-500 cursor-pointer"
                  />
                </div>

                <div className="text-xs font-medium text-white/80 tabular-nums hidden sm:block">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Title */}
              {title && (
                <div className="hidden md:block text-sm font-medium text-white/70 max-w-xs truncate">
                  {title}
                </div>
              )}

              {/* Right */}
              <div className="flex items-center gap-1 md:gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-1.5 text-white/70 hover:text-white transition-colors ${showSettings ? 'rotate-45' : ''} duration-300`}
                  >
                    <Settings className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute bottom-full right-0 mb-2 bg-dark-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 w-36 shadow-2xl z-50"
                      >
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-2 py-1">Speed</p>
                        {SPEEDS.map(s => (
                          <button
                            key={s}
                            onClick={() => changeSpeed(s)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              playbackRate === s ? 'bg-icc-500 text-white font-medium' : 'text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {s === 1 ? 'Normal' : `${s}x`}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button onClick={toggleTheaterMode} className="p-1.5 text-white/70 hover:text-white transition-colors" title="Theater Mode">
                  {isTheaterMode ? <Monitor className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>

                <button onClick={togglePiP} className="p-1.5 text-white/70 hover:text-white transition-colors hidden md:block" title="Picture in Picture">
                  <PictureInPicture className="w-4 h-4" />
                </button>

                <button onClick={toggleFullscreen} className="p-1.5 text-white/70 hover:text-white transition-colors">
                  {isFullscreen ? <Minimize className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
