import { createContext, useContext } from 'react';
import type { Lesson } from '../types';

export interface PlaylistItem {
  id: number;
  title: string;
  slug: string;
  audioUrl: string;
  videoUrl?: string;
  duration: number;
  episodeNumber: number;
  seriesId: number;
  seriesName?: string;
  seriesSlug?: string;
  image?: string;
  type?: 'audio' | 'video';
}

export interface Playlist {
  items: PlaylistItem[];
  currentIndex: number;
  seriesName: string;
  seriesSlug: string;
}

export interface PlayerContextType {
  currentPlaylist: Playlist | null;
  currentLesson: PlaylistItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackSpeed: number;
  repeat: 'off' | 'one' | 'all';
  shuffle: boolean;
  playerType: 'audio' | 'video' | null;
  play: (lesson: Lesson) => void;
  playSeries: (items: Lesson[], seriesName: string, seriesSlug: string, startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  close: () => void;
  setPlaybackSpeed: (speed: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  jumpTo: (index: number) => void;
}

export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function usePlayer(): PlayerContextType {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

export const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
export const POSITION_STORAGE_PREFIX = 'audio-position-';

export function lessonToPlaylistItem(lesson: Lesson): PlaylistItem {
  return {
    id: lesson.id,
    title: lesson.title,
    slug: lesson.slug,
    audioUrl: lesson.audioUrl,
    videoUrl: lesson.videoUrl,
    duration: lesson.duration || 0,
    episodeNumber: lesson.episodeNumber || 0,
    seriesId: lesson.seriesId || lesson.categoryId || lesson.bookId || lesson.levelId || lesson.courseId || lesson.id,
    seriesName: lesson.series?.name || lesson.category?.name || lesson.book?.title || lesson.level?.name || '',
    seriesSlug: lesson.series?.slug || lesson.category?.slug || lesson.book?.slug || lesson.level?.slug || lesson.slug,
    image: lesson.series?.image || lesson.category?.image || lesson.book?.coverImage,
  };
}
