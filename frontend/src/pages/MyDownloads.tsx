import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Music, Video, FileText, Trash2, Search, ArrowLeft,
  Download, Clock, Headphones, Play, BookOpen,
  HardDrive, AlertCircle, ChevronDown
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { useOffline } from '../context/OfflineContext';
import { removeDownload, getOfflineBlobUrl, updatePlayPosition } from '../lib/offline/download';
import type { OfflineResource } from '../types';

type TabType = 'all' | 'audio' | 'video' | 'pdf';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const typeIcons: Record<string, any> = {
  AUDIO: Music,
  VIDEO: Video,
  PDF: FileText,
};

const typeColors: Record<string, string> = {
  AUDIO: 'text-icc-400 bg-icc-500/10 border-icc-500/20',
  VIDEO: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  PDF: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

export default function MyDownloads() {
  const { t } = useTranslation();
  const { state, refresh } = useOffline();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'size'>('date');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  const filtered = useMemo(() => {
    let items = state.resources.filter((r) => r.status === 'completed');
    if (activeTab !== 'all') {
      items = items.filter((r) => r.type === activeTab.toUpperCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((r) => r.title.toLowerCase().includes(q));
    }
    items.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'size') return b.fileSize - a.fileSize;
      return b.downloadedAt - a.downloadedAt;
    });
    return items;
  }, [state.resources, activeTab, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const completed = state.resources.filter((r) => r.status === 'completed');
    return {
      audio: completed.filter((r) => r.type === 'AUDIO').length,
      video: completed.filter((r) => r.type === 'VIDEO').length,
      pdf: completed.filter((r) => r.type === 'PDF').length,
      total: completed.length,
      usedBytes: completed.reduce((sum, r) => sum + (r.fileSize || 0), 0),
    };
  }, [state.resources]);

  async function handlePlay(resource: OfflineResource) {
    if (resource.type === 'AUDIO') {
      if (playingId === resource.id) {
        audioEl?.pause();
        setPlayingId(null);
        return;
      }
      const url = await getOfflineBlobUrl(resource.id);
      if (!url) return;
      if (audioEl) audioEl.pause();
      const audio = new Audio(url);
      if (resource.playPosition) audio.currentTime = resource.playPosition;
      audio.play();
      audio.addEventListener('timeupdate', () => {
        updatePlayPosition(resource.id, Math.floor(audio.currentTime));
      });
      audio.addEventListener('ended', () => {
        setPlayingId(null);
        URL.revokeObjectURL(url);
      });
      setAudioEl(audio);
      setPlayingId(resource.id);
    } else if (resource.type === 'VIDEO') {
      window.open(`/offline/video/${resource.id}`, '_blank');
    } else if (resource.type === 'PDF') {
      window.open(`/offline/pdf/${resource.id}`, '_blank');
    }
  }

  async function handleDelete(id: string) {
    await removeDownload(id);
    refresh();
  }

  function getResourceUrl(type: string): string {
    if (type === 'AUDIO') return '/audio';
    if (type === 'VIDEO') return '/videos';
    return '/pdfs';
  }

  const tabs: { key: TabType; label: string; count: number; icon: any }[] = [
    { key: 'all', label: 'All', count: stats.total, icon: HardDrive },
    { key: 'audio', label: 'Audio', count: stats.audio, icon: Music },
    { key: 'video', label: 'Video', count: stats.video, icon: Video },
    { key: 'pdf', label: 'PDF', count: stats.pdf, icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-icc-400 hover:text-icc-300 mb-3 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> {t('common.back')}
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Downloads</h1>
            <p className="text-sm text-white/50 mt-1">
              {stats.total} items &middot; {formatBytes(stats.usedBytes)} used
              {state.storageTotal > 0 && ` of ${formatBytes(state.storageTotal)}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search downloads..."
                className="w-full sm:w-56 pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 transition-all"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-icc-500/50 transition-all"
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="size">Size</option>
            </select>
          </div>
        </div>

        {/* Storage bar */}
        {state.storageTotal > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-xs text-white/50 mb-2">
              <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> Storage</span>
              <span>{formatBytes(state.storageUsed)} / {formatBytes(state.storageTotal)}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-icc-500 to-amber-500 transition-all duration-300"
                style={{ width: `${Math.min((state.storageUsed / state.storageTotal) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-icc-500/20 text-icc-400 border border-icc-500/30'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-icc-500/30 text-icc-300' : 'bg-white/10 text-white/40'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <Download className="w-16 h-16 mx-auto text-white/10 mb-4" />
            <h3 className="text-lg font-bold text-white/60 mb-2">No downloads yet</h3>
            <p className="text-sm text-white/40 mb-6">
              {activeTab === 'all'
                ? 'Download audio lectures, videos, and PDFs to access them offline.'
                : `No ${activeTab} downloads yet. Browse and download from the library.`}
            </p>
            <Link
              to={activeTab === 'all' ? '/audio' : getResourceUrl(activeTab.toUpperCase())}
              className="btn-icc px-6 py-3 text-sm font-bold inline-flex items-center gap-2"
            >
              <Music className="w-4 h-4" /> Browse Library
            </Link>
          </div>
        )}

        {/* Resource list */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((resource) => {
              const Icon = typeIcons[resource.type] || FileText;
              const colorClass = typeColors[resource.type] || typeColors.PDF;
              return (
                <motion.div
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-icc-500/20 hover:bg-white/[0.07] transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{resource.title}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-white/40 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(resource.downloadedAt)}
                      </span>
                      <span>{formatBytes(resource.fileSize)}</span>
                      {resource.duration ? <span>{formatDuration(resource.duration)}</span> : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {resource.type === 'AUDIO' && (
                      <button
                        onClick={() => handlePlay(resource)}
                        className={`p-2.5 rounded-xl border transition-all duration-200 ${
                          playingId === resource.id
                            ? 'bg-icc-500/20 border-icc-500/40 text-icc-400'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-icc-500/10 hover:border-icc-500/30 hover:text-icc-400'
                        }`}
                        title={playingId === resource.id ? 'Pause' : 'Play'}
                      >
                        {playingId === resource.id ? (
                          <div className="flex items-center gap-0.5">
                            <span className="w-0.5 h-3 bg-icc-400 rounded-full animate-pulse" />
                            <span className="w-0.5 h-4 bg-icc-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <span className="w-0.5 h-3 bg-icc-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                          </div>
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {(resource.type === 'VIDEO' || resource.type === 'PDF') && (
                      <button
                        onClick={() => handlePlay(resource)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-icc-500/10 hover:border-icc-500/30 hover:text-icc-400 transition-all duration-200"
                        title={resource.type === 'VIDEO' ? 'Watch' : 'Read'}
                      >
                        {resource.type === 'VIDEO' ? <Play className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Now playing bar */}
        {playingId && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-dark-900/95 backdrop-blur-xl border-t border-white/10"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span className="text-sm text-white/70 truncate">
                {state.resources.find((r) => r.id === playingId)?.title || 'Playing'}
              </span>
              <button
                onClick={() => { audioEl?.pause(); setPlayingId(null); }}
                className="text-xs text-icc-400 hover:text-icc-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
