import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, Play, Video as VideoIcon, FileText, Download, Eye, X, Headphones, Radio, TrendingUp, Sparkles, Send, ArrowRight,
  Grid3X3, List
} from 'lucide-react';
import { FaTelegramPlane } from 'react-icons/fa';
import { search as searchApi, resources as resourcesApi } from '../lib/api';
import { SearchResults, Resource } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n';
import { useSEO } from '../seo/metadata';
import { motion, AnimatePresence } from 'framer-motion';

const POPULAR_SEARCHES = ['Tawheed', 'Fiqh', 'Tafsir', 'Hadith', 'Aqeedah', 'Salah', 'Dua', 'Seerah'];

export default function SearchPage() {
  useSEO({
    title: 'Search',
    description: 'Search Sheikh Muhammed Zabuur and Iman Chercher College for audio lectures, video lessons, PDF books, and more.',
  });

  const { language } = useLanguage();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'audio' | 'videos' | 'pdfs' | 'recordings' | 'telegram'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [activeVideo, setActiveVideo] = useState<Resource | null>(null);
  const [activeAudio, setActiveAudio] = useState<Resource | null>(null);
  const [activePdf, setActivePdf] = useState<Resource | null>(null);

  const isRTL = language === 'ar';

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchApi.all(query)
        .then((res) => {
          setResults(res.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setResults(null);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setSearchParams({ q: input.trim() });
    }
  };

  const getResultsCount = () => {
    if (!results) return 0;
    return (
      (results.audio?.length || 0) + 
      (results.videos?.length || 0) + 
      (results.pdfs?.length || 0) + 
      (results.recordings?.length || 0) +
      (results.telegramChannels?.length || 0)
    );
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
    return '/video-placeholder.svg';
  };

  const handlePlayVideo = (video: Resource) => {
    setActiveVideo(video);
    resourcesApi.view(video.id);
  };

  const handlePlayAudio = (audio: Resource) => {
    setActiveAudio(audio);
    resourcesApi.view(audio.id);
  };

  const handleOpenPdf = (pdf: Resource) => {
    setActivePdf(pdf);
    resourcesApi.view(pdf.id);
  };

  const renderShimmer = () => {
    return (
      <div className="space-y-8 animate-pulse mt-8">
        <div>
          <div className="h-6 bg-white/5 rounded w-48 mb-4 border border-white/5" />
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={`${viewMode === 'grid' ? 'bg-white/5 h-56 rounded-2xl border border-white/5 p-4 space-y-3' : 'bg-white/5 h-20 rounded-2xl border border-white/5 p-4 flex items-center gap-4'}`}>
                {viewMode === 'grid' ? (
                  <>
                    <div className="h-32 bg-white/5 rounded-xl" />
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-white/5 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/5 rounded w-3/4" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface-900 pt-24 pb-16 text-white px-4 md:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        {/* Search Input Section */}
        <div className="relative mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 text-icc-400 border border-icc-500/20 text-xs font-semibold uppercase tracking-wider mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('search_page.global_search')}
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
            {t('search_page.search_portal')}
          </h1>
          <p className="max-w-xl mx-auto text-sm md:text-base text-white/60 mb-6">
            {t('search_page.search_desc')}
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative rounded-2xl shadow-sm">
              <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                <Search className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('search_page.search_placeholder')}
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 text-base sm:text-lg rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:ring-2 focus:ring-icc-500/50 focus:border-transparent outline-none shadow-sm transition-all duration-300`}
              />
              <button
                type="submit"
                className={`absolute top-1.5 bottom-1.5 ${isRTL ? 'left-1.5' : 'right-1.5'} bg-icc-500 hover:bg-icc-600 text-white font-medium px-5 rounded-xl transition-all duration-200 shadow-md`}
              >
                {t('search_page.search_button')}
              </button>
            </div>
          </form>
        </div>

        {/* Default State: Popular searches */}
        {!query && !loading && !results && (
          <div className="max-w-2xl mx-auto mt-8 bg-white/5 border border-white/5 rounded-3xl p-8 shadow-sm backdrop-blur-sm text-center">
            <div className="flex items-center gap-2 mb-6 justify-center">
              <TrendingUp className="w-5 h-5 text-icc-500 animate-bounce" />
              <h2 className="text-base font-bold text-white/80">{t('search.popular_searches')}</h2>
            </div>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setInput(term);
                    setSearchParams({ q: term });
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-900 text-sm font-medium hover:bg-icc-500/10 text-white/60 hover:text-icc-400 border border-white/5 hover:border-icc-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && renderShimmer()}

        {/* Search Results Display */}
        {results && !loading && (
          <div className="space-y-8">
            {/* Sticky Results Summary and Tabs */}
            <div className="sticky top-20 z-30 flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-4 gap-4 bg-surface-900/90 backdrop-blur-xl pt-2">
              <div className="text-sm font-semibold text-white/60">
                {getResultsCount()} {t('search.results_found')} &ldquo;{query}&rdquo;
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-wrap gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                  {[
                    { id: 'all', label: t('search.all'), count: getResultsCount() },
                    { id: 'audio', label: t('search.audio') || 'Audio Lectures', count: results.audio?.length || 0 },
                    { id: 'videos', label: t('search.videos') || 'Video Lectures', count: results.videos?.length || 0 },
                    { id: 'pdfs', label: t('search.pdfs') || 'PDF Library', count: results.pdfs?.length || 0 },
                    { id: 'recordings', label: t('search.recordings') || 'Recordings', count: results.recordings?.length || 0 },
                    { id: 'telegram', label: t('search_page.telegram'), count: results.telegramChannels?.length || 0 },
                  ].map((tab) => {
                    if (tab.count === 0 && tab.id !== 'all') return null;
                    const isActive = selectedTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${isActive ? 'bg-icc-500 text-white shadow-lg shadow-icc-500/20' : 'text-white/60 hover:text-white'}`}
                      >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-surface-900 text-white/40'}`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* View Toggle */}
                <div className="flex gap-1 bg-white/5 border border-white/5 rounded-xl p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-icc-500 text-white' : 'text-white/60 hover:text-white'}`}
                    title="Grid View"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-icc-500 text-white' : 'text-white/60 hover:text-white'}`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Audio Section */}
            {(results.audio?.length || 0) > 0 && (selectedTab === 'all' || selectedTab === 'audio') && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-blue-500" />
                  {t('search.audio') || 'Audio Lectures'} ({results.audio.length})
                </h2>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.audio.map((item) => (
                      <motion.div layout key={item.id} className="glass-premium p-5 flex flex-col justify-between h-full group">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">{item.category}</span>
                            <span className="text-[10px] text-white/40">{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">{item.title}</h3>
                          <p className="text-xs text-white/50 line-clamp-2 mb-4">{item.description || 'Audio lecture delivered by Sheikh Mohammed Zabuur.'}</p>
                        </div>
                        <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                          <button onClick={() => handlePlayAudio(item)} className="flex-1 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/15">
                            <Play className="w-3.5 h-3.5 fill-current" /> Listen Now
                          </button>
                          <a href={item.url} download onClick={() => resourcesApi.download(item.id)} className="p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 text-white/60 hover:text-white transition-all" title="Download Audio File">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.audio.map((item) => (
                      <motion.div layout key={item.id} className="glass-premium p-4 flex items-center gap-4 group">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                          <Headphones className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{item.title}</h3>
                          <p className="text-xs text-white/50 truncate">{item.description || 'Audio lecture'}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => handlePlayAudio(item)} className="btn-icc text-xs px-3 py-1.5 rounded-lg">Play</button>
                          <a href={item.url} download onClick={() => resourcesApi.download(item.id)} className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-white">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Video Section */}
            {(results.videos?.length || 0) > 0 && (selectedTab === 'all' || selectedTab === 'videos') && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-icc-500" />
                  {t('search.videos') || 'Video Lectures'} ({results.videos.length})
                </h2>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.videos.map((item) => {
                      const isYoutube = !!getYoutubeId(item.url);
                      const thumbUrl = getThumbnail(item);
                      return (
                        <motion.div layout key={item.id} onClick={() => handlePlayVideo(item)} className="glass-premium flex flex-col overflow-hidden h-full cursor-pointer group">
                          <div className="relative aspect-video bg-dark-950 overflow-hidden">
                            {isYoutube ? (
                              <img src={thumbUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/video-placeholder.svg'; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-icc-950 to-dark-950">
                                <VideoIcon className="w-10 h-10 text-icc-500/40" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-dark-900/40 group-hover:bg-dark-900/20 transition-colors flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-icc-500 text-white flex items-center justify-center shadow-lg shadow-icc-500/30 scale-90 group-hover:scale-100 transition-all duration-300">
                                <Play className="w-5 h-5 pl-0.5 fill-current" />
                              </div>
                            </div>
                          </div>
                          <div className="p-5 flex flex-col justify-between flex-grow">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-icc-500/10 text-icc-400 border border-icc-500/20">{item.category}</span>
                                <span className="text-[10px] text-white/40">{new Date(item.createdAt).toLocaleDateString()}</span>
                              </div>
                              <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-icc-400 transition-colors">{item.title}</h3>
                              <p className="text-xs text-white/50 line-clamp-2">{item.description || 'Watch video lecture by Sheikh Mohammed Zabuur.'}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.videos.map((item) => {
                      const thumbUrl = getThumbnail(item);
                      return (
                        <motion.div layout key={item.id} onClick={() => handlePlayVideo(item)} className="glass-premium p-3 flex items-center gap-4 cursor-pointer group">
                          <div className="relative w-24 h-16 md:w-36 md:h-20 rounded-xl overflow-hidden bg-dark-950 shrink-0">
                            {thumbUrl && <img src={thumbUrl} alt={item.title} className="w-full h-full object-cover" />}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><Play className="w-5 h-5 text-white" /></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white truncate group-hover:text-icc-400 transition-colors">{item.title}</h3>
                            <p className="text-xs text-white/50 truncate mt-0.5">{item.description || 'Watch video lecture'}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* PDFs Section */}
            {(results.pdfs?.length || 0) > 0 && (selectedTab === 'all' || selectedTab === 'pdfs') && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-purple-500" />
                  {t('search.pdfs') || 'PDF Library'} ({results.pdfs.length})
                </h2>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.pdfs.map((item) => (
                      <motion.div layout key={item.id} className="glass-premium p-5 flex flex-col justify-between h-full group">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">{item.category}</span>
                            <span className="text-[10px] text-white/40">{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-purple-400" />
                            </div>
                            <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-purple-400 transition-colors">{item.title}</h3>
                          </div>
                          <p className="text-xs text-white/50 line-clamp-2 mb-4">{item.description || 'Download or view PDF lesson material and study files.'}</p>
                        </div>
                        <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                          <button onClick={() => handleOpenPdf(item)} className="flex-1 py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/15">
                            <Eye className="w-3.5 h-3.5" /> Read Online
                          </button>
                          <a href={item.url} download onClick={() => resourcesApi.download(item.id)} className="p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 text-white/60 hover:text-white transition-all" title="Download PDF File">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.pdfs.map((item) => (
                      <motion.div layout key={item.id} className="glass-premium p-4 flex items-center gap-4 group">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white truncate group-hover:text-purple-400 transition-colors">{item.title}</h3>
                          <p className="text-xs text-white/50 truncate">{item.description || 'Download PDF'}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => handleOpenPdf(item)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-white/80 hover:bg-white/10">Preview</button>
                          <a href={item.url} download onClick={() => resourcesApi.download(item.id)} className="btn-icc text-xs px-3 py-1.5 rounded-lg">Download</a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Recordings Section */}
            {(results.recordings?.length || 0) > 0 && (selectedTab === 'all' || selectedTab === 'recordings') && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-amber-500" />
                  {t('search.recordings') || 'Recordings'} ({results.recordings.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.recordings.map((item) => {
                    const isYoutube = !!getYoutubeId(item.url);
                    const thumbUrl = getThumbnail(item);
                    return (
                      <motion.div layout key={item.id} onClick={() => handlePlayVideo(item)} className="glass-premium flex flex-col overflow-hidden h-full cursor-pointer group">
                        <div className="relative aspect-video bg-dark-950 overflow-hidden">
                          {isYoutube ? (
                            <img src={thumbUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/video-placeholder.svg'; }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-950 to-dark-950">
                              <Radio className="w-10 h-10 text-amber-500/40" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-dark-900/40 group-hover:bg-dark-900/20 transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 scale-90 group-hover:scale-100 transition-all duration-300">
                              <Play className="w-5 h-5 pl-0.5 fill-current" />
                            </div>
                          </div>
                          <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[8px] font-bold bg-amber-500 text-dark-900 border border-amber-600/30 flex items-center gap-1">
                            <Radio className="w-2.5 h-2.5 animate-pulse" /> RECORDING
                          </span>
                        </div>
                        <div className="p-5 flex flex-col justify-between flex-grow">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">{item.category}</span>
                              <span className="text-[10px] text-white/40">{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">{item.title}</h3>
                            <p className="text-xs text-white/50 line-clamp-2">{item.description || 'Past live broadcast replay by Sheikh Mohammed Zabuur.'}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Telegram Channels Section */}
            {results.telegramChannels && results.telegramChannels.length > 0 && (selectedTab === 'all' || selectedTab === 'telegram') && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-sky-500" />
                  {t('telegram.title')} ({results.telegramChannels.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.telegramChannels.map((ch) => (
                    <a key={ch.id} href={ch.link} target="_blank" rel="noopener noreferrer" className="glass-premium p-5 flex items-start gap-4 group hover:border-sky-500/30 transition-all">
                      <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0 border border-sky-500/20">
                        <FaTelegramPlane className="w-6 h-6 text-[#0088cc]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">{ch.name}</h3>
                        {ch.teacherName && <p className="text-xs text-white/50 mt-0.5">{ch.teacherName}</p>}
                        {ch.description && <p className="text-xs text-white/40 mt-1 line-clamp-2">{ch.description}</p>}
                        <div className="flex items-center gap-1 mt-2 text-xs text-sky-400 font-medium">
                          <Send className="w-3 h-3" />
                          <span>{t('search_page.join')}</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Empty Results State under Selected Filter Tab */}
            {getResultsCount() === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white/80">
                  {t('search.no_results')} &ldquo;{query}&rdquo;
                </h3>
                <p className="text-sm text-white/40 mt-1">
                  Try checking another tab or query term.
                </p>
              </div>
            )}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Modal Player */}
      <AnimatePresence>
        {activeAudio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark-950/90 backdrop-blur-sm"
            onClick={() => setActiveAudio(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-surface-800 border border-white/10 rounded-2xl p-6 shadow-2xl text-center"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                <span className="text-xs text-white/40 uppercase font-semibold tracking-wider">{t('search_page.audio_player')}</span>
                <button onClick={() => setActiveAudio(null)} className="p-1 rounded-lg hover:bg-white/5 text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1 leading-snug line-clamp-2">{activeAudio.title}</h3>
              <p className="text-xs text-white/40 mb-6">{activeAudio.category}</p>
              <audio src={activeAudio.url} controls autoPlay className="w-full mb-4 focus:outline-none" />
              <p className="text-[10px] text-white/30">{t('search_page.html5_controls')}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Modal Viewer */}
      <AnimatePresence>
        {activePdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark-950/95 backdrop-blur-md"
            onClick={() => setActivePdf(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl h-[85vh] bg-surface-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-surface-800">
                <span className="text-sm font-semibold text-white truncate max-w-xl">{activePdf.title}</span>
                <button onClick={() => setActivePdf(null)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-all border border-white/5">
                  <X className="w-4 h-4 text-white/60 hover:text-red-400" />
                </button>
              </div>
              <div className="flex-1 bg-dark-950 relative">
                <iframe src={activePdf.url} className="w-full h-full border-0" title={activePdf.title} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
