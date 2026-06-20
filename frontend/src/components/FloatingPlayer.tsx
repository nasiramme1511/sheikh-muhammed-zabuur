import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, X, Volume2,
  VolumeX, ListMusic, ChevronUp, ChevronDown, FastForward, Rewind,
} from 'lucide-react';
import { useCallback, useState } from 'react';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(t: number) {
  if (!t || !isFinite(t)) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function FloatingPlayer() {
  const [showQueue, setShowQueue] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const {
    currentPlaylist,
    currentLesson,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackSpeed,
    repeat,
    shuffle,
    pause,
    resume,
    seek,
    skipForward,
    skipBackward,
    close,
    jumpTo,
    playNext,
    playPrevious,
    setPlaybackSpeed,
    toggleRepeat,
    toggleShuffle,
    setVolume,
    toggleMute,
  } = usePlayer();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      seek(pct * duration);
    },
    [seek, duration]
  );

  const cycleSpeed = useCallback(() => {
    const idx = SPEEDS.indexOf(playbackSpeed);
    setPlaybackSpeed(SPEEDS[(idx + 1) % SPEEDS.length]);
  }, [playbackSpeed, setPlaybackSpeed]);

  if (!currentLesson) return null;

  const repeatIcon = repeat === 'one' ? '1' : repeat === 'all' ? 'A' : '';
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-[100]"
      >
        <div className={`${isDark ? 'bg-dark-900/95' : 'bg-white/95'} backdrop-blur-xl border-t border-white/10 shadow-2xl`}>
          {/* Progress Bar */}
          <div
            className="h-1.5 bg-white/5 cursor-pointer group relative"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-gradient-to-r from-icc-500 to-icc-400 relative transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-icc-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
            </div>
          </div>

          {/* Mini Player */}
          {!expanded && (
            <div className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3">
              {currentLesson.image ? (
                <img
                  src={currentLesson.image}
                  alt=""
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shrink-0 shadow-md"
                />
              ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-icc-500/15 flex items-center justify-center shrink-0">
                  <Volume2 className="w-5 h-5 text-icc-400" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                {currentLesson.seriesName && (
                  <p className="text-[10px] md:text-xs text-white/40 truncate leading-tight">
                    {currentLesson.seriesName}
                  </p>
                )}
                <p className="text-xs md:text-sm font-medium text-white truncate leading-tight">
                  {currentLesson.episodeNumber ? `Lesson ${currentLesson.episodeNumber}: ` : ''}
                  {currentLesson.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-white/30 tabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  {playbackSpeed !== 1 && (
                    <span className="text-[10px] text-icc-400 font-semibold">{playbackSpeed}x</span>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-0.5 md:gap-1.5">
                <button
                  onClick={() => setExpanded(true)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                  title="Expand"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                <button
                  onClick={toggleShuffle}
                  className={`p-1.5 rounded-lg transition-colors ${
                    shuffle ? 'text-icc-400 bg-icc-500/10' : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                  }`}
                  title="Shuffle"
                >
                  <Shuffle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>

                <button
                  onClick={playPrevious}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                  title="Previous"
                >
                  <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                <button
                  onClick={() => (isPlaying ? pause() : resume())}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-icc-500 hover:bg-icc-600 text-white flex items-center justify-center transition-colors shadow-lg shadow-icc-500/20"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <Play className="w-4 h-4 md:w-5 md:h-5 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={playNext}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                  title="Next"
                >
                  <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                <button
                  onClick={toggleRepeat}
                  className={`p-1.5 rounded-lg transition-colors ${
                    repeat !== 'off' ? 'text-icc-400 bg-icc-500/10' : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                  }`}
                  title={`Repeat: ${repeat}`}
                >
                  <Repeat className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  {repeat === 'one' && (
                    <span className="absolute text-[6px] font-bold text-icc-400">1</span>
                  )}
                </button>
              </div>

              <button
                onClick={close}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors shrink-0"
                title="Close"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          )}

          {/* Expanded Player */}
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/5"
            >
              <div className="p-4 md:p-6">
                <div className="flex items-start gap-4 mb-4">
                  {currentLesson.image ? (
                    <img
                      src={currentLesson.image}
                      alt=""
                      className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-icc-500/15 flex items-center justify-center shrink-0">
                      <Volume2 className="w-8 h-8 text-icc-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {currentLesson.seriesName && (
                      <p className="text-xs text-icc-400 font-semibold truncate">
                        {currentLesson.seriesName}
                      </p>
                    )}
                    <p className="text-sm md:text-base font-bold text-white truncate">
                      {currentLesson.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                      <span>{formatTime(currentTime)}</span>
                      <span className="text-white/20">/</span>
                      <span>{formatTime(duration)}</span>
                      <span className="text-white/20">•</span>
                      <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpanded(false)}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Seek Bar */}
                <div className="mb-4">
                  <div
                    className="h-2 bg-white/10 rounded-full cursor-pointer group relative"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-icc-500 to-icc-400 rounded-full relative transition-[width] duration-75"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-icc-400 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
                  <button
                    onClick={toggleShuffle}
                    className={`p-2 rounded-xl transition-colors ${
                      shuffle ? 'text-icc-400 bg-icc-500/10' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                    title="Shuffle"
                  >
                    <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
                  </button>

                  <button
                    onClick={playPrevious}
                    className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                    title="Previous"
                  >
                    <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
                  </button>

                  <button
                    onClick={() => skipBackward(15)}
                    className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                    title="-15s"
                  >
                    <Rewind className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-[8px] font-bold -mt-1">15</span>
                  </button>

                  <button
                    onClick={() => (isPlaying ? pause() : resume())}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-icc-500 hover:bg-icc-600 text-white flex items-center justify-center transition-colors shadow-xl shadow-icc-500/30"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 md:w-7 md:h-7" />
                    ) : (
                      <Play className="w-6 h-6 md:w-7 md:h-7 ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => skipForward(30)}
                    className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                    title="+30s"
                  >
                    <FastForward className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-[8px] font-bold -mt-1">30</span>
                  </button>

                  <button
                    onClick={playNext}
                    className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                    title="Next"
                  >
                    <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
                  </button>

                  <button
                    onClick={toggleRepeat}
                    className={`p-2 rounded-xl transition-colors relative ${
                      repeat !== 'off' ? 'text-icc-400 bg-icc-500/10' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                    title={`Repeat: ${repeat}`}
                  >
                    <Repeat className="w-4 h-4 md:w-5 md:h-5" />
                    {repeat === 'one' && (
                      <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold">1</span>
                    )}
                  </button>
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Volume */}
                    <div className="relative">
                      <button
                        onClick={toggleMute}
                        className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                        onMouseEnter={() => setShowVolume(true)}
                        onMouseLeave={() => setShowVolume(false)}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      {showVolume && (
                        <div
                          className="absolute bottom-full left-0 mb-2 p-2 rounded-xl bg-surface-900/95 backdrop-blur-xl border border-white/10 shadow-xl"
                          onMouseEnter={() => setShowVolume(true)}
                          onMouseLeave={() => setShowVolume(false)}
                        >
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={isMuted ? 0 : volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-20 h-1 accent-icc-500 cursor-pointer"
                            style={{ writingMode: 'vertical-lr' as any, direction: 'rtl' as any }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Speed */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSpeed(!showSpeed)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                          playbackSpeed !== 1
                            ? 'bg-icc-500/15 text-icc-400 border border-icc-500/20'
                            : 'bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10'
                        }`}
                      >
                        {playbackSpeed}x
                      </button>
                      {showSpeed && (
                        <div
                          className="absolute bottom-full left-0 mb-2 p-2 rounded-xl bg-surface-900/95 backdrop-blur-xl border border-white/10 shadow-xl z-50"
                          onMouseEnter={() => setShowSpeed(true)}
                          onMouseLeave={() => setShowSpeed(false)}
                        >
                          <div className="flex gap-1">
                            {SPEEDS.map(s => (
                              <button
                                key={s}
                                onClick={() => { setPlaybackSpeed(s); setShowSpeed(false); }}
                                className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                                  playbackSpeed === s
                                    ? 'bg-icc-500 text-white'
                                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowQueue(!showQueue)}
                      className={`p-2 rounded-xl transition-colors ${
                        showQueue ? 'bg-icc-500/10 text-icc-400' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                      }`}
                      title="Queue"
                    >
                      <ListMusic className="w-4 h-4 md:w-5 md:h-5" />
                      {currentPlaylist && (
                        <span className="text-[10px] font-medium ml-1">
                          {currentPlaylist.currentIndex + 1}/{currentPlaylist.items.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Queue Panel */}
                <AnimatePresence>
                  {showQueue && currentPlaylist && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 border-t border-white/5 pt-4 max-h-[40vh] overflow-y-auto no-scrollbar"
                    >
                      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                        {currentPlaylist.seriesName || 'Up Next'}
                      </p>
                      <div className="space-y-1">
                        {currentPlaylist.items.map((item, idx) => (
                          <div
                            key={item.id}
                            onClick={() => jumpTo(idx)}
                            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                              currentPlaylist.currentIndex === idx
                                ? 'bg-icc-500/20 text-icc-400'
                                : 'hover:bg-white/5 text-white/70 hover:text-white'
                            }`}
                          >
                            <div className="w-6 text-center text-xs opacity-50 font-mono">
                              {currentPlaylist.currentIndex === idx ? (
                                <Volume2 className="w-4 h-4 mx-auto text-icc-400" />
                              ) : (
                                idx + 1
                              )}
                            </div>
                            {item.image ? (
                              <img src={item.image} alt="" className="w-8 h-8 rounded-md object-cover opacity-80" />
                            ) : (
                              <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center">
                                <Play className="w-3 h-3 opacity-50" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate leading-tight">{item.title}</p>
                              {item.episodeNumber && (
                                <p className="text-[10px] opacity-50 mt-0.5">Lesson {item.episodeNumber}</p>
                              )}
                            </div>
                            <div className="text-xs opacity-50 w-10 text-right">
                              {formatTime(item.duration || 0)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
