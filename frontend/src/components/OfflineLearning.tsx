import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Trash2, HardDrive, Music, Video, FileText,
  Wifi, WifiOff, RefreshCw, BarChart3, Database
} from 'lucide-react';
import { useOffline } from '../context/OfflineContext';
import { getStorageStats } from '../lib/offline/db';
import { useTranslation } from '../i18n';

interface StorageStats {
  audioCount: number;
  videoCount: number;
  pdfCount: number;
  totalSize: number;
  audioSize: number;
  videoSize: number;
  pdfSize: number;
}

export default function OfflineLearning() {
  const { t } = useTranslation();
  const { state, refresh, removeResource } = useOffline();
  const [storageStats, setStorageStats] = useState<StorageStats>({
    audioCount: 0, videoCount: 0, pdfCount: 0,
    totalSize: 0, audioSize: 0, videoSize: 0, pdfSize: 0,
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    getStorageStats().then(setStorageStats);
  }, [state.resources]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDelete = async (id: string) => {
    removeResource(id);
    const db = await import('../lib/offline/db');
    await db.deleteOfflineResource(id);
    getStorageStats().then(setStorageStats);
  };

  const handleDeleteAll = async () => {
    const db = await import('../lib/offline/db');
    await db.clearAllData();
    await refresh();
    getStorageStats().then(setStorageStats);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 p-4 rounded-xl ${
          isOnline
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
        }`}
      >
        {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
        <div>
          <p className="text-sm font-semibold">
            {isOnline ? t('offline.online') : t('offline.offline')}
          </p>
          <p className="text-xs opacity-70">
            {isOnline
              ? t('offline.downloads_available')
              : t('offline.offline_content')}
          </p>
        </div>
      </motion.div>

      {/* Storage Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-icc-400" />
            <span className="text-xs text-white/50">{t('offline.total_storage')}</span>
          </div>
          <p className="text-lg font-bold text-white">{formatBytes(storageStats.totalSize)}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-4 h-4 text-icc-400" />
            <span className="text-xs text-white/50">{t('offline.audio')}</span>
          </div>
          <p className="text-lg font-bold text-white">{storageStats.audioCount}</p>
          <p className="text-[10px] text-white/40">{formatBytes(storageStats.audioSize)}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-white/50">{t('offline.video')}</span>
          </div>
          <p className="text-lg font-bold text-white">{storageStats.videoCount}</p>
          <p className="text-[10px] text-white/40">{formatBytes(storageStats.videoSize)}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-white/50">{t('offline.pdf')}</span>
          </div>
          <p className="text-lg font-bold text-white">{storageStats.pdfCount}</p>
          <p className="text-[10px] text-white/40">{formatBytes(storageStats.pdfSize)}</p>
        </div>
      </div>

      {/* Downloaded Resources List */}
      <div className="space-y-3">
        {state.resources.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <Download className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/40">{t('offline.no_downloads')}</p>
            <p className="text-xs text-white/30 mt-1">
              {t('offline.download_prompt')}
            </p>
          </div>
        ) : (
          state.resources.map((resource) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  resource.type === 'AUDIO' ? 'bg-icc-500/10 text-icc-400' :
                  resource.type === 'VIDEO' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {resource.type === 'AUDIO' ? <Music className="w-5 h-5" /> :
                   resource.type === 'VIDEO' ? <Video className="w-5 h-5" /> :
                   <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{resource.title}</p>
                  <p className="text-xs text-white/40">
                    {resource.sizeHuman} &middot; {new Date(resource.downloadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(resource.id)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                aria-label={t('offline.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {state.resources.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {t('offline.delete_all')}
          </button>
        </div>
      )}
    </div>
  );
}
