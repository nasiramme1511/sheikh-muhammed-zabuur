import { useState, useEffect } from 'react';
import {
  Search, RefreshCw, AlertCircle, CheckCircle, Trash2, Edit3,
  Video, Star, Eye, Download, X, Save, Filter, Calendar,
  BarChart3, MoveRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { admin, resources } from '../../lib/api';
import { useTranslation } from '../../i18n';
import { COLLECTIONS, getCollectionBySlug } from '../../config/collections';

interface Recording {
  id: number;
  title: string;
  name: string;
  description?: string;
  category: string;
  collection?: string;
  url: string;
  size: number;
  resourceType: string;
  fileType?: string;
  createdAt: string;
  views: number;
  downloads: number;
  featured: boolean;
  duration?: number;
  teacher?: { id: number; name: string } | null;
}

interface EditForm {
  title: string;
  description: string;
  category: string;
  featured: boolean;
}

const CATEGORIES = ['Tafsir', 'Hadith', 'Riyadus Salihin', 'Tajweed', 'Fiqh', 'Seerah', 'Aqeedah', 'Arabic Language', 'Manhaj', 'Adab', "Da'wah", 'Khutbah', 'Ramadan Series', 'Questions & Answers', 'General'];

function formatDuration(seconds?: number): string {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

export default function RecordingArchive() {
  const { t } = useTranslation();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_viewed'>('newest');
  const [editTarget, setEditTarget] = useState<Recording | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ title: '', description: '', category: 'General', featured: false });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Recording | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reclassifyId, setReclassifyId] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
      admin.resources.getAll(),
      resources.getStats(),
    ])
      .then(([res]) => {
        const all = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        const recs = all.filter((r: Recording) =>
          r.resourceType === 'VIDEO' && (r.fileType === 'recording' || !r.fileType)
        );
        setRecordings(recs);
      })
      .catch(() => setError('Failed to load recordings'))
      .finally(() => setLoading(false));
  };

  const processed = recordings
    .filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        r.title?.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.teacher?.name?.toLowerCase().includes(q);
      let matchDate = true;
      if (dateFrom) {
        matchDate = matchDate && new Date(r.createdAt) >= new Date(dateFrom);
      }
      if (dateTo) {
        const toEnd = new Date(dateTo);
        toEnd.setHours(23, 59, 59, 999);
        matchDate = matchDate && new Date(r.createdAt) <= toEnd;
      }
      const matchCollection = !collectionFilter || r.collection === collectionFilter;
      return matchSearch && matchDate && matchCollection;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'most_viewed') return (b.views || 0) - (a.views || 0);
      return 0;
    });

  const totalViews = recordings.reduce((acc, r) => acc + (r.views || 0), 0);
  const totalDownloads = recordings.reduce((acc, r) => acc + (r.downloads || 0), 0);

  const openEdit = (rec: Recording) => {
    setEditTarget(rec);
    setEditForm({
      title: rec.title || rec.name,
      description: rec.description || '',
      category: rec.category || 'General',
      featured: rec.featured,
    });
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await admin.resources.update(editTarget.id, {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        featured: editForm.featured,
      });
      setEditTarget(null);
      load();
    } catch {
      setError('Failed to update recording');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await admin.resources.delete(deleteTarget.url);
      setRecordings(prev => prev.filter(r => r.url !== deleteTarget.url));
      setDeleteTarget(null);
    } catch {
      setError('Failed to delete recording');
    } finally { setDeleting(false); }
  };

  const handleReclassify = async (id: number) => {
    setReclassifyId(id);
    try {
      await admin.resources.update(id, { fileType: 'video' });
      load();
    } catch {
      setError('Failed to reclassify recording');
    } finally { setReclassifyId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Video className="w-6 h-6 text-emerald-500" />
            Recording Archive
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage video recordings — edit metadata, feature, reclassify, or delete
          </p>
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-emerald-500 hover:border-emerald-500 transition-all" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{recordings.length}</p>
          <p className="text-xs text-gray-400 mt-1">Total Recordings</p>
        </div>
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{totalViews.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Total Views</p>
        </div>
        <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{totalDownloads.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Total Downloads</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, category, or teacher..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Collection filter */}
          <select
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          >
            <option value="">All Collections</option>
            {COLLECTIONS.map((c) => (
              <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
            ))}
          </select>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most_viewed">Most Viewed</option>
          </select>
          <Calendar className="w-4 h-4 text-gray-400" />
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
          <span className="text-gray-400">—</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
          {(search || dateFrom || dateTo || collectionFilter) && (
            <button onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setCollectionFilter(''); }} className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all" title="Clear filters">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : processed.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Video className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{recordings.length === 0 ? 'No recordings found' : 'No recordings match your filters'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Collection</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Duration</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Views</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Downloads</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Featured</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {processed.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400 shrink-0">
                          <Video className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate max-w-[220px]" title={rec.title || rec.name}>
                            {rec.title || rec.name}
                          </p>
                          {rec.teacher?.name && (
                            <p className="text-xs text-gray-400 truncate max-w-[220px]">{rec.teacher.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(rec.createdAt)}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        const col = rec.collection ? getCollectionBySlug(rec.collection) : undefined;
                        return col ? <span className="inline-flex items-center gap-1 text-xs">{col.icon} {col.name}</span> : <span className="text-gray-400 text-xs">—</span>;
                      })()}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 font-mono text-xs">{formatDuration(rec.duration)}</td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      <span className="flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" /> {rec.views ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      <span className="flex items-center justify-center gap-1">
                        <Download className="w-3 h-3" /> {rec.downloads ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {rec.featured ? (
                        <Star className="w-4 h-4 text-amber-400 inline-block" />
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(rec)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all" title="Edit metadata">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReclassify(rec.id)}
                          disabled={reclassifyId === rec.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all disabled:opacity-40"
                          title="Reclassify as video"
                        >
                          {reclassifyId === rec.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MoveRight className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setDeleteTarget(rec)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditTarget(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Edit Recording</h3>
                <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                  <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all">
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <button type="button" onClick={() => setEditForm({ ...editForm, featured: !editForm.featured })} className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${editForm.featured ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${editForm.featured ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                  </button>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured on Homepage</label>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setEditTarget(null)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
                <button onClick={handleEditSave} disabled={saving} className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-semibold transition-all flex items-center gap-2">
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/10">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Delete Recording</h3>
              </div>
              <p className="text-sm text-gray-500 mb-2">Permanently delete this recording?</p>
              <p className="text-sm font-semibold bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg text-gray-900 dark:text-white mb-6 break-all">{deleteTarget.title || deleteTarget.name}</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold transition-all flex items-center gap-2">
                  {deleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
