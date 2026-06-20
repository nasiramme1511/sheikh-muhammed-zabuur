import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Play, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { downloadsApi } from '../../lib/api';
import { usePlayer } from '../../context/PlayerContext';
import type { DownloadItem } from '../../types';
import toast from 'react-hot-toast';

export default function DownloadedAudio() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { play } = usePlayer();
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    if (!user) { setLoading(false); return; }
    downloadsApi.getAll().then(res => {
      setItems(res.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [user]);

  const removeDownload = async (lessonId: number) => {
    try {
      await downloadsApi.remove(lessonId);
      setItems(prev => prev.filter(d => d.lessonId !== lessonId));
      toast.success(t('my_library.download_removed'));
    } catch { toast.error(t('my_library.download_failed')); }
  };

  if (loading) return <div className="animate-spin rounded-full h-12 w-12 border-4 border-icc-500 border-t-transparent mx-auto mt-20" />;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/60 mb-6">
        <ArrowLeft className="w-4 h-4" /> {t('my_library.back')}
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Download className="w-6 h-6 text-green-400" /> {t('my_library.downloaded_audio')}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Download className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <p className="text-white/60">{t('my_library.no_downloads')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="glass-premium p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.lesson?.title}</p>
                <p className="text-xs text-white/40">
                  {item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(1)} MB` : ''}
                </p>
              </div>
              <button
                onClick={() => item.lesson && play({ ...item.lesson, audioUrl: item.fileUrl } as any)}
                className="p-2 rounded-lg bg-icc-500/10 text-icc-400 hover:bg-icc-500/20 transition-colors"
              >
                <Play className="w-4 h-4" />
              </button>
              <button
                onClick={() => item.lessonId && removeDownload(item.lessonId)}
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
