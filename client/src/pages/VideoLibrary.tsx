import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Play, Video as VideoIcon, Eye, Download, X, Sparkles, Maximize2, Filter, BookOpen,
  Grid3X3, List, ChevronLeft, ChevronRight, Clock, Film
} from 'lucide-react';
import { resources as resourcesApi, collections as collectionsApi } from '../lib/api';
import { COLLECTIONS, getCollectionBySlug, COLLECTION_COLORS } from '../config/collections';
import type { Resource } from '../types';
import { useSEO } from '../seo/metadata';
import { useAuthGuard } from '../hooks/useAuthGuard';
import LoginWallModal from '../components/LoginWallModal';

const CATEGORIES = [
  'All Videos',
  'Aqeedah', 'Hadith', 'Tafsir', 'Fiqh', 'Seerah', 'Tajweed',
  'Arabic', 'Usul', 'Manhaj', 'Adab', 'Khutbah', 'Ramadan',
  'Questions & Answers', 'General',
];

export default function VideoLibrary() {
  useSEO({
    title: 'Video Lectures',
    description: 'Watch high-quality Islamic video lectures and classes on Aqeedah, Tafsir, Hadith, Fiqh, Seerah, Tajweed and more by Sheikh Mohammed Zabuur. Free Islamic education videos.',
    canonical: '/videos',
    keywords: 'Islamic video lectures, watch Quran lessons, Islamic classes video, Aqeedah videos, Tafsir video series, Hadith classes, Fiqh video lectures, Sheikh Mohammed Zabuur videos',
  });

  const [videos, setVideos] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Videos');
  const [sortBy, setSortBy] = useState<'latest' | 'downloads' | 'views'>('latest');
  const [activeVideo, setActiveVideo] = useState<Resource | null>(null);
  const [collectionStats, setCollectionStats] = useState<Record<string, number>>({});
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { guardAction, showWall, closeWall } = useAuthGuard();

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVideos();
    fetchCollectionStats();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionVideos(selectedCollection);
    }
  }, [selectedCollection]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await resourcesApi.getAll({ type: 'VIDEO' });
      const filtered = res.data.filter((r: any) => r.fileType !== 'recording');
      setVideos(filtered);
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionVideos = async (slug: string) => {
    setLoading(true);
    try {
      const res = await collectionsApi.getBySlug(slug, { type: 'VIDEO' });
      const data = Array.isArray(res.data) ? res.data : [];
      setVideos(data);
    } catch (err) {
      console.error('Error fetching collection videos:', err);
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
    fetchVideos();
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getThumbnail = (video: Resource) => {
    const ytId = getYoutubeId(video.url);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
    }
    return '/video-placeholder.jpg';
  };

  const handleVideoSelect = (video: Resource) => {
    guardAction(() => {
      setActiveVideo(video);
      resourcesApi.view(video.id);
    });
  };

  const handleVideoDownloadGuarded = (id: number, url: string) => {
    guardAction(() => {
      resourcesApi.download(id);
      window.open(url, '_blank');
    });
  };

  const filteredVideos = videos
    .filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All Videos' ||
        video.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const scrollCategories = (dir: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 pt-24 pb-16 text-white px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Video Library
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-3 tracking-tight"
          >
            Watch Video Lectures
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-2xl mx-auto text-base"
          >
            Watch high-quality, structured classes and video series covering essential Islamic topics with Sheikh Mohammed Zabuur.
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
        <div className="sticky top-20 z-30 flex flex-col md:flex-row gap-4 justify-between items-center mb-6 bg-surface-900/90 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-lg shadow-black/20">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/40" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
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
              <div key={idx} className="animate-pulse bg-white/5 border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between">
                <div className="bg-white/5 aspect-video w-full" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
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
                className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/10 flex items-center justify-center"
              >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                  <VideoIcon className="w-12 h-12 text-emerald-400/60" />
                </motion.div>
              </motion.div>
              <h3 className="text-2xl font-bold text-white/80 mb-3">
                {searchQuery || selectedCategory !== 'All Videos' ? 'No Videos Found' : 'Video Library Coming Soon'}
              </h3>
              <p className="text-sm text-white/40 max-w-md mx-auto mb-8 leading-relaxed">
                {searchQuery || selectedCategory !== 'All Videos'
                  ? 'No videos match your current search criteria. Try different keywords or browse another category to find Islamic video content.'
                  : 'Video lectures by Sheikh Mohammed Zabuur are being prepared. Subscribe to stay notified when new content is uploaded and published.'}
              </p>
              {(searchQuery || selectedCategory !== 'All Videos') && (
                <motion.div>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All Videos'); }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium flex items-center gap-2 mx-auto"
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
            {filteredVideos.map((video, idx) => {
              const isYoutube = !!getYoutubeId(video.url);
              const thumbUrl = getThumbnail(video);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={video.id}
                  onClick={() => handleVideoSelect(video)}
                  className="glass-premium flex flex-col overflow-hidden h-full cursor-pointer group"
                >
                  <div className="relative aspect-video bg-dark-950 overflow-hidden">
                    {isYoutube ? (
                      <img
                        src={thumbUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/video-placeholder.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950 to-dark-950">
                        <VideoIcon className="w-10 h-10 text-emerald-500/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-dark-900/40 group-hover:bg-dark-900/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 scale-90 group-hover:scale-100 transition-all duration-300">
                        <Play className="w-5 h-5 pl-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[9px] bg-dark-900/80 text-white/80 border border-white/10">
                      {isYoutube ? 'YouTube' : 'MP4 File'}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {video.category}
                        </span>
                        <span className="text-[10px] text-white/40">
                          {new Date(video.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-xs text-white/50 line-clamp-2">
                        {video.description || 'Watch class video recording by Sheikh Mohammed Zabuur.'}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {video.views} views
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredVideos.map((video, idx) => {
              const isYoutube = !!getYoutubeId(video.url);
              const thumbUrl = getThumbnail(video);
              return (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={video.id}
                  onClick={() => handleVideoSelect(video)}
                  className="glass-premium flex items-center gap-4 p-3 cursor-pointer group"
                >
                  <div className="relative w-24 h-16 md:w-36 md:h-20 rounded-xl overflow-hidden bg-dark-950 shrink-0">
                    {isYoutube ? (
                      <img
                        src={thumbUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/video-placeholder.jpg'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950 to-dark-950">
                        <VideoIcon className="w-5 h-5 text-emerald-500/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{video.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">{video.category}</span>
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {video.views}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Download className="w-4 h-4 text-white/40" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Modal Player */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark-950/95 backdrop-blur-md"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-surface-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-surface-800">
                <span className="text-sm font-semibold text-white truncate max-w-xl">{activeVideo.title}</span>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-all border border-white/5"
                >
                  <X className="w-4 h-4 text-white/60 hover:text-red-400" />
                </button>
              </div>

              <div className="aspect-video bg-black relative">
                {getYoutubeId(activeVideo.url) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(activeVideo.url)}?autoplay=1`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={activeVideo.title}
                  />
                ) : (
                  <video
                    src={activeVideo.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="p-6 bg-surface-900 border-t border-white/5">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {activeVideo.category}
                    </span>
                  </div>
                  {!getYoutubeId(activeVideo.url) && (
                    <button
                      onClick={() => handleVideoDownloadGuarded(activeVideo.id, activeVideo.url)}
                      className="btn-icc text-xs py-2 px-4 rounded-lg flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" /> Download Video File
                    </button>
                  )}
                </div>
                <p className="text-sm text-white/60">{activeVideo.description || 'No additional details provided for this video lecture.'}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginWallModal isOpen={showWall} onClose={closeWall} />
    </div>
  );
}
