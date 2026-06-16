import { useState, useEffect } from 'react';
import { Search, Music, Trash2, Edit3, Star, Eye, Download, RefreshCw, Mic } from 'lucide-react';
import { admin } from '../../lib/api';
import { useTranslation } from '../../i18n';
import { COLLECTIONS, getCollectionBySlug } from '../../config/collections';

interface Recording {
  id: number;
  title: string;
  name: string;
  url: string;
  size: number;
  type: string;
  resourceType: string;
  category: string;
  collection?: string;
  createdAt: string;
  views: number;
  downloads: number;
  featured: boolean;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return iso; }
}

export default function RecordingsPage() {
  const { t } = useTranslation();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchRecordings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await admin.resources.getAll();
      const all = (res.data || []) as Recording[];
      setRecordings(all.filter((r: Recording) => r.resourceType === 'VIDEO' && r.type === 'recording'));
    } catch {
      setError('Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecordings(); }, []);

  const filtered = recordings.filter((r) =>
    search === '' || r.title?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFeatured = async (item: Recording) => {
    try {
      await admin.resources.update(item.id, { featured: !item.featured });
      fetchRecordings();
    } catch {}
  };

  const handleDelete = async (item: Recording) => {
    if (!confirm(`Delete "${item.title || item.name}"? This cannot be undone.`)) return;
    try {
      await admin.resources.delete(item.url);
      fetchRecordings();
    } catch {}
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recordings</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage recorded lectures</p>
          </div>
        </div>
        <div className="glass-card rounded-xl divide-y divide-gray-100 dark:divide-gray-800 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recordings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage recorded lectures</p>
        </div>
        <button onClick={fetchRecordings} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-emerald-500 text-sm font-medium transition-all">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Mic className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{recordings.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Recordings</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {recordings.reduce((sum, r) => sum + (r.views || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Views</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {recordings.reduce((sum, r) => sum + (r.downloads || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Downloads</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{recordings.filter((r) => r.featured).length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Featured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search recordings by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No recordings found</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? 'Try a different search' : 'Recordings will appear here after live streams end'}
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Collection</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Views</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Downloads</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Featured</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                          <Mic className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-900 dark:text-white font-medium truncate max-w-[250px]">{item.title || item.name}</p>
                          <p className="text-xs text-gray-400">{formatBytes(item.size)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{item.category || '—'}</td>
                    <td className="px-4 py-3">
                      {item.collection ? (
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          (() => {
                            const col = getCollectionBySlug(item.collection!);
                            return col ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/50 border-white/10';
                          })()
                        }`}>
                          {getCollectionBySlug(item.collection)?.name || item.collection}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{(item.views || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{(item.downloads || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleFeatured(item)} className={`p-1.5 rounded-lg transition-all ${item.featured ? 'text-amber-400 hover:bg-amber-500/10' : 'text-gray-400 hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        <Star className={`w-4 h-4 ${item.featured ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => window.open(item.url, '_blank')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-emerald-400 transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
