import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Eye, FileText, X, BookOpen, Music, Video,
  ChevronLeft, ChevronRight, SlidersHorizontal,
  Library, Maximize2, Users, BookMarked, Grid3X3, Type, DownloadCloud,
  TrendingUp, Clock, BarChart3, File,
} from 'lucide-react';
import { resources as resourcesApi, books } from '../lib/api';
import type { Resource, Book } from '../types';
import { useTranslation } from '../i18n';
import AdvancedVideoPlayer from '../components/AdvancedVideoPlayer';

const ITEMS_PER_PAGE = 20;
const CATEGORIES = ['All Categories', 'Aqeedah', 'Hadith', 'Tafsir', 'Riyadus Salihin', 'Bulugh al-Maram', 'Tajweed', 'Tajreed', 'Usul', 'Fiqh', 'Seerah', 'Arabic', 'Manhaj', 'Adab', 'General'];
const RESOURCE_TYPES = ['All Types', 'PDF', 'AUDIO', 'VIDEO'];

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  PDF: { icon: FileText, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  AUDIO: { icon: Music, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  VIDEO: { icon: Video, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

const CATEGORY_COLORS: Record<string, string> = {
  Tafsir: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Aqeedah: 'bg-icc-500/20 text-icc-300 border-icc-500/30',
  Hadith: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Riyadus Salihin': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Bulugh al-Maram': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  Tajweed: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  Tajreed: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  Usul: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  Fiqh: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Seerah: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Arabic: 'bg-red-500/20 text-red-300 border-red-500/30',
  Manhaj: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  Adab: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  General: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col gap-3">
      <div className="w-12 h-12 rounded-xl bg-white/10" />
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
      <div className="h-3 bg-white/10 rounded w-1/3" />
      <div className="h-3 bg-white/10 rounded w-1/4" />
      <div className="flex gap-2 mt-2">
        <div className="h-8 bg-white/10 rounded-lg flex-1" />
        <div className="h-8 bg-white/10 rounded-lg flex-1" />
      </div>
    </div>
  );
}

interface PreviewModalProps {
  resource: Resource | null;
  onClose: () => void;
}

function PreviewModal({ resource, onClose }: PreviewModalProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
  }, [resource]);

  if (!resource) return null;

  const isPDF = resource.resourceType === 'PDF';
  const isAudio = resource.resourceType === 'AUDIO';
  const isVideo = resource.resourceType === 'VIDEO';
  const typeConf = TYPE_CONFIG[resource.resourceType] || TYPE_CONFIG.PDF;
  const Icon = typeConf.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-dark-900/95 backdrop-blur-xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative flex flex-col bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            fullscreen ? 'w-full h-full' : 'w-full max-w-5xl h-[85vh]'
          }`}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-dark-900/50 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg ${typeConf.bg} ${typeConf.border} border flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${typeConf.color}`} />
              </div>
              <span className="text-sm font-medium text-white truncate">{resource.title}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`/api/download/${resource.id}`}
                download
                onClick={() => resourcesApi.download(resource.id)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-icc-500/20 border border-white/10 flex items-center justify-center transition-all"
                title="Download"
              >
                <Download className="w-4 h-4 text-white/60 hover:text-icc-400" />
              </a>
              <button
                onClick={() => setFullscreen(!fullscreen)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                <Maximize2 className="w-4 h-4 text-white/60" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4 text-white/60 hover:text-red-400" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-dark-900">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-icc-500/30 border-t-icc-500 animate-spin" />
                  <span className="text-sm text-white/40">Loading...</span>
                </div>
              </div>
            )}
            {isPDF ? (
              <iframe
                src={`${resource.url}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full border-0"
                title={resource.title}
                onLoad={() => setLoading(false)}
              />
            ) : isAudio ? (
              <div className="flex items-center justify-center h-full" onLoad={() => setLoading(false)}>
                <audio controls className="w-full max-w-lg px-8" onCanPlay={() => setLoading(false)}>
                  <source src={resource.url} />
                </audio>
              </div>
            ) : isVideo ? (
              <AdvancedVideoPlayer
                src={resource.url}
                title={resource.title}
                videoId={resource.id}
                className="w-full h-full"
                autoPlay
              />
            ) : (
              <img
                src={resource.url}
                alt={resource.title}
                className="w-full h-full object-contain p-4"
                onLoad={() => setLoading(false)}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Resources() {
  const { t } = useTranslation();
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [popularResources, setPopularResources] = useState<Resource[]>([]);
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [bookList, setBookList] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<string>('All Books');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedType, setSelectedType] = useState('All Types');
  const [page, setPage] = useState(1);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  useEffect(() => {
    Promise.all([
      resourcesApi.getAll({}),
      books.getAll(),
      resourcesApi.getPopular(),
      resourcesApi.getRecent(),
    ])
      .then(([resData, booksRes, popularRes, recentRes]) => {
        setAllResources(resData.data as Resource[]);
        setBookList(booksRes.data as Book[]);
        setPopularResources(popularRes.data as Resource[]);
        setRecentResources(recentRes.data as Resource[]);
      })
      .catch(() => setError('Failed to load resources. Please try again.'))
      .finally(() => {
        setLoading(false);
        setLoadingSidebar(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return allResources.filter((r) => {
      const matchesSearch = !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase()) ||
        r.book?.title?.toLowerCase().includes(search.toLowerCase());

      const matchesBook = selectedBook === 'All Books' ||
        (r.book && (r.book.title === selectedBook || String(r.book.id) === selectedBook));

      const matchesCategory = selectedCategory === 'All Categories' || r.category === selectedCategory;

      const matchesType = selectedType === 'All Types' || r.resourceType === selectedType;

      return matchesSearch && matchesBook && matchesCategory && matchesType;
    });
  }, [allResources, search, selectedBook, selectedCategory, selectedType]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (setter: any) => (val: string) => {
    setter(val);
    setPage(1);
  };

  const handlePreview = (resource: Resource) => {
    resourcesApi.view(resource.id).catch(() => {});
    setPreviewResource(resource);

    const updateViews = (list: Resource[]) =>
      list.map((r) => (r.id === resource.id ? { ...r, views: r.views + 1 } : r));
    setAllResources(updateViews);
    setPopularResources(updateViews);
    setRecentResources(updateViews);
  };

  const handleDownload = (resource: Resource) => {
    resourcesApi.download(resource.id).catch(() => {});

    const updateDownloads = (list: Resource[]) =>
      list.map((r) => (r.id === resource.id ? { ...r, downloads: r.downloads + 1 } : r));
    setAllResources(updateDownloads);
    setPopularResources(updateDownloads);
    setRecentResources(updateDownloads);
  };

  return (
    <>
      {previewResource && (
        <PreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} />
      )}

      <main id="main-content" className="min-h-screen pt-24 pb-16">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 mb-12">
          <div className="absolute inset-0 bg-gradient-to-br from-icc-900/30 via-transparent to-purple-900/20 pointer-events-none" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-icc-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400 text-sm font-medium mb-6">
                <Library className="w-4 h-4" />
                {t('resources.islamic_library')}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {t('resources.learning')}{' '}
                <span className="bg-gradient-to-r from-icc-400 to-icc-300 bg-clip-text text-transparent">
                  {t('nav.resources')}
                </span>
              </h1>
              <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10">
                {t('resources.hero_desc')}
              </p>

              {/* Search */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
                  placeholder={t('resources.search_placeholder')}
                  className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all text-sm shadow-xl"
                  id="resources-search"
                  aria-label="Search resources"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4">
          {/* Resource Statistics */}
          {!loadingSidebar && allResources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 text-white/40 text-sm mb-4">
                <BarChart3 className="w-4 h-4" />
                <span>{t('resources.resource_statistics')}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-icc-500/5 border border-icc-500/10 p-4">
                  <div className="flex items-center gap-2 text-icc-400 text-xs font-medium mb-1">
                    <File className="w-3.5 h-3.5" />
                    {t('resources.total_resources_label')}
                   </div>
                   <p className="text-2xl font-bold text-white">{allResources.length}</p>
                 </div>
                 <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-4">
                   <div className="flex items-center gap-2 text-blue-400 text-xs font-medium mb-1">
                     <DownloadCloud className="w-3.5 h-3.5" />
                     {t('resources.total_downloads')}
                   </div>
                   <p className="text-2xl font-bold text-white">
                     {allResources.reduce((sum, r) => sum + (r.downloads || 0), 0).toLocaleString()}
                   </p>
                 </div>
                 <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-4">
                   <div className="flex items-center gap-2 text-purple-400 text-xs font-medium mb-1">
                     <Eye className="w-3.5 h-3.5" />
                     {t('resources.total_views')}
                   </div>
                   <p className="text-2xl font-bold text-white">
                     {allResources.reduce((sum, r) => sum + (r.views || 0), 0).toLocaleString()}
                   </p>
                 </div>
                 <div className="rounded-xl bg-icc-500/5 border border-icc-500/10 p-4">
                   <div className="flex items-center gap-2 text-icc-400 text-xs font-medium mb-1">
                     <BookOpen className="w-3.5 h-3.5" />
                     {t('resources.categories_label')}
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {new Set(allResources.map(r => r.category)).size}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Popular Downloads & Recent Uploads */}
          {!loadingSidebar && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Popular Downloads */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-dark-800/40 border border-white/5 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                  <TrendingUp className="w-4 h-4 text-icc-400" />
                  <span className="text-sm font-medium text-white">{t('resources.most_downloaded_resources')}</span>
                </div>
                <div className="p-3">
                  {popularResources.length === 0 ? (
                    <p className="text-sm text-white/30 text-center py-6">{t('resources.no_downloads_yet')}</p>
                  ) : (
                    <div className="space-y-1">
                      {popularResources.slice(0, 5).map((r, i) => {
                        const TypeIcon = TYPE_CONFIG[r.resourceType]?.icon || FileText;
                        const tColor = TYPE_CONFIG[r.resourceType]?.color || 'text-white/40';
                        return (
                          <div
                            key={r.id}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => handlePreview(r)}
                          >
                            <span className="text-xs font-bold text-white/20 w-5 shrink-0 text-right">#{i + 1}</span>
                            <div className={`w-7 h-7 rounded-lg ${TYPE_CONFIG[r.resourceType]?.bg || 'bg-white/5'} flex items-center justify-center shrink-0`}>
                              <TypeIcon className={`w-3.5 h-3.5 ${tColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white/80 truncate">{r.title}</p>
                              <p className="text-xs text-white/30 truncate">
                                {r.downloads} downloads
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-white/40 shrink-0">
                              <DownloadCloud className="w-3 h-3" />
                              {r.downloads}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Recent Uploads */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl bg-dark-800/40 border border-white/5 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                  <Clock className="w-4 h-4 text-icc-400" />
                  <span className="text-sm font-medium text-white">{t('resources.recently_added_resources')}</span>
                </div>
                <div className="p-3">
                  {recentResources.length === 0 ? (
                    <p className="text-sm text-white/30 text-center py-6">{t('resources.no_resources_yet')}</p>
                  ) : (
                    <div className="space-y-1">
                      {recentResources.slice(0, 5).map((r) => {
                        const TypeIcon = TYPE_CONFIG[r.resourceType]?.icon || FileText;
                        const tColor = TYPE_CONFIG[r.resourceType]?.color || 'text-white/40';
                        return (
                          <div
                            key={r.id}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => handlePreview(r)}
                          >
                            <div className={`w-7 h-7 rounded-lg ${TYPE_CONFIG[r.resourceType]?.bg || 'bg-white/5'} flex items-center justify-center shrink-0`}>
                              <TypeIcon className={`w-3.5 h-3.5 ${tColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white/80 truncate">{r.title}</p>
                              <p className="text-xs text-white/30 truncate">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="text-xs text-white/30 shrink-0">{r.sizeHuman}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* Filter Panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 text-white/40 text-sm mb-4">
              <SlidersHorizontal className="w-4 h-4" />
              <span>{t('resources.filters')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Book Dropdown */}
              <div className="relative">
                <BookMarked className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
                <select
                  value={selectedBook}
                  onChange={(e) => handleFilterChange(setSelectedBook)(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all"
                  aria-label="Filter by book"
                >
                  <option value="All Books">All Books</option>
                  {bookList.map((b) => (
                    <option key={b.id} value={b.title}>{b.title}</option>
                  ))}
                </select>
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <Grid3X3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
                <select
                  value={selectedCategory}
                  onChange={(e) => handleFilterChange(setSelectedCategory)(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all"
                  aria-label="Filter by category"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Type Dropdown */}
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
                <select
                  value={selectedType}
                  onChange={(e) => handleFilterChange(setSelectedType)(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all"
                  aria-label="Filter by resource type"
                >
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t} value={t}>{t === 'All Types' ? 'All Types' : t === 'AUDIO' ? 'Audio' : t === 'VIDEO' ? 'Video' : t}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Stats bar */}
          <div className="flex items-center justify-between mb-6 text-sm text-white/40">
            <span>
              {loading ? t('common.loading') : t('resources.resources_found', { count: filtered.length })}
              {search && <span className="ml-1">for "<span className="text-icc-400">{search}</span>"</span>}
            </span>
            {totalPages > 1 && (
              <span>{t('common.page')} {page} {t('common.of')} {totalPages}</span>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="text-center py-16">
              <div className="text-red-400 mb-2">{error}</div>
              <button onClick={() => window.location.reload()} className="btn-icc text-sm px-4 py-2">
                {t('common.retry')}
              </button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : paginated.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-lg font-medium text-white/40 mb-2">{t('resources.no_resources_found')}</p>
              <p className="text-sm text-white/25">{t('resources.try_adjusting')}</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              {paginated.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onPreview={() => handlePreview(resource)}
                  onDownload={() => handleDownload(resource)}
                />
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 mt-12"
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-white/70" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-white/30 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium border transition-all ${
                        page === p
                          ? 'bg-icc-500 text-white border-icc-500 shadow-lg shadow-icc-500/25'
                          : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4 text-white/70" />
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}

interface ResourceCardProps {
  resource: Resource;
  onPreview: () => void;
  onDownload: () => void;
}

function ResourceCard({ resource, onPreview, onDownload }: ResourceCardProps) {
  const { t } = useTranslation();
  const catColor = CATEGORY_COLORS[resource.category] || CATEGORY_COLORS.General;
  const typeConf = TYPE_CONFIG[resource.resourceType] || TYPE_CONFIG.PDF;
  const TypeIcon = typeConf.icon;

  const isArabic = /[\u0600-\u06FF]/.test(resource.title);

  const getPreviewText = () => {
    if (resource.resourceType === 'PDF') return t('resources.preview_pdf');
    if (resource.resourceType === 'AUDIO') return t('resources.play_audio');
    if (resource.resourceType === 'VIDEO') return t('resources.watch_video');
    return t('resources.preview');
  };

  const getDownloadText = () => {
    if (resource.resourceType === 'PDF') return t('resources.download_pdf');
    if (resource.resourceType === 'AUDIO') return t('resources.download_audio');
    if (resource.resourceType === 'VIDEO') return t('resources.download_video');
    return t('resources.download');
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      className="group relative flex flex-col rounded-2xl bg-dark-800/60 border border-white/8 hover:border-icc-500/30 hover:bg-dark-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-icc-500/5 overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-icc-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Thumbnail / Icon */}
        <div className="flex items-start justify-between">
          {resource.thumbnail ? (
            <img
              src={resource.thumbnail}
              alt={resource.title}
              className="w-12 h-12 rounded-xl object-cover"
            />
          ) : (
            <div className={`w-12 h-12 rounded-xl ${typeConf.bg} ${typeConf.border} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
              <TypeIcon className={`w-6 h-6 ${typeConf.color}`} />
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${catColor}`}>
              {resource.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="flex-1 min-h-0 font-icc-title">
          <h3
            className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-icc-300 transition-colors"
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            {resource.title}
          </h3>
        </div>

        {/* Book */}
        <div className="space-y-1">
          {resource.book && (
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <BookMarked className="w-3 h-3" />
              <span className="truncate">{resource.book.title}</span>
            </div>
          )}
        </div>

        {/* Meta: size + downloads + views */}
        <div className="flex items-center gap-3 text-xs text-white/30">
          <span>{resource.sizeHuman}</span>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{resource.views || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <DownloadCloud className="w-3 h-3" />
            <span>{resource.downloads || 0}</span>
          </div>
        </div>

        {/* Inline Audio Player */}
        {resource.resourceType === 'AUDIO' && (
          <div className="mt-1 shrink-0">
            <audio
              controls
              src={resource.url}
              onPlay={onPreview}
              className="w-full h-8 rounded-lg bg-white/5"
            />
          </div>
        )}

        {/* Inline Video Player */}
        {resource.resourceType === 'VIDEO' && (
          <div className="mt-1 shrink-0 rounded-xl overflow-hidden bg-black aspect-video border border-white/5">
            <AdvancedVideoPlayer
              src={resource.url}
              videoId={resource.id}
              className="w-full h-full"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1 mt-auto">
          <button
            onClick={onPreview}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-icc-500/15 border border-white/8 hover:border-icc-500/30 text-white/60 hover:text-icc-400 text-xs font-medium transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            {getPreviewText()}
          </button>
          <a
            href={`/api/download/${resource.id}`}
            download
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-icc-500/10 hover:bg-icc-500/20 border border-icc-500/20 hover:border-icc-500/40 text-icc-400 text-xs font-medium transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {getDownloadText()}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
