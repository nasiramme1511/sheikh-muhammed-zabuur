import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, ExternalLink, Users, CheckCircle, XCircle } from 'lucide-react';
import { FaTelegramPlane } from 'react-icons/fa';
import { telegram, telegramAccess } from '../../lib/api';

export default function DashboardTelegramChannels() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      telegram.getAll().catch(() => ({ data: [] })),
      telegramAccess.getAll().catch(() => ({ data: [] })),
    ]).then(([allRes, accessRes]) => {
      const all = allRes.data || [];
      const access = accessRes.data || [];
      const merged = all.map((ch: any) => ({
        ...ch,
        accessible: access.some((a: any) => a.id === ch.id || a.name === ch.name),
      }));
      setChannels(merged);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Send className="w-6 h-6 text-[#0088cc]" /> Telegram Channels
        </h1>
        <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          {channels.length} channels
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="glass-premium p-4 animate-pulse"><div className="h-5 bg-white/10 rounded w-40" /></div>)}
        </div>
      ) : channels.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white/5 rounded-3xl border border-white/5"
        >
          <FaTelegramPlane className="w-16 h-16 text-[#0088cc]/60 mx-auto mb-4" />
          <p className="text-lg text-white/70 mb-2">No Telegram channels available</p>
          <p className="text-sm text-white/40">Subscribe to access learning communities.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((ch: any, i: number) => (
            <motion.div key={ch.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass-premium p-5"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 flex items-center justify-center shrink-0">
                  <FaTelegramPlane className="w-5 h-5 text-[#0088cc]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{ch.name}</h3>
                  {ch.teacherName && (
                    <p className="text-xs text-white/50 truncate">by {ch.teacherName}</p>
                  )}
                </div>
              </div>
              {ch.description && (
                <p className="text-xs text-white/50 mb-3 line-clamp-2">{ch.description}</p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  {ch.accessible ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-white/20" />
                  )}
                  <span className="text-[10px] text-white/40">
                    {ch.accessible ? 'Subscribed' : 'Subscribe to access'}
                  </span>
                </div>
                <a href={ch.link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0088cc]/10 border border-[#0088cc]/20 text-[#0088cc] text-xs font-medium hover:bg-[#0088cc]/20 transition-all"
                >
                  Join <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
