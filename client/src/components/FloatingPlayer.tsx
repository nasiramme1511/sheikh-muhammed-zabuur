import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, X } from 'lucide-react';
import { getLocalizedField } from '../lib/language';
import { useLanguage } from '../context/LanguageContext';

export default function FloatingPlayer() {
  const { currentLesson, isPlaying, currentTime, duration, pause, resume, close, seek } = usePlayer();
  const { language } = useLanguage();

  if (!currentLesson) return null;

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-[100]">
      <div className="bg-dark-800/95 backdrop-blur-xl border-t border-white/5 shadow-2xl">
        <div className="h-0.5 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-icc-500 to-icc-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-3 px-4 h-14 md:h-16">
          <button
            onClick={() => (isPlaying ? pause() : resume())}
            className="w-9 h-9 rounded-xl bg-icc-500 hover:bg-icc-600 text-white flex items-center justify-center shrink-0 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {currentLesson.episodeNumber && `${currentLesson.episodeNumber}. `}{getLocalizedField(currentLesson, 'title', language)}
            </p>
          </div>
          <div className="hidden sm:block text-xs text-white/30 tabular-nums shrink-0">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="hidden sm:block w-24 h-1 cursor-pointer accent-icc-500"
          />
          <button
            onClick={close}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
