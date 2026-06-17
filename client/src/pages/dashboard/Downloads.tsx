import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Headphones, Video, FileText, DownloadCloud } from 'lucide-react';
import { dashboard } from '../../lib/api';
import type { UsageLog } from '../../types';

function DownloadSkeleton() {
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

export default function DashboardDownloads() {
  const [downloads, setDownloads] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    dashboard.getDownloads()
      .then(res => setDownloads(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (action: string) => {
    if (action.includes('audio') || action === 'listen') return <Headphones className="w-5 h-5 text-emerald-400" />;
    if (action.includes('video') || action === 'watch') return <Video className="w-5 h-5 text-blue-400" />;
    if (action.includes('pdf') || action === 'read') return <FileText className="w-5 h-5 text-purple-400" />;
    return <Download className="w-5 h-5 text-amber-400" />;
  };

  const getLabel = (action: string) => {
    switch (action) {
      case 'download_pdf': return 'PDF Downloaded';
      case 'download_audio': return 'Audio Downloaded';
      case 'download_video': return 'Video Downloaded';
      case 'download': return 'File Downloaded';
      default: return action;
    }
  };

  const getMeta = (log: UsageLog) => {
    try { return JSON.parse(log.metadata || '{}'); } catch { return {}; }
  };

  const filtered = filter === 'all'
    ? downloads
    : downloads.filter(d => d.action.includes(filter));

  const tabs = [
    { key: 'all', label: 'All', icon: null },
    { key: 'pdf', label: 'PDFs', icon: FileText },
    { key: 'audio', label: 'Audio', icon: Headphones },
    { key: 'video', label: 'Video', icon: Video },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <DownloadCloud className="w-6 h-6 text-emerald-400" />
          My Downloads
        </h1>
        <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          {downloads.length} total
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5 border border-transparent'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <DownloadSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white/5 rounded-3xl border border-white/5"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <DownloadCloud className="w-8 h-8 text-amber-400/60" />
          </div>
          <p className="text-lg font-semibold text-white/70 mb-2">No downloads found</p>
          <p className="text-sm text-white/40">Download lessons, audio, and PDFs to access them offline.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((log, idx) => {
            const meta = getMeta(log);
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="glass-premium p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {getIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{meta.title || getLabel(log.action)}</p>
                    <p className="text-xs text-white/40">{getLabel(log.action)}</p>
                  </div>
                  <span className="text-xs text-white/30 shrink-0">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
