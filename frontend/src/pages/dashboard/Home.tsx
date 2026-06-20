import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Headphones, Video, Bookmark, Download, Clock,
  Play, Pause, ArrowRight, Library,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { historyApi, bookmarks as bookmarksApi, downloadsApi } from '../../lib/api';
import { usePlayer } from '../../context/PlayerContext';
import type { ListeningHistoryItem, WatchHistoryItem, BookmarkItem, DownloadItem } from '../../types';

function formatTime(seconds?: number) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDuration(seconds?: number) {
  if (!seconds) return '--:--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function DashboardHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { play } = usePlayer();
  const [listeningHistory, setListeningHistory] = useState<ListeningHistoryItem[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [bookmarksList, setBookmarksList] = useState<BookmarkItem[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([
      historyApi.getListening().catch(() => ({ data: [] })),
      historyApi.getWatching().catch(() => ({ data: [] })),
      bookmarksApi.getAll().catch(() => ({ data: [] })),
      downloadsApi.getAll().catch(() => ({ data: [] })),
    ]).then(([listeningRes, watchRes, bookmarksRes, downloadsRes]) => {
      setListeningHistory(Array.isArray(listeningRes.data) ? listeningRes.data : []);
      setWatchHistory(Array.isArray(watchRes.data) ? watchRes.data : []);
      setBookmarksList(Array.isArray(bookmarksRes.data) ? bookmarksRes.data : []);
      setDownloads(Array.isArray(downloadsRes.data) ? downloadsRes.data : []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const continueListening = listeningHistory.filter(h => !h.completed && h.progress > 0).slice(0, 4);
  const continueWatching = watchHistory.filter(h => !h.completed && h.progress > 0).slice(0, 4);
  const savedLessons = bookmarksList.filter(b => b.type === 'LESSON').slice(0, 4);

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-white/60">{t('my_library.sign_in')}</p>
        <Link to="/login" className="btn-icc inline-block mt-4">{t('auth.sign_in')}</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-icc-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {t('my_library.welcome', { name: user.name || user.email })}
        </h1>
        <p className="text-white/40 mt-1">{t('my_library.subtitle')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Headphones, label: t('my_library.continue_listening'), value: continueListening.length, href: '/dashboard/continue-listening', color: 'text-icc-400' },
          { icon: Video, label: t('my_library.continue_watching'), value: continueWatching.length, href: '/dashboard/continue-watching', color: 'text-purple-400' },
          { icon: Bookmark, label: t('my_library.saved_lessons'), value: savedLessons.length, href: '/dashboard/saved-lessons', color: 'text-gold-400' },
          { icon: Download, label: t('my_library.downloaded_audio'), value: downloads.length, href: '/dashboard/downloaded-audio', color: 'text-green-400' },
        ].map((stat, i) => (
          <Link
            key={i}
            to={stat.href}
            className="glass-premium p-4 rounded-xl hover:border-icc-500/30 transition-all"
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/40 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Continue Listening */}
      {continueListening.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Headphones className="w-4 h-4 text-icc-400" />
              {t('my_library.continue_listening')}
            </h2>
            <Link to="/dashboard/continue-listening" className="text-xs text-icc-400 hover:text-icc-300 flex items-center gap-1">
              {t('my_library.view_all')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {continueListening.map((item) => (
              <div
                key={item.id}
                className="glass-premium p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:border-icc-500/30 transition-all"
                onClick={() => item.lesson && play(item.lesson)}
              >
                <div className="w-10 h-10 rounded-xl bg-icc-500/10 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5 text-icc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.lesson?.title}</p>
                  <p className="text-xs text-white/40 truncate">{item.lesson?.series?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-white/40">{Math.round(item.progress)}%</p>
                  <p className="text-[10px] text-icc-400">{formatTime(item.position)}</p>
                </div>
                <button className="p-2 rounded-lg bg-icc-500/10 text-icc-400 hover:bg-icc-500/20 transition-colors">
                  <Play className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-400" />
              {t('my_library.continue_watching')}
            </h2>
            <Link to="/dashboard/continue-watching" className="text-xs text-icc-400 hover:text-icc-300 flex items-center gap-1">
              {t('my_library.view_all')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {continueWatching.map((item) => (
              <div
                key={item.id}
                className="glass-premium p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:border-purple-500/30 transition-all"
                onClick={() => item.lesson && play(item.lesson)}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.lesson?.title}</p>
                  <p className="text-xs text-white/40 truncate">{item.lesson?.series?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-white/40">{Math.round(item.progress)}%</p>
                  <p className="text-[10px] text-purple-400">{formatTime(item.position)}</p>
                </div>
                <button className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors">
                  <Play className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Saved Lessons */}
      {savedLessons.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-gold-400" />
              {t('my_library.saved_lessons')}
            </h2>
            <Link to="/dashboard/saved-lessons" className="text-xs text-icc-400 hover:text-icc-300 flex items-center gap-1">
              {t('my_library.view_all')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {savedLessons.map((bookmark) => (
              <div
                key={bookmark.id}
                className="glass-premium p-4 rounded-xl cursor-pointer hover:border-gold-500/30 transition-all"
                onClick={() => bookmark.lesson && play(bookmark.lesson)}
              >
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center mb-3">
                  <Bookmark className="w-5 h-5 text-gold-400" />
                </div>
                <p className="text-sm font-medium text-white truncate">{bookmark.lesson?.title}</p>
                <p className="text-xs text-white/40 mt-1 truncate">{bookmark.lesson?.series?.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {continueListening.length === 0 && continueWatching.length === 0 && savedLessons.length === 0 && (
        <div className="text-center py-16">
          <Library className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">{t('my_library.empty_title')}</h3>
          <p className="text-sm text-white/40 mb-6">{t('my_library.empty_desc')}</p>
          <Link to="/series" className="btn-icc text-sm px-5 py-2.5">
            {t('my_library.browse_series')}
          </Link>
        </div>
      )}
    </div>
  );
}
