import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Headphones, Video, FileText, Bookmark, Download, Flame, Timer, Target, Award } from 'lucide-react';
import { dashboard } from '../../lib/api';

export default function LearningProgress() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboard.get()
      .then(res => setStats(res.data?.stats || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="glass-premium p-6"><div className="h-8 bg-white/10 rounded w-48" /></div>
      </div>
    );
  }

  const s = stats || {};
  const total = (s.audioListened || 0) + (s.videosWatched || 0) + (s.pdfsDownloaded || 0);
  const audioPct = total ? Math.round(((s.audioListened || 0) / total) * 100) : 0;
  const videoPct = total ? Math.round(((s.videosWatched || 0) / total) * 100) : 0;
  const pdfPct = total ? Math.round(((s.pdfsDownloaded || 0) / total) * 100) : 0;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-icc-400" />
        <h1 className="text-2xl font-bold text-white">Learning Progress</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: 'Learning Streak', value: `${s.streak || 0} days`, color: 'from-orange-500 to-amber-600' },
          { icon: Timer, label: 'Study Hours', value: `${s.studyHours || 0} hours`, color: 'from-purple-500 to-violet-600' },
          { icon: Target, label: 'Total Lectures', value: total, color: 'from-icc-500 to-icc-600' },
          { icon: Award, label: 'Completion Rate', value: `${s.streak ? Math.min(100, s.streak * 5) : 0}%`, color: 'from-emerald-500 to-green-600' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-premium p-5"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-white/50 mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-premium p-6">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Content Breakdown</h2>
        <div className="space-y-5">
          {[
            { icon: Headphones, label: 'Audio Lectures', count: s.audioListened || 0, pct: audioPct, color: 'bg-icc-500' },
            { icon: Video, label: 'Video Lectures', count: s.videosWatched || 0, pct: videoPct, color: 'bg-blue-500' },
            { icon: FileText, label: 'PDF Studies', count: s.pdfsDownloaded || 0, pct: pdfPct, color: 'bg-purple-500' },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 ${i === 0 ? 'text-icc-400' : i === 1 ? 'text-blue-400' : 'text-purple-400'}`} />
                  <span className="text-sm text-white/80">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-white">{item.count} ({item.pct}%)</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className={`h-full rounded-full ${item.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Download, label: 'Downloads', value: s.totalDownloads || 0 },
          { icon: Bookmark, label: 'Bookmarks Saved', value: s.bookmarksSaved || 0 },
          { icon: Award, label: 'Achievements', value: 'Coming Soon' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-premium p-4 text-center"
          >
            <item.icon className={`w-6 h-6 mx-auto mb-2 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-rose-400' : 'text-icc-400'}`} />
            <p className="text-xl font-bold text-white">{item.value}</p>
            <p className="text-xs text-white/50">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
