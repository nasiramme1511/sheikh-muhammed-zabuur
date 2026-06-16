import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headphones, Video, FileText, Bookmark, Trash2, ExternalLink, Clock } from 'lucide-react';
import { dashboard } from '../../lib/api';
import { useTranslation } from '../../i18n';
import type { Bookmark as BookmarkType } from '../../types';

function BookmarkSkeleton() {
  return (
    <div className="glass-card-dark p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg shimmer-bg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 rounded shimmer-bg" />
          <div className="h-3 w-32 rounded shimmer-bg" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardBookmarks() {
  const { t } = useTranslation();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    dashboard.getBookmarks()
      .then(res => setBookmarks(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const removeBookmark = async (lessonId: number) => {
    try {
      await dashboard.removeBookmark(lessonId);
      load();
    } catch {}
  };

  const getLessonIcon = (lesson: any) => {
    if (lesson.audioUrl) return <Headphones className="w-5 h-5 text-emerald-400" />;
    if (lesson.videoUrl) return <Video className="w-5 h-5 text-blue-400" />;
    if (lesson.pdfUrl) return <FileText className="w-5 h-5 text-purple-400" />;
    return <Bookmark className="w-5 h-5 text-gold-400" />;
  };

  const getTypeLabel = (lesson: any) => {
    if (lesson.audioUrl) return t('dashboard.type_audio');
    if (lesson.videoUrl) return t('dashboard.type_video');
    if (lesson.pdfUrl) return t('dashboard.type_pdf');
    return t('dashboard.type_lesson');
  };

  const getTypeColor = (lesson: any) => {
    if (lesson.audioUrl) return 'text-emerald-400 bg-emerald-500/10';
    if (lesson.videoUrl) return 'text-blue-400 bg-blue-500/10';
    if (lesson.pdfUrl) return 'text-purple-400 bg-purple-500/10';
    return 'text-gold-400 bg-gold-500/10';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-emerald-400" />
          {t('dashboard.my_bookmarks')}
        </h1>
        <span className="text-sm text-white/40">{t('dashboard.saved_count', { count: bookmarks.length })}</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <BookmarkSkeleton key={i} />)}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="glass-card-dark p-12 text-center">
          <Bookmark className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-2">{t('dashboard.no_bookmarks_yet')}</p>
          <p className="text-white/30 text-sm mb-4">{t('dashboard.no_bookmarks_desc')}</p>
          <Link to="/categories" className="btn-icc inline-flex items-center gap-2">
            {t('bookmarks.browse_categories')} <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((bm) => (
            <motion.div
              key={bm.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-dark p-4 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  {getLessonIcon(bm.lesson)}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/lessons/${bm.lesson.slug}`} className="text-sm font-medium text-white hover:text-emerald-400 transition-colors line-clamp-2">
                    {bm.lesson.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(bm.lesson)}`}>
                      {getTypeLabel(bm.lesson)}
                    </span>
                    {bm.lesson.teacher && (
                      <span className="text-xs text-white/40">{bm.lesson.teacher.name}</span>
                    )}
                    <span className="text-xs text-white/30 flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3" />
                      {new Date(bm.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeBookmark(bm.lessonId)}
                  className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"
                  title={t('dashboard.remove_bookmark')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
