import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Play, Tv, Eye, X, Calendar, Sparkles
} from 'lucide-react';
import { resources as resourcesApi } from '../lib/api';
import { COLLECTIONS, getCollectionBySlug, COLLECTION_COLORS } from '../config/collections';
import type { Resource } from '../types';
import { useSEO } from '../seo/metadata';
import { useTranslation } from '../i18n';
import { useAuthGuard } from '../hooks/useAuthGuard';
import LoginWallModal from '../components/LoginWallModal';

export default function Recordings() {
  const { t } = useTranslation();
  const ALL_RECORDINGS = t('recordings.badge');
  const CATEGORIES = [ALL_RECORDINGS, 'Aqeedah', 'Hadith', 'Tafsir', 'Fiqh', 'Seerah', 'Arabic', 'Tajweed', 'General Lectures'];

  useSEO({
    title: t('recordings.title'),
    description: t('recordings.subtitle'),
  });

  const [recordings, setRecordings] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_RECORDINGS);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_viewed'>('newest');
  const [activeRecording, setActiveRecording] = useState<Resource | null>(null);
  const { guardAction, showWall, closeWall } = useAuthGuard();

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const res = await resourcesApi.getAll({ type: 'recording' });
      setRecordings(res.data);
    } catch (err) {
      console.error('Error fetching recordings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getThumbnail = (rec: Resource) => {
    const ytId = getYoutubeId(rec.url);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
    }
    return `/video-placeholder.jpg`;
  };

  const handleSelectRecording = (rec: Resource) => {
    guardAction(() => {
      setActiveRecording(rec);
      resourcesApi.view(rec.id);
    });
  };

  const processedRecordings = recordings
    .filter((rec) => {
      const matchesSearch =
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.description && rec.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === ALL_RECORDINGS ||
        rec.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesCollection =
        !selectedCollection || rec.collection === selectedCollection;

      return matchesSearch && matchesCategory && matchesCollection;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'most_viewed') return b.views - a.views;
      return 0;
    });

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16 text-white px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 text-icc-400 border border-icc-500/20 text-xs font-semibold uppercase tracking-wider mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('recordings.badge')}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            {t('recordings.heading')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-2xl mx-auto text-base md:text-lg"
          >
            {t('recordings.description')}
          </motion.p>
        </div>

        {/* Filter panel */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center mb-8 bg-dark-800/50 p-4 rounded-2xl border border-white/5 backdrop-blur-xl">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/40" />
            <input
              type="text"
              placeholder={t('recordings.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-icc-500/50 transition-all text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {/* Collection filter */}
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="px-3 py-2 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-icc-500/50"
            >
              <option value="">{t('recordings.all_collections')}</option>
              {COLLECTIONS.map((c) => (
                <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-icc-500/50"
            >
              <option value="newest">{t('recordings.sort_newest')}</option>
              <option value="oldest">{t('recordings.sort_oldest')}</option>
              <option value="most_viewed">{t('recordings.sort_most_viewed')}</option>
            </select>
          </div>

          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar scroll-smooth">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium shrink-0 transition-all ${
                    active
                      ? 'bg-icc-500 text-white shadow-lg shadow-icc-500/20'
                      : 'bg-dark-900/60 text-white/60 hover:text-white border border-white/5 hover:bg-dark-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recordings Card Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="animate-pulse bg-dark-800/40 border border-white/5 rounded-2xl overflow-hidden h-64 flex flex-col justify-between">
                <div className="bg-white/5 h-40 w-full" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : processedRecordings.length === 0 ? (
          <div className="text-center py-24 bg-dark-800/20 rounded-3xl border border-white/5 backdrop-blur-sm">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-icc-500/10 to-icc-600/10 border border-icc-500/10 flex items-center justify-center mx-auto mb-5">
              <Tv className="w-10 h-10 text-icc-400/60" />
            </div>
            <h3 className="text-xl font-bold text-white/80 mb-2">
              {searchQuery || selectedCategory !== ALL_RECORDINGS ? t('recordings.empty_title') : t('recordings.empty_coming_soon')}
            </h3>
            <p className="text-sm text-white/40 max-w-md mx-auto mb-6">
              {searchQuery || selectedCategory !== ALL_RECORDINGS
                ? t('recordings.empty_search_desc')
                : t('recordings.empty_desc')}
            </p>
            {(searchQuery || selectedCategory !== ALL_RECORDINGS) && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory(ALL_RECORDINGS); }}
                className="px-4 py-2 rounded-xl bg-icc-500/10 border border-icc-500/20 text-icc-400 hover:bg-icc-500/20 transition-all text-xs font-medium"
              >
                {t('recordings.clear_filters')}
              </button>
            )}
          </div>
        ) : (() => {
          const grouped: Record<string, Resource[]> = {};
          const other: Resource[] = [];
          processedRecordings.forEach(rec => {
            if (rec.collection && getCollectionBySlug(rec.collection)) {
              const key = rec.collection;
              if (!grouped[key]) grouped[key] = [];
              grouped[key].push(rec);
            } else {
              other.push(rec);
            }
          });
          const groupEntries = Object.entries(grouped);
          const card = (rec: Resource, idx: number) => {
            const isYoutube = !!getYoutubeId(rec.url);
            const thumbUrl = getThumbnail(rec);
            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={rec.id}
                onClick={() => handleSelectRecording(rec)}
                className="glass-card flex flex-col overflow-hidden h-full cursor-pointer group relative"
              >
                <div className="relative aspect-video bg-dark-950 overflow-hidden">
                  {isYoutube ? (
                    <img src={thumbUrl} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = '/video-placeholder.jpg'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-icc-950 to-dark-950">
                      <Tv className="w-10 h-10 text-icc-500/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-dark-900/40 group-hover:bg-dark-900/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-icc-500 text-white flex items-center justify-center shadow-lg shadow-icc-500/30 scale-90 group-hover:scale-100 transition-all duration-300">
                      <Play className="w-5 h-5 pl-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 font-medium uppercase tracking-wider">{t('recordings.replay_badge')}</span>
                </div>
                <div className="p-5 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-icc-500/10 text-icc-400 border border-icc-500/20">{rec.category}</span>
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(rec.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-icc-400 transition-colors">{rec.title}</h3>
                    <p className="text-xs text-white/50 line-clamp-2">{rec.description || t('recordings.no_description')}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-3 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{rec.views} {t('recordings.views_suffix')}</span>
                  </div>
                </div>
              </motion.div>
            );
          };
          return (
            <div className="space-y-10">
              {groupEntries.map(([slug, recs]) => {
                const col = getCollectionBySlug(slug);
                return (
                  <div key={slug}>
                    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl mb-5 ${COLLECTION_COLORS[slug] || 'bg-white/5 text-white/60 border border-white/10'}`}>
                      <span className="text-lg">{col?.icon || '📖'}</span>
                      <h3 className="text-lg font-bold">{col?.name || slug}</h3>
                      <span className="text-sm opacity-60">{recs.length === 1 ? t('recordings.recording_count', { count: recs.length }) : t('recordings.recording_count_plural', { count: recs.length })}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recs.map((rec, idx) => card(rec, idx))}
                    </div>
                  </div>
                );
              })}
              {other.length > 0 && (
                <div>
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl mb-5 bg-white/5 text-white/60 border border-white/10">
                    <span className="text-lg">📚</span>
                    <h3 className="text-lg font-bold">{t('recordings.other_recordings')}</h3>
                    <span className="text-sm opacity-60">{other.length === 1 ? t('recordings.recording_count', { count: other.length }) : t('recordings.recording_count_plural', { count: other.length })}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {other.map((rec, idx) => card(rec, idx))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Video Preview Modal */}
      <AnimatePresence>
        {activeRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark-950/95 backdrop-blur-md"
            onClick={() => setActiveRecording(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-dark-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-dark-850">
                <span className="text-sm font-semibold text-white truncate max-w-xl">{activeRecording.title}</span>
                <button
                  onClick={() => setActiveRecording(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-all border border-white/5"
                >
                  <X className="w-4 h-4 text-white/60 hover:text-red-400" />
                </button>
              </div>

              {/* Player Container */}
              <div className="aspect-video bg-black relative">
                {getYoutubeId(activeRecording.url) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(activeRecording.url)}?autoplay=1`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={activeRecording.title}
                  />
                ) : (
                  <video
                    src={activeRecording.url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Video Info Footer */}
              <div className="p-6 bg-dark-900 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-icc-500/10 text-icc-400 border border-icc-500/20">
                    {activeRecording.category}
                  </span>
                </div>
                <p className="text-sm text-white/60">{activeRecording.description || t('recordings.no_description')}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginWallModal isOpen={showWall} onClose={closeWall} />
    </div>
  );
}
