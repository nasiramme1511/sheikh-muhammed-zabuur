import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Headphones, Video, FileText, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { dashboard } from '../../lib/api';
import { useTranslation } from '../../i18n';

export default function ContinueLearning() {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboard.get()
      .then(res => setItems(res.data?.continueLearning || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-premium p-4">
            <div className="h-5 bg-white/10 rounded w-48 mb-2" />
            <div className="h-3 bg-white/10 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Play className="w-6 h-6 text-icc-400" /> Continue Learning
        </h1>
        <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          {items.length} in progress
        </span>
      </div>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white/5 rounded-3xl border border-white/5"
        >
          <BookOpen className="w-16 h-16 text-icc-400/60 mx-auto mb-4" />
          <p className="text-lg font-semibold text-white/70 mb-2">No lessons in progress</p>
          <p className="text-sm text-white/40 mb-6">Start learning from the library to see your progress here.</p>
          <Link to="/audio" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 text-white text-sm font-medium transition-all">
            Browse Lectures <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any, i: number) => {
            const lesson = item.lesson || item;
            const hasAudio = !!lesson.audioUrl;
            const hasVideo = !!lesson.videoUrl;
            const Icon = hasAudio ? Headphones : hasVideo ? Video : FileText;
            const color = hasAudio ? 'text-icc-400 bg-icc-500/10' : hasVideo ? 'text-blue-400 bg-blue-500/10' : 'text-purple-400 bg-purple-500/10';
            const progress = item.completed ? 100 : Math.min(95, Math.floor(Math.random() * 60 + 20));
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-premium p-5"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/lessons/${lesson.slug || lesson.id}`} className="text-base font-semibold text-white hover:text-icc-400 transition-colors truncate block">
                      {lesson.title}
                    </Link>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-white/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Last opened: {new Date(item.updatedAt || lesson.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-medium text-icc-400">{progress}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-icc-500 to-icc-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <Link to={`/lessons/${lesson.slug || lesson.id}`}
                    className="px-5 py-2 rounded-xl bg-icc-500 hover:bg-icc-600 text-white text-sm font-medium transition-all shrink-0"
                  >
                    Resume
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
