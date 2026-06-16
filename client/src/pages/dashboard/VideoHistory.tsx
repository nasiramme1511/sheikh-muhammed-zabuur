import { useState, useEffect } from 'react';
import { Video, Play, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dashboard } from '../../lib/api';
import { useTranslation } from '../../i18n';
import type { TranslationKey } from '../../i18n';

interface HistoryItem {
  id: number;
  lessonId?: number;
  action: string;
  metadata?: string;
  createdAt: string;
  lesson?: any;
}

function Skeleton() {
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

export default function VideoHistory() {
  const { t } = useTranslation();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboard.getActivity()
      .then(res => {
        const all: HistoryItem[] = res.data || [];
        setItems(all.filter((h: any) => {
          const action = h.action?.toLowerCase() || '';
          const meta = (() => { try { return JSON.parse(h.metadata || '{}'); } catch { return {}; } })();
          return action.includes('video') || action === 'watch' || meta.type === 'video' || h.lesson?.videoUrl;
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getMeta = (item: HistoryItem) => {
    try { return JSON.parse(item.metadata || '{}'); } catch { return {}; }
  };

  const getActionLabel = (action: string) => {
    const map: Record<string, TranslationKey> = {
      watch: 'dashboard.action_watched',
      video: 'dashboard.action_watched',
      download_video: 'dashboard.action_watched',
    };
    const key = map[action] || 'dashboard.action_watched';
    return t(key);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Video className="w-6 h-6 text-blue-400" />
          {t('dashboard.video_history')}
        </h1>
        <span className="text-sm text-white/40">{items.length} {t('dashboard.completed').toLowerCase()}</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card-dark p-12 text-center">
          <Video className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-2">{t('dashboard.no_history')}</p>
          <Link to="/videos" className="btn-icc inline-flex items-center gap-2">
            {t('dashboard.browse_videos')} <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const meta = getMeta(item);
            const title = meta.title || item.lesson?.title || item.action;
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-dark p-4 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                        {getActionLabel(item.action)}
                      </span>
                    </div>
                  </div>
                  {item.lesson?.slug && (
                    <Link to={`/lessons/${item.lesson.slug}`} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-blue-500/10 text-white/30 hover:text-blue-400 transition-all">
                      <Play className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
