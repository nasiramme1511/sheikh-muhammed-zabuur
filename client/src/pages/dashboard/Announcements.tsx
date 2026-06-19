import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Megaphone, Calendar, ArrowRight } from 'lucide-react';
import { admin } from '../../lib/api';

export default function Announcements() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.notifications.getAll()
      .then(res => setItems(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-icc-400" /> Announcements
        </h1>
        <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          {items.length} announcements
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="glass-premium p-4 animate-pulse"><div className="h-5 bg-white/10 rounded w-48" /></div>)}
        </div>
      ) : items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white/5 rounded-3xl border border-white/5"
        >
          <Bell className="w-16 h-16 text-icc-400/60 mx-auto mb-4" />
          <p className="text-lg text-white/70">No announcements yet</p>
          <p className="text-sm text-white/40">Stay tuned for updates from your teachers.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any, i: number) => (
            <motion.div key={item.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-premium p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-icc-500/10 border border-icc-500/20 flex items-center justify-center shrink-0">
                  <Megaphone className="w-5 h-5 text-icc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  {item.body && <p className="text-sm text-white/60 mt-1.5">{item.body}</p>}
                  {item.content && <p className="text-sm text-white/60 mt-1.5">{item.content}</p>}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    {item.type && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-icc-500/10 text-icc-400 border border-icc-500/20">
                        {item.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
