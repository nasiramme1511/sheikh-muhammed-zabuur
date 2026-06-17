import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headphones, Video, FileText, Bookmark, Trash2, ExternalLink, Clock, BookmarkX, BookmarkCheck } from 'lucide-react';
import { dashboard } from '../../lib/api';
import { useTranslation } from '../../i18n';
import type { Bookmark as BookmarkType } from '../../types';

function BookmarkSkeleton() {
  return (
    <div className="glass-premium p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 shimmer-bg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 rounded bg-white/10" />
          <div className="h-3 w-32 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardBookmarks() {
  const { t } = useTranslation();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    dashboard.getBookmarks()
      .then(res => setBookmarks(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const removeBookmark = async (lessonId: number) => {
    setRemovingId(lessonId);
    try {
      await dashboard.removeBookmark(lessonId);
      setBookmarks(prev => prev.filter(b => b.lessonId !== lessonId));
    } catch {}
    setRemovingId(null);
  };

  const getLessonIcon = (lesson: any) => {
    if (lesson.audioUrl) return <Headphones className="w-5 h-5 text-emerald-400" />;
    if (lesson.videoUrl) return <Video className="w-5 h-5 text-blue-400" />;
    if (lesson.pdfUrl) return <FileText className="w-5 h-5 text-purple-400" />;
    return <Bookmark className="w-5 h-5 text-amber-400" />;
  };

  const getTypeLabel = (lesson: any) => {
    if (lesson.audioUrl) return t('dashboard.type_audio');
    if (lesson.videoUrl) return t('dashboard.type_video');
    if (lesson.pdfUrl) return t('dashboard.type_pdf');
    return t('dashboard.type_lesson');
  };

  const getTypeColor = (lesson: any) => {
    if (lesson.audioUrl) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (lesson.videoUrl) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (lesson.pdfUrl) return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookmarkCheck className="w-6 h-6 text-amber-400" />
          {t('bookmarks.title')}
        </h1>
        <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          {bookmarks.length} saved
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <BookmarkSkeleton key={i} />)}
        </div>
      ) : bookmarks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white/5 rounded-3xl border border-white/5"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <BookmarkX className="w-8 h-8 text-amber-400/60" />
          </div>
          <p className="text-lg font-semibold text-white/70 mb-2">{t('bookmarks.no_bookmarks')}</p>
          <p className="text-sm text-white/40 mb-6">Save lessons, audio, videos and PDFs for quick access later.</p>
          <Link to="/categories" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all">
            {t('bookmarks.browse_categories')}
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((b, idx) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`glass-premium p-4 group relative ${removingId === b.lessonId ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  {getLessonIcon(b.lesson)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">{b.lesson?.title || 'Untitled'}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${b.lesson ? getTypeColor(b.lesson) : 'text-white/40 bg-white/5'}`}>
                      {b.lesson ? getTypeLabel(b.lesson) : 'Lesson'}
                    </span>
                    {b.createdAt && (
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                {b.lesson?.slug && (
                  <Link
                    to={`/lessons/${b.lesson.slug}`}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3 h-3" /> Open
                  </Link>
                )}
                <button
                  onClick={() => b.lessonId && removeBookmark(b.lessonId)}
                  disabled={removingId === b.lessonId}
                  className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-30"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
