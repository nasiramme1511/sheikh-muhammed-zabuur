import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, Play, Video as VideoIcon, Eye, Download, X, Sparkles, Filter, BookOpen,
  Grid3X3, List, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { resources as resourcesApi } from '../lib/api';
import type { Resource } from '../types';
import { useSEO } from '../seo/metadata';
import { useAuthGuard } from '../hooks/useAuthGuard';
import LoginWallModal from '../components/LoginWallModal';
import DownloadButton from '../components/DownloadButton';
import AdvancedVideoPlayer from '../components/AdvancedVideoPlayer';
import { useResourceLibrary } from '../hooks/useResourceLibrary';
import LibraryHeader from '../components/library/LibraryHeader';
import CollectionBrowser from '../components/library/CollectionBrowser';
import FilterBar from '../components/library/FilterBar';
import CategoryNav from '../components/library/CategoryNav';
import EmptyState from '../components/library/EmptyState';
import LoadingSkeleton from '../components/library/LoadingSkeleton';

const ALL_VIDEOS = 'All Videos';

const CATEGORIES = [
  ALL_VIDEOS,
  'Aqeedah', 'Hadith', 'Tafsir', 'Riyadus Salihin', 'Bulugh al-Maram',
  'Fiqh', 'Seerah', 'Tajweed', 'Tajreed', 'Arabic', 'Usul',
  'Manhaj', 'Adab', 'Khutbah', 'Ramadan',
  'Questions & Answers', 'General',
];

export default function VideoLibrary() {
  const { t } = useTranslation();
  const {
    loading, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    sortBy, setSortBy, collectionStats, selectedCollection, setSelectedCollection,
    viewMode, setViewMode, handleClearCollection, filteredItems,
  } = useResourceLibrary({ type: 'VIDEO', allLabel: ALL_VIDEOS });

  useSEO({
    title: t('video.title'), description: t('video.subtitle'), canonical: '/videos',
    keywords: 'Islamic video lectures, watch Quran lessons, Islamic classes video, Aqeedah videos, Tafsir video series, Hadith classes, Fiqh video lectures, Sheikh Mohammed Zabuur videos',
  });

  const [activeVideo, setActiveVideo] = useState<Resource | null>(null);
  const { guardAction, showWall, closeWall } = useAuthGuard();

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getThumbnail = (video: Resource) => {
    const ytId = getYoutubeId(video.url);
    return ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : '/video-placeholder.svg';
  };

  const handleVideoSelect = (video: Resource) => {
    guardAction(() => { setActiveVideo(video); resourcesApi.view(video.id); });
  };

  const active = !!searchQuery || selectedCategory !== ALL_VIDEOS;
  const emptyTitle = active ? t('video.empty_title') : t('video.empty_coming_soon');
  const emptyDesc = active ? t('video.empty_search_desc') : t('video.empty_desc');

  return (
    <div className="min-h-screen bg-surface-900 pt-24 pb-16 text-white px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <LibraryHeader badge={t('video.badge')} heading={t('video.heading')} description={t('video.description')} />

        <CollectionBrowser
          collectionStats={collectionStats}
          selectedCollection={selectedCollection}
          onSelect={setSelectedCollection}
          onClear={handleClearCollection}
          browseLabel={t('video.browse_collections')}
          showingLabel={t('video.showing_only')}
          clearLabel={t('video.clear_collection')}
        />

        <FilterBar
          searchQuery={searchQuery} onSearchChange={setSearchQuery}
          searchPlaceholder={t('video.search_placeholder')}
          sortBy={sortBy} onSortChange={setSortBy}
          sortLatest={t('video.sort_latest')} sortDownloads={t('video.sort_top_downloads')} sortViews={t('video.sort_most_viewed')}
          viewMode={viewMode} onViewModeChange={setViewMode}
          gridTitle={t('video.grid_view')} listTitle={t('video.list_view')}
        />

        <CategoryNav categories={CATEGORIES} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />

        {loading ? (
          <LoadingSkeleton viewMode={viewMode} type="video" />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<VideoIcon className="w-12 h-12 text-icc-400/60" />}
            animation="bounce"
            title={emptyTitle}
            description={emptyDesc}
            showClear={active}
            clearLabel={t('video.clear_filters')}
            onClear={() => { setSearchQuery(''); setSelectedCategory(ALL_VIDEOS); }}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((video, idx) => {
              const isYoutube = !!getYoutubeId(video.url);
              const thumbUrl = getThumbnail(video);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }} key={video.id}
                  onClick={() => handleVideoSelect(video)}
                  className="glass-premium flex flex-col overflow-hidden h-full cursor-pointer group"
                >
                  <div className="relative aspect-video bg-dark-950 overflow-hidden">
                    {isYoutube ? (
                      <img src={thumbUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/video-placeholder.svg'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-icc-950 to-dark-950">
                        <VideoIcon className="w-10 h-10 text-icc-500/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-dark-900/40 group-hover:bg-dark-900/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-icc-500 text-white flex items-center justify-center shadow-lg shadow-icc-500/30 scale-90 group-hover:scale-100 transition-all duration-300">
                        <Play className="w-5 h-5 pl-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[9px] bg-dark-900/80 text-white/80 border border-white/10">
                      {isYoutube ? t('video.source_youtube') : t('video.source_mp4')}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-icc-500/10 text-icc-400 border border-icc-500/20">{video.category}</span>
                        <span className="text-[10px] text-white/40">
                          {new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-icc-400 transition-colors">{video.title}</h3>
                      <p className="text-xs text-white/50 line-clamp-2">{video.description || t('video.no_description')}</p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{video.views} {t('video.views_suffix')}</span>
                      <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                        <DownloadButton resourceId={video.id} type="VIDEO" title={video.title} url={video.url} fileSize={video.size} sizeHuman={video.sizeHuman} description={video.description} category={video.category} variant="full" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((video, idx) => {
              const isYoutube = !!getYoutubeId(video.url);
              const thumbUrl = getThumbnail(video);
              return (
                <motion.div
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }} key={video.id}
                  onClick={() => handleVideoSelect(video)}
                  className="glass-premium flex items-center gap-4 p-3 cursor-pointer group"
                >
                  <div className="relative w-24 h-16 md:w-36 md:h-20 rounded-xl overflow-hidden bg-dark-950 shrink-0">
                    {isYoutube ? (
                      <img src={thumbUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/video-placeholder.svg'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-icc-950 to-dark-950">
                        <VideoIcon className="w-5 h-5 text-icc-500/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-icc-400 transition-colors">{video.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium bg-icc-500/10 text-icc-400 border border-icc-500/20 px-2 py-0.5 rounded">{video.category}</span>
                      <span className="text-[10px] text-white/40 flex items-center gap-1"><Eye className="w-3 h-3" />{video.views}</span>
                      <span className="text-[10px] text-white/40">{new Date(video.createdAt).toLocaleDateString()}</span>
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark-950/95 backdrop-blur-md"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-surface-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-surface-800">
                <span className="text-sm font-semibold text-white truncate max-w-xl">{activeVideo.title}</span>
                <button onClick={() => setActiveVideo(null)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-all border border-white/5">
                  <X className="w-4 h-4 text-white/60 hover:text-red-400" />
                </button>
              </div>

              <div className="aspect-video bg-black relative">
                {getYoutubeId(activeVideo.url) ? (
                  <iframe src={`https://www.youtube.com/embed/${getYoutubeId(activeVideo.url)}?autoplay=1`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen title={activeVideo.title} />
                ) : (
                  <AdvancedVideoPlayer src={activeVideo.url} title={activeVideo.title} videoId={activeVideo.id} autoPlay className="w-full h-full" />
                )}
              </div>

              <div className="p-6 bg-surface-900 border-t border-white/5">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-icc-500/10 text-icc-400 border border-icc-500/20">{activeVideo.category}</span>
                  </div>
                  {!getYoutubeId(activeVideo.url) && (
                    <DownloadButton resourceId={activeVideo.id} type="VIDEO" title={activeVideo.title} url={activeVideo.url} fileSize={activeVideo.size} sizeHuman={activeVideo.sizeHuman} variant="full" />
                  )}
                </div>
                <p className="text-sm text-white/60">{activeVideo.description || t('video.no_details')}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginWallModal isOpen={showWall} onClose={closeWall} />
    </div>
  );
}