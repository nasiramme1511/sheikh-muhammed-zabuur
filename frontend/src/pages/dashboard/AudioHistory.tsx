import { useState, useEffect } from 'react';
import { Headphones, Play, Clock, ExternalLink, History } from 'lucide-react';
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

export default function AudioHistory() {
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
          return action.includes('audio') || action === 'listen' || meta.type === 'audio' || h.lesson?.audioUrl;
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
      listen: 'dashboard.action_listened',
      audio: 'dashboard.action_listened',
      download_audio: 'dashboard.action_listened',
    };
    const key = map[action] || 'dashboard.action_listened';
    return t(key);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <History className="w-6 h-6 text-icc-400" />
          {t('dashboard.audio_history')}
        </h1>
        <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          {items.length} {t('dashboard.completed').toLowerCase()}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white/5 rounded-3xl border border-white/5"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-icc-500/10 border border-icc-500/20 flex items-center justify-center">
            <Headphones className="w-8 h-8 text-icc-400/60" />
          </div>
          <p className="text-lg font-semibold text-white/70 mb-2">{t('dashboard.no_history')}</p>
          <Link to="/audio" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 text-white text-sm font-medium transition-all mt-4">
            {t('dashboard.browse_audio')} <ExternalLink className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, idx) => {
            const meta = getMeta(item);
            const title = meta.title || item.lesson?.title || item.action;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="glass-premium p-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5 text-icc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-icc-500/10 text-icc-400 border border-icc-500/20">
                        {getActionLabel(item.action)}
                      </span>
                    </div>
                  </div>
                  {item.lesson?.slug && (
                    <Link
                      to={`/lessons/${item.lesson.slug}`}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-icc-500/10 text-white/30 hover:text-icc-400 transition-all"
                    >
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
