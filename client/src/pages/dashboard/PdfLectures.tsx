import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, Search, ExternalLink, BookOpen } from 'lucide-react';
import { resources } from '../../lib/api';

export default function PdfLectures() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    resources.getAll({ resourceType: 'PDF', limit: 50 })
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
          <FileText className="w-6 h-6 text-purple-400" /> PDF Library
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" placeholder="Search PDFs..." value={search} onChange={e => setSearch(e.target.value)}
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
          <BookOpen className="w-16 h-16 text-purple-400/60 mx-auto mb-4" />
          <p className="text-lg text-white/70">No PDFs found</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item: any, i: number) => (
            <motion.div key={item.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass-premium p-4 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{item.title || item.name}</h3>
                  <p className="text-xs text-white/40 mt-0.5 truncate">{item.category || item.collection}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-white/40 flex items-center gap-1"><Download className="w-3 h-3" /> {item.downloads || 0}</span>
                    <span className="text-[10px] text-white/40">{item.sizeHuman || ''}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3 h-3" /> Read
                </a>
                <a href={item.url} download
                  className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
