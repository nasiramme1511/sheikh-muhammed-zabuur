import { useRef, useState, useEffect, useCallback } from 'react';
import {
  HiPlay, HiPause,
  HiVolumeUp, HiVolumeOff,
  HiBookmark, HiBookmark as HiBookmarkSolid,
  HiChevronDoubleRight, HiChevronDoubleLeft,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { bookmarks as bookmarksApi, progress as progressApi } from '../lib/api';
import toast from 'react-hot-toast';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface Props {
  audioUrl: string;
  lessonId: number;
  initialPosition?: number;
  onPositionUpdate?: (position: number) => void;
  isBookmarked?: boolean;
}

export default function AudioPlayer({ audioUrl, lessonId, initialPosition = 0, onPositionUpdate, isBookmarked: initBookmarked = false }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { t } = useTranslation();
  const { user } = useAuth();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [bookmarked, setBookmarked] = useState(initBookmarked);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (audioRef.current && initialPosition > 0) {
      audioRef.current.currentTime = initialPosition;
    }
  }, [initialPosition]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }, [playing]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const ct = audioRef.current.currentTime;
    setCurrentTime(ct);
    if (user && Math.floor(ct) % 15 === 0) {
      progressApi.update(lessonId, ct).catch(() => {});
    }
    onPositionUpdate?.(ct);
  };

  const handleLoaded = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const skipForward = () => seek(currentTime + 15);
  const skipBackward = () => seek(currentTime - 10);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
      if (v > 0) setMuted(false);
    }
  };

  const toggleSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast.error(t('audio_player.sign_in_bookmark'));
      return;
    }
    setLoadingBookmark(true);
    try {
      if (bookmarked) {
        await bookmarksApi.remove(lessonId);
        setBookmarked(false);
        toast.success(t('audio_player.bookmark_removed'));
      } else {
        await bookmarksApi.add(lessonId);
        setBookmarked(true);
        toast.success(t('audio_player.bookmarked'));
      }
    } catch {
      toast.error(t('audio_player.bookmark_failed'));
    } finally {
      setLoadingBookmark(false);
    }
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoaded}
        onEnded={() => {
          setPlaying(false);
          if (user) progressApi.update(lessonId, duration, true).catch(() => {});
        }}
        preload="metadata"
      />

      {/* Row 1: Progress bar */}
      <div className="mb-3">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="audio-player w-full cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Row 2: Main controls */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <button onClick={skipBackward} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <HiChevronDoubleLeft className="w-5 h-5" />
        </button>
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-all active:scale-95"
        >
          {playing ? <HiPause className="w-6 h-6" /> : <HiPlay className="w-6 h-6 ml-0.5" />}
        </button>
        <button onClick={skipForward} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <HiChevronDoubleRight className="w-5 h-5" />
        </button>
      </div>

      {/* Row 3: Secondary controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            {muted || volume === 0 ? <HiVolumeOff className="w-5 h-5" /> : <HiVolumeUp className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            className="audio-player w-20 cursor-pointer"
          />
        </div>

        <button
          onClick={toggleSpeed}
          className="px-2.5 py-1 text-xs font-semibold rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {speed}x
        </button>

        <button
          onClick={toggleBookmark}
          disabled={loadingBookmark}
          className={`p-2 rounded-lg transition-colors ${bookmarked ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <HiBookmarkSolid className={`w-5 h-5 ${bookmarked ? 'fill-current' : 'opacity-50'}`} />
        </button>
      </div>
    </div>
  );
}
