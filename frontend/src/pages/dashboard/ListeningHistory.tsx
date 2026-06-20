import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Play, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { historyApi } from '../../lib/api';
import { usePlayer } from '../../context/PlayerContext';
import type { ListeningHistoryItem } from '../../types';
import toast from 'react-hot-toast';

function formatTime(seconds?: number) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ListeningHistoryPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { play } = usePlayer();
  const [items, setItems] = useState<ListeningHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    historyApi.getListening().then(res => {
      setItems(res.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const deleteEntry = async (lessonId: number) => {
    try {
      await historyApi.deleteListening(lessonId);
      setItems(prev => prev.filter(h => h.lessonId !== lessonId));
      toast.success(t('my_library.history_deleted'));
    } catch { toast.error(t('my_library.history_failed')); }
  };

  if (loading) return <div className="animate-spin rounded-full h-12 w-12 border-4 border-icc-500 border-t-transparent mx-auto mt-20" />;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/60 mb-6">
        <ArrowLeft className="w-4 h-4" /> {t('my_library.back')}
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Headphones className="w-6 h-6 text-icc-400" /> {t('my_library.listening_history')}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Headphones className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <p className="text-white/60">{t('my_library.no_history')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="glass-premium p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-icc-500/10 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 text-icc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.lesson?.title}</p>
                <p className="text-xs text-white/40">{item.lesson?.series?.name}</p>
              </div>
              <div className="text-right mr-4 hidden sm:block">
                <p className="text-xs text-white/40 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatDate(item.lastPlayedAt)}
                </p>
              </div>
              <div className="text-right mr-4">
                <p className="text-xs text-white/40">{Math.round(item.progress)}%</p>
                <p className="text-[10px] text-icc-400">{formatTime(item.position)}</p>
              </div>
              <button
                onClick={() => item.lesson && play(item.lesson)}
                className="p-2 rounded-lg bg-icc-500/10 text-icc-400 hover:bg-icc-500/20 transition-colors"
              >
                <Play className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteEntry(item.lessonId)}
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
