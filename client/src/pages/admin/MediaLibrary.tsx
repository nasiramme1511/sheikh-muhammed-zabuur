import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, Grid, List, Upload, Trash2, Eye, Download, Music, Video, FileText, Image, X, RefreshCw, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { admin, resources } from '../../lib/api';
import { useTranslation } from '../../i18n';

interface MediaItem {
  id: number;
  name: string;
  url: string;
  size: number;
  type: string;
  resourceType: string;
  category: string;
  title: string;
  createdAt: string;
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

export default function MediaLibrary() {
  const { t } = useTranslation();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [page, setPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const perPage = 24;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await admin.resources.getAll();
      setItems(res.data || []);
    } catch {
      setError('Failed to load media library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter((item) => {
    const matchesSearch = search === '' ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || item.resourceType === typeFilter;
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
      setSelectAll(false);
    } else {
      setSelected(new Set(paged.map((i) => i.id)));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} item(s)? This cannot be undone.`)) return;
    try {
      for (const id of selected) {
        const item = items.find((i) => i.id === id);
        if (item) await admin.resources.delete(item.url);
      }
      setSelected(new Set());
      setSelectAll(false);
      fetchItems();
    } catch { setError('Failed to delete some items'); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('resourceType', file.type.startsWith('audio') ? 'AUDIO' : file.type.startsWith('video') ? 'VIDEO' : file.type === 'application/pdf' ? 'PDF' : 'IMAGE');
      formData.append('category', 'General Lectures');
      try {
        await admin.upload(formData);
      } catch {}
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchItems();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'AUDIO': return <Music className="w-5 h-5" />;
      case 'VIDEO': return <Video className="w-5 h-5" />;
      case 'PDF': return <FileText className="w-5 h-5" />;
      case 'IMAGE': return <Image className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'AUDIO': return 'bg-blue-500/20 text-blue-400';
      case 'VIDEO': return 'bg-purple-500/20 text-purple-400';
      case 'PDF': return 'bg-red-500/20 text-red-400';
      case 'IMAGE': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Media Library</h1>
            <p className="text-gray-400 text-sm mt-1">Central media manager for all file types</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-800" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-800 rounded w-3/4" />
                <div className="h-2 bg-gray-800 rounded w-1/2" />
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Media Library</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Central media manager for all file types</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-all">
              <Trash2 className="w-4 h-4" />
              Delete ({selected.size})
            </button>
          )}
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-icc-500 hover:bg-icc-400 text-white text-sm font-semibold transition-all">
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <input ref={fileInputRef} type="file" multiple accept="audio/*,video/*,image/*,application/pdf" onChange={handleUpload} className="hidden" />
          <button onClick={fetchItems} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, filename, or category..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-icc-500/50 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'AUDIO', 'VIDEO', 'PDF', 'IMAGE'].map((type) => (
            <button
              key={type}
              onClick={() => { setTypeFilter(type); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                typeFilter === type
                  ? 'bg-icc-500/10 text-icc-400 border border-icc-500/20'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase() + 's'}
            </button>
          ))}
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-all ${viewMode === 'grid' ? 'bg-icc-500/10 text-icc-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2.5 transition-all ${viewMode === 'list' ? 'bg-icc-500/10 text-icc-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t('admin.no_media')}</p>
          <p className="text-gray-400 text-sm mt-1">Try a different search or upload new files</p>
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paged.map((item) => (
              <div
                key={item.id}
                className={`glass-card rounded-xl overflow-hidden group cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-icc-500/5 ${selected.has(item.id) ? 'ring-2 ring-icc-500' : ''}`}
                onClick={() => toggleSelect(item.id)}
              >
                {/* Preview */}
                <div className="aspect-video bg-gray-800 relative overflow-hidden">
                  {item.resourceType === 'IMAGE' ? (
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : item.resourceType === 'VIDEO' ? (
                    <div className="w-full h-full flex items-center justify-center bg-purple-900/20">
                      <Video className="w-10 h-10 text-purple-400" />
                    </div>
                  ) : item.resourceType === 'AUDIO' ? (
                    <div className="w-full h-full flex items-center justify-center bg-blue-900/20">
                      <Music className="w-10 h-10 text-blue-400" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-red-900/20">
                      <FileText className="w-10 h-10 text-red-400" />
                    </div>
                  )}
                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); window.open(item.url, '_blank'); }} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Type badge */}
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold ${getTypeColor(item.resourceType)}`}>
                    {item.resourceType}
                  </span>
                  {/* Selection checkbox */}
                  <div className={`absolute top-2 right-2 w-5 h-5 rounded border-2 transition-all ${
                    selected.has(item.id) ? 'bg-icc-500 border-icc-500' : 'border-white/40 group-hover:border-white/80'
                  }`}>
                    {selected.has(item.id) && (
                      <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </div>
                </div>
                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title || item.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.category} &middot; {formatBytes(item.size)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(item.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">
                    <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="rounded border-gray-600" />
                  </th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Size</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((item) => (
                  <tr key={item.id} className={`border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${selected.has(item.id) ? 'bg-icc-500/5' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="rounded border-gray-600" />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(item.resourceType)}`}>
                        {getTypeIcon(item.resourceType)}
                        {item.resourceType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium max-w-[200px] truncate">{item.title || item.name}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{item.category}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatBytes(item.size)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setPreviewItem(item)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-icc-400 transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (confirm('Delete this item?')) { admin.resources.delete(item.url).then(fetchItems).catch(() => {}); } }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-all">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === page ? 'bg-icc-500 text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {p}
              </button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 disabled:opacity-30 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPreviewItem(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] glass-card-dark rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewItem(null)} className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/50 text-white hover:bg-black/70 transition-all">
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{previewItem.title || previewItem.name}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getTypeColor(previewItem.resourceType)}`}>{previewItem.resourceType}</span>
                <span>{previewItem.category}</span>
                <span>{formatBytes(previewItem.size)}</span>
              </div>
              {previewItem.resourceType === 'IMAGE' && (
                <img src={previewItem.url} alt={previewItem.title} className="max-w-full max-h-[60vh] object-contain rounded-xl mx-auto" />
              )}
              {previewItem.resourceType === 'AUDIO' && (
                <audio controls className="w-full" src={previewItem.url} />
              )}
              {previewItem.resourceType === 'VIDEO' && (
                <video controls playsInline className="w-full max-h-[60vh] rounded-xl" src={previewItem.url} />
              )}
              {previewItem.resourceType === 'PDF' && (
                <iframe src={previewItem.url} className="w-full h-[60vh] rounded-xl" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
