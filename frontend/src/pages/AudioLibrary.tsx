import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, Download, Play, Pause, Music, Volume2, Eye, Sparkles, Filter, BookOpen, Grid3X3, List, ChevronLeft, ChevronRight, Headphones, BarChart3
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { resources as resourcesApi } from '../lib/api';
import { getCollectionBySlug, COLLECTION_COLORS } from '../config/collections';
import type { Resource } from '../types';
import { useSEO } from '../seo/metadata';
import { useAuthGuard } from '../hooks/useAuthGuard';
import LoginWallModal from '../components/LoginWallModal';
import DownloadButton from '../components/DownloadButton';
import { useResourceLibrary } from '../hooks/useResourceLibrary';
import LibraryHeader from '../components/library/LibraryHeader';
import CollectionBrowser from '../components/library/CollectionBrowser';
import FilterBar from '../components/library/FilterBar';
import CategoryNav from '../components/library/CategoryNav';
import EmptyState from '../components/library/EmptyState';
import LoadingSkeleton from '../components/library/LoadingSkeleton';

export default function AudioLibrary() {
  const { t } = useTranslation();
  const allLabel = t('audio.all_lectures');
  const {
    loading, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    sortBy, setSortBy, collectionStats, selectedCollection, setSelectedCollection,
    viewMode, setViewMode, handleClearCollection, filteredItems, setItems,
  } = useResourceLibrary({ type: 'AUDIO', allLabel });

  useSEO({ title: t('audio.title'), description: t('audio.subtitle'), canonical: '/audio', keywords: t('audio.title') });

  const CATEGORIES = [
    allLabel, t('audio.aqeedah'), t('audio.hadith'), t('audio.tafsir'), t('audio.fiqh'),
    t('audio.seerah'), t('audio.tajweed'), t('audio.arabic'), t('audio.usul'),
    t('audio.manhaj'), t('audio.adab'), t('audio.khutbah'), t('audio.ramadan'),
    t('audio.q_and_a'), t('audio.general'),
  ];

  const [currentTrack, setCurrentTrack] = useState<Resource | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const { guardAction, showWall, closeWall } = useAuthGuard();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayPause = (track: Resource) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
      else { audioRef.current?.play(); setIsPlaying(true); resourcesApi.view(track.id); }
    } else {
      setCurrentTrack(track); setIsPlaying(true); setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.src = track.url; audioRef.current.load();
        audioRef.current.play().catch(e => console.error('Audio play error:', e));
      }
      resourcesApi.view(track.id);
    }
  };

  const handlePlayPauseGuarded = (track: Resource) => guardAction(() => handlePlayPause(track));

  const handleDownload = async (id: number, url: string) => {
    try {
      await resourcesApi.download(id);
      setItems(prev => prev.map(a => a.id === id ? { ...a, downloads: (a.downloads || 0) + 1 } : a));
      const a = document.createElement('a'); a.href = url; a.download = ''; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err) { console.error(err); }
  };

  const handleDownloadGuarded = (id: number, url: string) => guardAction(() => handleDownload(id, url));

  const active = !!searchQuery || selectedCategory !== allLabel;
  const emptyTitle = active ? t('audio.empty_title') : t('audio.empty_coming_soon');
  const emptyDesc = active ? t('audio.empty_search_desc') : t('audio.empty_desc');

  return (
    <div className="min-h-screen bg-surface-900 pt-24 pb-16 text-white px-4 md:px-8">
      <audio
        ref={audioRef}
        onTimeUpdate={() => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); }}
        onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration); }}
        onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
      />

      <div className="max-w-7xl mx-auto">
        <LibraryHeader badge={t('audio.badge')} heading={t('audio.heading')} description={t('audio.description')} />

        <CollectionBrowser
          collectionStats={collectionStats}
          selectedCollection={selectedCollection}
          onSelect={setSelectedCollection}
          onClear={handleClearCollection}
          browseLabel={t('audio.browse_collections')}
          showingLabel={t('audio.showing_only')}
          clearLabel={t('audio.clear_collection')}
        />

        <FilterBar
          searchQuery={searchQuery} onSearchChange={setSearchQuery}
          searchPlaceholder={t('audio.search_placeholder')}
          sortBy={sortBy} onSortChange={setSortBy}
          sortLatest={t('audio.sort_latest')} sortDownloads={t('audio.sort_top_downloads')} sortViews={t('audio.sort_most_viewed')}
          viewMode={viewMode} onViewModeChange={setViewMode}
          gridTitle={t('audio.grid_view')} listTitle={t('audio.list_view')}
        />

        <CategoryNav categories={CATEGORIES} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />

        {loading ? (
          <LoadingSkeleton viewMode={viewMode} type="audio" />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<Music className="w-12 h-12 text-icc-400/60" />}
            animation="rotate"
            title={emptyTitle}
            description={emptyDesc}
            showClear={active}
            clearLabel={t('audio.clear_filters')}
            onClear={() => { setSearchQuery(''); setSelectedCategory(allLabel); }}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((audio, idx) => {
              const isCurrent = currentTrack?.id === audio.id;
              const playing = isCurrent && isPlaying;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }} key={audio.id}
                  className={`glass-premium p-6 flex flex-col justify-between h-full relative overflow-hidden group cursor-pointer ${isCurrent ? 'border-icc-500/40 shadow-lg shadow-icc-500/10' : ''}`}
                  onClick={() => handlePlayPauseGuarded(audio)}
                >
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
                      <div className="h-full bg-icc-400 transition-all duration-300" style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }} />
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl ${isCurrent ? 'bg-icc-500 text-white' : 'bg-icc-500/10 text-icc-400 border border-icc-500/20'}`}>
                        {playing ? <BarChart3 className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-white/60">{audio.category}</span>
                        {audio.collection && (() => {
                          const col = getCollectionBySlug(audio.collection);
                          const colColor = col ? (COLLECTION_COLORS[col.slug] || 'bg-white/5 border-white/10 text-white/50') : 'bg-white/5 border-white/10 text-white/50';
                          return <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${colColor}`}>{col?.icon} {col?.name || audio.collection}</span>;
                        })()}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-icc-400 transition-colors">{audio.title}</h3>
                    <p className="text-sm text-white/50 mb-4 line-clamp-2">{audio.description || t('audio.no_description')}</p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{audio.views}</span>
                      <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{audio.downloads}</span>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <DownloadButton resourceId={audio.id} type="AUDIO" title={audio.title} url={audio.url} fileSize={audio.size} sizeHuman={audio.sizeHuman} description={audio.description} category={audio.category} variant="icon" />
                      <button
                        onClick={() => handlePlayPauseGuarded(audio)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${playing ? 'bg-icc-500 text-white' : 'bg-icc-500/10 hover:bg-icc-500/20 text-icc-400 border border-icc-500/20'}`}
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
          <div className="space-y-3">
            {filteredItems.map((audio, idx) => {
              const isCurrent = currentTrack?.id === audio.id;
              const playing = isCurrent && isPlaying;
              return (
                <motion.div
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }} key={audio.id}
                  className={`glass-premium p-4 flex items-center gap-4 group cursor-pointer relative overflow-hidden ${isCurrent ? 'border-icc-500/40 shadow-lg shadow-icc-500/10' : ''}`}
                  onClick={() => handlePlayPauseGuarded(audio)}
                >
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
                      <div className="h-full bg-icc-400 transition-all duration-300" style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }} />
                    </div>
                  )}
                  <div className={`p-3 rounded-xl shrink-0 ${isCurrent ? 'bg-icc-500 text-white' : 'bg-icc-500/10 text-icc-400 border border-icc-500/20'}`}>
                    {playing ? <BarChart3 className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-icc-400 transition-colors">{audio.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/5 border border-white/10 text-white/50 shrink-0">{audio.category}</span>
                      {audio.collection && (() => {
                        const col = getCollectionBySlug(audio.collection);
                        const colColor = col ? (COLLECTION_COLORS[col.slug] || 'bg-white/5 border-white/10 text-white/50') : 'bg-white/5 border-white/10 text-white/50';
                        return <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium border shrink-0 ${colColor}`}>{col?.icon} {col?.name || audio.collection}</span>;
                      })()}
                    </div>
                    <p className="text-xs text-white/40 truncate">{audio.description || t('audio.no_description')}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="hidden sm:flex items-center gap-1"><Eye className="w-3 h-3" />{audio.views}</span>
                    <span className="hidden sm:flex items-center gap-1"><Download className="w-3 h-3" />{audio.downloads}</span>
                    <DownloadButton resourceId={audio.id} type="AUDIO" title={audio.title} url={audio.url} fileSize={audio.size} sizeHuman={audio.sizeHuman} variant="icon" className="w-8 h-8 rounded-lg" />
                    <button
                      onClick={() => handlePlayPauseGuarded(audio)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${playing ? 'bg-icc-500 text-white' : 'bg-icc-500/10 hover:bg-icc-500/20 text-icc-400 border border-icc-500/20'}`}
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
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-surface-900/90 backdrop-blur-xl border-t border-white/10 py-4 px-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0 w-full md:w-1/3">
              <div className="w-10 h-10 rounded-lg bg-icc-500/10 text-icc-400 border border-icc-500/20 flex items-center justify-center shrink-0">
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
                  className="w-10 h-10 rounded-full bg-icc-500 text-white flex items-center justify-center shadow-lg shadow-icc-500/20 hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 pl-0.5" />}
                </button>
              </div>
              <div className="flex items-center gap-2 w-full text-xs text-white/40">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range" min="0" max={duration || 100} value={currentTime}
                  onChange={(e) => { const val = parseFloat(e.target.value); if (audioRef.current) { audioRef.current.currentTime = val; setCurrentTime(val); } }}
                  className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-icc-500 focus:outline-none"
                />
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-end gap-3 w-full md:w-1/3">
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Volume2 className="w-4 h-4 text-white/40" />
                <span>{t('audio.stereo')}</span>
              </div>
              <DownloadButton resourceId={currentTrack.id} type="AUDIO" title={currentTrack.title} url={currentTrack.url} fileSize={currentTrack.size} sizeHuman={currentTrack.sizeHuman} description={currentTrack.description} category={currentTrack.category} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginWallModal isOpen={showWall} onClose={closeWall} />
    </div>
  );
}