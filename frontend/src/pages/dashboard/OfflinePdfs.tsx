import { useOffline } from '../../context/OfflineContext';
import { motion } from 'framer-motion';
import { FileText, Trash2, BookOpen, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OfflinePdfs() {
  const { state, removeResource, refresh } = useOffline();
  const items = state.resources.filter(r => r.type === 'PDF' && r.status === 'completed');

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <WifiOff className="w-6 h-6 text-purple-400" /> Offline PDFs
        </h1>
        <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">{items.length} files</span>
      </div>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white/5 rounded-3xl border border-white/5"
        >
          <FileText className="w-16 h-16 text-purple-400/60 mx-auto mb-4" />
          <p className="text-lg text-white/70 mb-2">No offline PDFs</p>
          <p className="text-sm text-white/40">Download PDFs to read offline.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass-premium p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                  <p className="text-xs text-white/40">{item.sizeHuman}</p>
                  {item.lastPlayedAt ? (
                    <p className="text-[10px] text-purple-400 mt-0.5">Opened {new Date(item.lastPlayedAt).toLocaleDateString()}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                <Link to={`/offline/pdf/${item.id}`}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <BookOpen className="w-3 h-3" /> Open
                </Link>
                <button onClick={() => { removeResource(item.id); refresh(); }}
                  className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
