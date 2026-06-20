import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Play, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { bookmarks as bookmarksApi } from '../../lib/api';
import { usePlayer } from '../../context/PlayerContext';
import type { BookmarkItem } from '../../types';
import toast from 'react-hot-toast';

export default function SavedLessons() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { play } = usePlayer();
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    if (!user) { setLoading(false); return; }
    bookmarksApi.getAll().then(res => {
      setItems((res.data || []).filter((b: BookmarkItem) => b.type === 'LESSON'));
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [user]);

  const removeBookmark = async (lessonId: number) => {
    try {
      await bookmarksApi.remove(lessonId);
      setItems(prev => prev.filter(b => b.lessonId !== lessonId));
      toast.success(t('my_library.bookmark_removed'));
    } catch { toast.error(t('my_library.bookmark_failed')); }
  };

  if (loading) return <div className="animate-spin rounded-full h-12 w-12 border-4 border-icc-500 border-t-transparent mx-auto mt-20" />;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/60 mb-6">
        <ArrowLeft className="w-4 h-4" /> {t('my_library.back')}
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Bookmark className="w-6 h-6 text-gold-400" /> {t('my_library.saved_lessons')}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <p className="text-white/60">{t('my_library.no_saved_lessons')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="glass-premium p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
                <Bookmark className="w-5 h-5 text-gold-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.lesson?.title}</p>
                <p className="text-xs text-white/40">{item.lesson?.series?.name}</p>
              </div>
              <button
                onClick={() => item.lesson && play(item.lesson)}
                className="p-2 rounded-lg bg-icc-500/10 text-icc-400 hover:bg-icc-500/20 transition-colors"
              >
                <Play className="w-4 h-4" />
              </button>
              <button
                onClick={() => item.lessonId && removeBookmark(item.lessonId)}
                className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
