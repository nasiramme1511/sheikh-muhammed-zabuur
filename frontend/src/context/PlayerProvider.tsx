import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import type { Lesson } from '../types';
import { PlayerContext, POSITION_STORAGE_PREFIX, lessonToPlaylistItem } from './PlayerContext';
import type { Playlist, PlaylistItem } from './PlayerContext';

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [currentLesson, setCurrentLesson] = useState<PlaylistItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('player-volume');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);
  const [repeat, setRepeat] = useState<'off' | 'one' | 'all'>('off');
  const [shuffle, setShuffle] = useState(false);
  const [playerType, setPlayerType] = useState<'audio' | 'video' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playNextRef = useRef<() => void>(() => {});
  const currentLessonRef = useRef<PlaylistItem | null>(null);
  currentLessonRef.current = currentLesson;

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.preload = 'metadata';

    const handleTimeUpdate = () => {
      const ct = audio.currentTime;
      setCurrentTime(ct);
      updateMediaSessionPosition(ct);
    };
    const handleLoadedMetadata = () => {
      const dur = audio.duration;
      setDuration(dur);
      updateMediaSessionMetadata(dur);
    };
    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        playNextRef.current();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeat]);

  useEffect(() => {
    if (!currentLesson) return;
    const id = currentLesson.id;
    const interval = setInterval(() => {
      if (audioRef.current && isPlaying) {
        try {
          localStorage.setItem(`${POSITION_STORAGE_PREFIX}${id}`, String(audioRef.current.currentTime));
        } catch {}
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [currentLesson?.id, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if ('mediaSession' in navigator && currentLesson) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying, currentLesson]);

  function updateMediaSessionMetadata(dur: number) {
    if (!('mediaSession' in navigator) || !currentLessonRef.current) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentLessonRef.current.title,
      artist: currentLessonRef.current.seriesName || 'Sheikh Mohammed Zabuur',
      album: 'Sheikh Mohammed Zabuur',
      artwork: [
        { src: currentLessonRef.current.image || '/images/sheikh-zabuur.jpg', sizes: '256x256', type: 'image/jpeg' },
      ],
    });
    navigator.mediaSession.setActionHandler('play', () => resume());
    navigator.mediaSession.setActionHandler('pause', () => pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    navigator.mediaSession.setActionHandler('seekforward', () => skipForward(30));
    navigator.mediaSession.setActionHandler('seekbackward', () => skipBackward(15));
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) seek(details.seekTime);
    });
  }

  function updateMediaSessionPosition(ct: number) {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setPositionState({
        duration: duration || 0,
        playbackRate: playbackSpeed,
        position: ct,
      });
    } catch {}
  }

  const playItem = useCallback((item: PlaylistItem, playlist: Playlist | null) => {
    if (!audioRef.current) return;
    audioRef.current.src = item.audioUrl;
    audioRef.current.volume = isMuted ? 0 : volume;
    setCurrentLesson(item);
    setCurrentPlaylist(playlist);
    setCurrentTime(0);
    setDuration(0);
    setPlayerType('audio');
    setIsPlaying(true);
    audioRef.current.play().catch(() => setIsPlaying(false));

    try {
      const saved = localStorage.getItem(`${POSITION_STORAGE_PREFIX}${item.id}`);
      if (saved) {
        const pos = parseFloat(saved);
        if (pos > 0 && pos < (item.duration || Infinity)) {
          try { audioRef.current.currentTime = pos; } catch {}
          setCurrentTime(pos);
        }
      }
    } catch {}
  }, [isMuted, volume]);

  const play = useCallback((lesson: Lesson) => {
    const item = lessonToPlaylistItem(lesson);
    item.type = lesson.videoUrl ? 'video' : 'audio';
    const playlist: Playlist = {
      items: [item],
      currentIndex: 0,
      seriesName: item.seriesName || '',
      seriesSlug: item.seriesSlug || lesson.slug,
    };
    playItem(item, playlist);
  }, [playItem]);

  const playSeries = useCallback((items: Lesson[], seriesName: string, seriesSlug: string, startIndex = 0) => {
    const playlistItems = items.map((l) => {
      const pi = lessonToPlaylistItem(l);
      pi.type = l.videoUrl ? 'video' : 'audio';
      return pi;
    });
    const index = Math.min(startIndex, playlistItems.length - 1);
    const playlist: Playlist = {
      items: playlistItems,
      currentIndex: index,
      seriesName,
      seriesSlug,
    };
    playItem(playlistItems[index], playlist);
  }, [playItem]);

  const playNext = useCallback(() => {
    if (!currentPlaylist || currentPlaylist.items.length === 0) return;
    let nextIndex: number;

    if (shuffle && currentPlaylist.items.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * currentPlaylist.items.length);
      } while (nextIndex === currentPlaylist.currentIndex);
    } else {
      nextIndex = currentPlaylist.currentIndex + 1;
      if (nextIndex >= currentPlaylist.items.length) {
        if (repeat === 'all') {
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }
    }

    const updatedPlaylist: Playlist = {
      ...currentPlaylist,
      currentIndex: nextIndex,
    };
    playItem(currentPlaylist.items[nextIndex], updatedPlaylist);
  }, [currentPlaylist, shuffle, repeat, playItem]);

  playNextRef.current = playNext;

  const playPrevious = useCallback(() => {
    if (!currentPlaylist || currentPlaylist.items.length === 0) return;
    let prevIndex: number;

    if (shuffle && currentPlaylist.items.length > 1) {
      do {
        prevIndex = Math.floor(Math.random() * currentPlaylist.items.length);
      } while (prevIndex === currentPlaylist.currentIndex);
    } else {
      prevIndex = currentPlaylist.currentIndex - 1;
      if (prevIndex < 0) {
        if (repeat === 'all') {
          prevIndex = currentPlaylist.items.length - 1;
        } else {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
          }
          return;
        }
      }
    }

    const updatedPlaylist: Playlist = {
      ...currentPlaylist,
      currentIndex: prevIndex,
    };
    playItem(currentPlaylist.items[prevIndex], updatedPlaylist);
  }, [currentPlaylist, shuffle, repeat, playItem]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && currentLesson) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [currentLesson]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const skipForward = useCallback((seconds = 30) => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.currentTime + seconds, audioRef.current.duration || 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const skipBackward = useCallback((seconds = 15) => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - seconds, 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const close = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setCurrentPlaylist(null);
    setCurrentLesson(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlayerType(null);
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeedState(Math.max(0.5, Math.min(2, Math.round(speed * 100) / 100)));
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  }, []);

  const toggleShuffle = useCallback(() => setShuffle(prev => !prev), []);

  const setVolume = useCallback((v: number) => {
    const vol = Math.max(0, Math.min(1, v));
    setVolumeState(vol);
    localStorage.setItem('player-volume', String(vol));
    if (audioRef.current) audioRef.current.volume = vol;
    if (vol > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (audioRef.current) {
        audioRef.current.muted = newMuted;
      }
      return newMuted;
    });
  }, []);

  const jumpTo = useCallback((index: number) => {
    if (!currentPlaylist || index < 0 || index >= currentPlaylist.items.length) return;
    const updatedPlaylist: Playlist = {
      ...currentPlaylist,
      currentIndex: index,
    };
    playItem(currentPlaylist.items[index], updatedPlaylist);
  }, [currentPlaylist, playItem]);

  return (
    <PlayerContext.Provider
      value={{
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
        playerType,
        play,
        playSeries,
        playNext,
        playPrevious,
        pause,
        resume,
        seek,
        skipForward,
        skipBackward,
        close,
        setPlaybackSpeed,
        toggleRepeat,
        toggleShuffle,
        setVolume,
        toggleMute,
        jumpTo,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
