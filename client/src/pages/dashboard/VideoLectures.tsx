import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Play, Clock, Download, Search, Eye } from 'lucide-react';
import { resources } from '../../lib/api';

export default function VideoLectures() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    resources.getAll({ resourceType: 'VIDEO', limit: 50 })
      .then(res => setItems(res.data?.items || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((i: any) =>
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Video className="w-6 h-6 text-blue-400" /> Video Lectures
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" placeholder="Search videos..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-56 ps-9 pe-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-icc-500/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="glass-premium p-4 animate-pulse"><div className="h-5 bg-white/10 rounded w-40" /></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white/5 rounded-3xl border border-white/5"
        >
          <Video className="w-16 h-16 text-blue-400/60 mx-auto mb-4" />
          <p className="text-lg text-white/70">No video lectures found</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item: any, i: number) => (
            <motion.div key={item.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass-premium p-4 group"
            >
              {item.thumbnail && (
                <div className="relative rounded-xl overflow-hidden mb-3 aspect-video bg-black/50">
                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-icc-500 flex items-center justify-center"><Play className="w-6 h-6 text-white ml-0.5" /></div>
                  </div>
                </div>
              )}
              <h3 className="text-sm font-semibold text-white truncate">{item.title || item.name}</h3>
              <p className="text-xs text-white/40 mt-0.5">{item.category}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-white/40 flex items-center gap-1"><Eye className="w-3 h-3" /> {item.views || 0}</span>
                <span className="text-[10px] text-white/40">{item.duration || '—'}</span>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                <Link to={`/lessons/${item.slug || item.id}`}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play className="w-3 h-3" /> Watch
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
