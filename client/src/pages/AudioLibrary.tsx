import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Play, Pause, Music, Volume2, Clock, Eye, Sparkles, Filter, Bookmark, CheckCircle, BookOpen,
  Grid3X3, List, ChevronLeft, ChevronRight, Headphones, BarChart3
} from 'lucide-react';
import { resources as resourcesApi, collections as collectionsApi } from '../lib/api';
import { COLLECTIONS, getCollectionBySlug, COLLECTION_COLORS } from '../config/collections';
import type { Resource } from '../types';
import { useSEO } from '../seo/metadata';
import { useAuthGuard } from '../hooks/useAuthGuard';
import LoginWallModal from '../components/LoginWallModal';

const CATEGORIES = [
  'All Lectures',
  'Aqeedah', 'Hadith', 'Tafsir', 'Fiqh', 'Seerah', 'Tajweed',
  'Arabic', 'Usul', 'Manhaj', 'Adab', 'Khutbah', 'Ramadan',
  'Questions & Answers', 'General',
];

export default function AudioLibrary() {
  useSEO({
    title: 'Audio Lectures',
    description: 'Listen to authentic Islamic audio lectures on Aqeedah, Tafsir, Hadith, Fiqh, Seerah, Tajweed and more by Sheikh Mohammed Zabuur. Free Islamic learning in English, Arabic, Amharic, and Afaan Oromo.',
    canonical: '/audio',
    keywords: 'Islamic audio lectures, listen to Quran lectures, Aqeedah audio, Tafsir lessons, Hadith audio, Fiqh lectures, Sheikh Mohammed Zabuur audio, free Islamic audio',
  });

  const [audios, setAudios] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Lectures');
  const [sortBy, setSortBy] = useState<'latest' | 'downloads' | 'views'>('latest');
  const [currentTrack, setCurrentTrack] = useState<Resource | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [collectionStats, setCollectionStats] = useState<Record<string, number>>({});
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { user, showWall, guardAction, closeWall } = useAuthGuard();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAudios();
    fetchCollectionStats();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionAudios(selectedCollection);
    }
  }, [selectedCollection]);

  const fetchAudios = async () => {
    setLoading(true);
    try {
      const res = await resourcesApi.getAll({ type: 'AUDIO' });
      const filtered = res.data.filter((r: any) => r.fileType !== 'recording');
      setAudios(filtered);
    } catch (err) {
      console.error('Error fetching audios:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionAudios = async (slug: string) => {
    setLoading(true);
    try {
      const res = await collectionsApi.getBySlug(slug, { type: 'AUDIO' });
      const data = Array.isArray(res.data) ? res.data : [];
      setAudios(data);
    } catch (err) {
      console.error('Error fetching collection audios:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionStats = async () => {
    try {
      const res = await collectionsApi.getStats();
      setCollectionStats(res.data || {});
    } catch (err) {
      console.error('Error fetching collection stats:', err);
    }
  };

  const handleClearCollection = () => {
    setSelectedCollection(null);
    fetchAudios();
  };

  const filteredAudios = audios
    .filter((audio) => {
      const matchesSearch =
        audio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (audio.description && audio.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All Lectures' ||
        audio.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handlePlayPause = (track: Resource) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
        resourcesApi.view(track.id);
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.load();
        audioRef.current.play().catch(e => console.error('Audio play error:', e));
      }
      resourcesApi.view(track.id);
    }
  };

  const handlePlayPauseGuarded = (track: Resource) => {
    guardAction(() => handlePlayPause(track));
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleDownload = async (id: number, url: string) => {
    try {
      await resourcesApi.download(id);
      setAudios(prev => prev.map(a => a.id === id ? { ...a, downloads: a.downloads + 1 } : a));
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadGuarded = (id: number, url: string) => {
    guardAction(() => handleDownload(id, url));
  };

  const scrollCategories = (dir: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scroll = dir === 'left' ? -200 : 200;
      categoryScrollRef.current.scrollBy({ left: scroll, behavior: 'smooth' });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="min-h-screen bg-surface-900 pt-24 pb-16 text-white px-4 md:px-8">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Audio Library
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-3 tracking-tight"
          >
            Listen to Lectures
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-2xl mx-auto text-base"
          >
            Gain authentic knowledge through audio recordings of Tafsir, Hadith, Aqeedah, and Seerah by Sheikh Mohammed Zabuur.
          </motion.p>
        </div>

        {/* Browse By Collection */}
        {Object.keys(collectionStats).length > 0 && (
          <div className="mb-5">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Browse By Collection
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              {COLLECTIONS.filter(c => (collectionStats[c.slug] || 0) > 0).map(c => (
                <button
                  key={c.slug}
                  onClick={() => setSelectedCollection(c.slug)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm shrink-0 transition-all border ${
                    selectedCollection === c.slug
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : `${COLLECTION_COLORS[c.slug] || 'bg-white/5 text-white/60 border-white/10'} hover:brightness-125`
                  }`}
                >
                  <span>{c.icon}</span>
                  <span className="font-medium whitespace-nowrap">{c.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedCollection === c.slug ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {collectionStats[c.slug]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedCollection && (
          <div className="mb-4 flex items-center gap-2 text-sm bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-white/60">Showing only:</span>
            <span className="font-semibold text-emerald-400">
              {getCollectionBySlug(selectedCollection)?.icon} {getCollectionBySlug(selectedCollection)?.name || selectedCollection}
            </span>
            <button
              onClick={handleClearCollection}
              className="ml-auto px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all"
            >
              Clear Collection Filter
            </button>
          </div>
        )}

        {/* Sticky Filter Bar */}
        <div className="sticky top-20 z-30 flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-surface-900/90 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-lg shadow-black/20">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/40" />
            <input
              type="text"
              placeholder="Search lectures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Sort */}
            <div className="flex gap-1 bg-white/5 border border-white/5 rounded-xl p-0.5">
              {(['latest', 'downloads', 'views'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sortBy === s ? 'bg-emerald-500 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {s === 'latest' ? 'Latest' : s === 'downloads' ? 'Top Downloads' : 'Most Viewed'}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 bg-white/5 border border-white/5 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-white/60 hover:text-white'}`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-white/60 hover:text-white'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="relative mb-6">
          <button
            onClick={() => scrollCategories('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface-900/90 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-all backdrop-blur-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div
            ref={categoryScrollRef}
            className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-10"
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium shrink-0 transition-all whitespace-nowrap ${
                    active
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => scrollCategories('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface-900/90 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-all backdrop-blur-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="animate-pulse bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
                <div className="h-8 bg-white/5 rounded w-full mt-4" />
              </div>
            ))}
          </div>
        ) : filteredAudios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/10 flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Music className="w-12 h-12 text-emerald-400/60" />
                </motion.div>
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-white/80 mb-3"
              >
                {searchQuery || selectedCategory !== 'All Lectures' ? 'No Lectures Found' : 'Audio Library Coming Soon'}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-white/40 max-w-md mx-auto mb-8 leading-relaxed"
              >
                {searchQuery || selectedCategory !== 'All Lectures'
                  ? 'No lectures match your current search criteria. Try adjusting your search terms or selecting a different category to discover Islamic audio content.'
                  : 'Audio lectures by Sheikh Mohammed Zabuur are being prepared. Check back soon for Tafsir, Hadith, and Aqeedah recordings taught in multiple languages.'}
              </motion.p>
              {(searchQuery || selectedCategory !== 'All Lectures') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center gap-3"
                >
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All Lectures'); }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAudios.map((audio, idx) => {
              const isCurrent = currentTrack?.id === audio.id;
              const playing = isCurrent && isPlaying;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={audio.id}
                  className={`glass-premium p-6 flex flex-col justify-between h-full relative overflow-hidden group cursor-pointer ${
                    isCurrent ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/10' : ''
                  }`}
                  onClick={() => handlePlayPauseGuarded(audio)}
                >
                  {/* Progress indicator for currently playing */}
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-300"
                        style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                      />
                    </div>
                  )}

                  <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${isCurrent ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                          {playing ? <BarChart3 className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-white/60">
                            {audio.category}
                          </span>
                          {audio.collection && (() => {
                            const col = getCollectionBySlug(audio.collection);
                            const colColor = col ? (COLLECTION_COLORS[col.slug] || 'bg-white/5 border-white/10 text-white/50') : 'bg-white/5 border-white/10 text-white/50';
                            return (
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${colColor}`}>
                                {col?.icon} {col?.name || audio.collection}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                      {audio.title}
                    </h3>
                    <p className="text-sm text-white/50 mb-4 line-clamp-2">
                      {audio.description || 'No description available for this lecture.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {audio.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                        {audio.downloads}
                      </span>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDownloadGuarded(audio.id, audio.url)}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                        title="Download MP3"
                      >
                        <Download className="w-4 h-4 text-white/70" />
                      </button>
                      <button
                        onClick={() => handlePlayPauseGuarded(audio)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          playing
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 pl-0.5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredAudios.map((audio, idx) => {
              const isCurrent = currentTrack?.id === audio.id;
              const playing = isCurrent && isPlaying;
              return (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={audio.id}
                  className={`glass-premium p-4 flex items-center gap-4 group cursor-pointer relative overflow-hidden ${
                    isCurrent ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/10' : ''
                  }`}
                  onClick={() => handlePlayPauseGuarded(audio)}
                >
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-300"
                        style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                      />
                    </div>
                  )}

                  <div className={`p-3 rounded-xl shrink-0 ${isCurrent ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {playing ? <BarChart3 className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                  </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h3 className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                            {audio.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/5 border border-white/10 text-white/50 shrink-0">
                            {audio.category}
                          </span>
                          {audio.collection && (() => {
                            const col = getCollectionBySlug(audio.collection);
                            const colColor = col ? (COLLECTION_COLORS[col.slug] || 'bg-white/5 border-white/10 text-white/50') : 'bg-white/5 border-white/10 text-white/50';
                            return (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium border shrink-0 ${colColor}`}>
                                {col?.icon} {col?.name || audio.collection}
                              </span>
                            );
                          })()}
                        </div>
                    <p className="text-xs text-white/40 truncate">
                      {audio.description || 'No description'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-white/40 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="hidden sm:flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {audio.views}
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {audio.downloads}
                    </span>
                    <button
                      onClick={() => handleDownloadGuarded(audio.id, audio.url)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                      title="Download MP3"
                    >
                      <Download className="w-3.5 h-3.5 text-white/70" />
                    </button>
                    <button
                      onClick={() => handlePlayPauseGuarded(audio)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        playing
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 pl-0.5" />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Audio Player */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-surface-900/90 backdrop-blur-xl border-t border-white/10 py-4 px-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0 w-full md:w-1/3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Music className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">{currentTrack.title}</h4>
                <p className="text-xs text-white/40 truncate">{currentTrack.category}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 w-full md:w-1/2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handlePlayPauseGuarded(currentTrack)}
                  className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 pl-0.5" />}
                </button>
              </div>
              <div className="flex items-center gap-2 w-full text-xs text-white/40">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                />
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-end gap-3 w-full md:w-1/3">
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Volume2 className="w-4 h-4 text-white/40" />
                <span>Stereo</span>
              </div>
              <button
                onClick={() => handleDownloadGuarded(currentTrack.id, currentTrack.url)}
                className="btn-icc py-2 px-4 text-xs h-9 rounded-lg"
              >
                Download MP3
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginWallModal isOpen={showWall} onClose={closeWall} />
    </div>
  );
}
