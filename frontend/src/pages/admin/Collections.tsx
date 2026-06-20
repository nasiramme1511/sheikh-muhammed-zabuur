import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RefreshCw, AlertCircle, BookOpen, MoveRight } from 'lucide-react';
import { admin, resources } from '../../lib/api';
import { COLLECTIONS, COLLECTION_COLORS, getCollectionBySlug } from '../../config/collections';
import AdminModal from '../../components/admin/AdminModal';

interface CollectionStats {
  slug: string;
  count: number;
  audio: number;
  video: number;
  pdf: number;
  recording: number;
  image: number;
  totalViews: number;
  totalDownloads: number;
}

export default function AdminCollections() {
  const [stats, setStats] = useState<CollectionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteSlug, setDeleteSlug] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [moveFrom, setMoveFrom] = useState('');
  const [moveTo, setMoveTo] = useState('');
  const [moving, setMoving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await resources.getAll();
      const all = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
      const colStats: Record<string, CollectionStats> = {};
      for (const col of COLLECTIONS) {
        colStats[col.slug] = { slug: col.slug, count: 0, audio: 0, video: 0, pdf: 0, recording: 0, image: 0, totalViews: 0, totalDownloads: 0 };
      }
      for (const r of all) {
        const slug = r.collection;
        if (!slug || !colStats[slug]) continue;
        colStats[slug].count++;
        if (r.resourceType === 'AUDIO') colStats[slug].audio++;
        else if (r.resourceType === 'VIDEO' && r.fileType === 'recording') colStats[slug].recording++;
        else if (r.resourceType === 'VIDEO') colStats[slug].video++;
        else if (r.resourceType === 'PDF') colStats[slug].pdf++;
        else if (r.resourceType === 'IMAGE') colStats[slug].image++;
        colStats[slug].totalViews += r.views || 0;
        colStats[slug].totalDownloads += r.downloads || 0;
      }
      setStats(Object.values(colStats));
    } catch { setMessage('Failed to load collections'); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteSlug) return;
    setDeleting(true);
    try {
      await admin.collections.delete(deleteSlug);
      setMessage(`Deleted collection "${getCollectionBySlug(deleteSlug)?.name || deleteSlug}"`);
      setDeleteSlug('');
      load();
    } catch { setMessage('Failed to delete collection'); }
    setDeleting(false);
  };

  const handleMove = async () => {
    if (!moveFrom || !moveTo) return;
    setMoving(true);
    try {
      const res = await admin.resources.getAll();
      const all = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
      const ids = all.filter((r: any) => r.collection === moveFrom).map((r: any) => r.id);
      if (ids.length === 0) { setMessage('No resources in source collection'); setMoving(false); return; }
      await admin.resources.moveCollection(ids, moveTo);
      setMessage(`Moved ${ids.length} resources from "${getCollectionBySlug(moveFrom)?.name || moveFrom}" to "${getCollectionBySlug(moveTo)?.name || moveTo}"`);
      load();
    } catch { setMessage('Failed to move resources'); }
    setMoving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collections</h1>
          <p className="text-sm text-gray-500 mt-1">Manage content collections</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-xl bg-icc-500/10 border border-icc-500/20 text-icc-600 dark:text-icc-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {message}
          <button onClick={() => setMessage('')} className="ml-auto text-gray-400 hover:text-gray-600">&times;</button>
        </div>
      )}

      {/* Move Resources */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <MoveRight className="w-4 h-4" /> Move All Resources Between Collections
        </h3>
        <div className="flex items-center gap-3">
          <select value={moveFrom} onChange={(e) => setMoveFrom(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm">
            <option value="">From collection...</option>
            {stats.filter(s => s.count > 0).map(s => {
              const col = getCollectionBySlug(s.slug);
              return <option key={s.slug} value={s.slug}>{col?.icon} {col?.name} ({s.count})</option>;
            })}
          </select>
          <span className="text-gray-400">→</span>
          <select value={moveTo} onChange={(e) => setMoveTo(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm">
            <option value="">To collection...</option>
            {COLLECTIONS.filter(c => c.slug !== moveFrom).map(c => (
              <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
            ))}
            <option value="">Unassigned</option>
          </select>
          <button
            onClick={handleMove}
            disabled={!moveFrom || !moveTo || moving}
            className="px-4 py-2 rounded-xl bg-icc-500 hover:bg-icc-400 disabled:opacity-50 text-white text-sm font-medium transition-all"
          >
            {moving ? 'Moving...' : 'Move'}
          </button>
        </div>
      </div>

      {/* Collection Grid */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s) => {
            const col = getCollectionBySlug(s.slug);
            const colorClasses = COLLECTION_COLORS[s.slug] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            return (
              <div key={s.slug} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{col?.icon || '📖'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{col?.name || s.slug}</h3>
                      <p className="text-xs text-gray-400">{s.slug}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${colorClasses}`}>
                    {s.count} items
                  </span>
                </div>

                {s.count > 0 && (
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {s.audio > 0 && <div className="text-center p-1.5 rounded-lg bg-blue-500/5"><p className="text-xs font-medium text-blue-400">{s.audio}</p><p className="text-[10px] text-gray-400">Audio</p></div>}
                    {s.video > 0 && <div className="text-center p-1.5 rounded-lg bg-purple-500/5"><p className="text-xs font-medium text-purple-400">{s.video}</p><p className="text-[10px] text-gray-400">Video</p></div>}
                    {s.pdf > 0 && <div className="text-center p-1.5 rounded-lg bg-red-500/5"><p className="text-xs font-medium text-red-400">{s.pdf}</p><p className="text-[10px] text-gray-400">PDF</p></div>}
                    {s.recording > 0 && <div className="text-center p-1.5 rounded-lg bg-amber-500/5"><p className="text-xs font-medium text-amber-400">{s.recording}</p><p className="text-[10px] text-gray-400">Rec</p></div>}
                    {s.image > 0 && <div className="text-center p-1.5 rounded-lg bg-icc-500/5"><p className="text-xs font-medium text-icc-400">{s.image}</p><p className="text-[10px] text-gray-400">Img</p></div>}
                  </div>
                )}

                {s.count > 0 && (
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span>{s.totalViews.toLocaleString()} views</span>
                    <span>{s.totalDownloads.toLocaleString()} downloads</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <a
                    href={`/collections/${s.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> View
                  </a>
                  <button
                    onClick={() => setDeleteSlug(s.slug)}
                    disabled={s.count === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 disabled:opacity-30 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete All
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AdminModal open={!!deleteSlug} onClose={() => setDeleteSlug('')} title="Delete Collection">
        <p className="text-sm text-gray-500 mb-4">This will permanently delete all files and records in this collection.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteSlug('')} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-medium disabled:opacity-50">
            {deleting ? 'Deleting...' : 'Delete All'}
          </button>
        </div>
      </AdminModal>
    </motion.div>
  );
}
