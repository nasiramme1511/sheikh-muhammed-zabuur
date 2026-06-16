import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Image, Upload, RefreshCw, Search, Star, Trash2, Edit3, X, AlertCircle,
  Save, Grid, HardDrive, Plus,
} from 'lucide-react';
import { admin } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageResource {
  id: number;
  name: string;
  title: string;
  description?: string;
  category: string;
  language: string;
  url: string;
  size: number;
  resourceType: string;
  createdAt: string;
  featured: boolean;
  views: number;
  thumbnail?: string;
  caption?: string;
  altText?: string;
}

const CATEGORIES = ['Tafsir', 'Hadith', 'Riyadus Salihin', 'Tajweed', 'Usul al-Fiqh', 'Fiqh', 'Seerah', 'Aqeedah', 'Arabic Language', 'Manhaj', 'Adab', "Da'wah", 'Khutbah', 'Ramadan Series', 'Questions & Answers', 'General'];

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function totalSize(files: ImageResource[]): string {
  const total = files.reduce((acc, f) => acc + (f.size || 0), 0);
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
  if (total < 1024 * 1024 * 1024) return `${(total / (1024 * 1024)).toFixed(1)} MB`;
  return `${(total / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function Gallery() {
  const [resources, setResources] = useState<ImageResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<ImageResource | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewItem, setPreviewItem] = useState<ImageResource | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [editTarget, setEditTarget] = useState<ImageResource | null>(null);
  const [saving, setSaving] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState('General');
  const [uploadFeatured, setUploadFeatured] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [stats, setStats] = useState({ totalImages: 0, totalStorage: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      admin.resources.getAll(),
      admin.getStats(),
    ])
      .then(([res, statsRes]) => {
        const all = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        setResources(all.filter((r: ImageResource) => r.resourceType === 'IMAGE'));
        const s = statsRes.data as any;
        setStats({
          totalImages: s.totalImages || 0,
          totalStorage: s.storageByType?.image || s.totalStorage || 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = resources.filter((f) => {
    const matchCategory = filterCategory === 'all' || f.category === filterCategory;
    if (!search) return matchCategory;
    const q = search.toLowerCase();
    return (
      matchCategory && (
        f.title?.toLowerCase().includes(q) ||
        f.name?.toLowerCase().includes(q) ||
        f.category?.toLowerCase().includes(q) ||
        f.altText?.toLowerCase().includes(q)
      )
    );
  });

  const categories = ['all', ...new Set(resources.map((r) => r.category).filter(Boolean))];

  const handleUploadFiles = (files: FileList | File[]) => {
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) {
      setUploadError('Please select image files only');
      return;
    }
    setUploadFiles((prev) => [...prev, ...images]);
    setUploadError('');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleUploadFiles(e.target.files);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleUploadFiles(e.dataTransfer.files);
  }, []);

  const removeUploadFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFiles.length === 0) { setUploadError('Please select at least one image to upload'); return; }
    setUploading(true);
    setUploadError('');
    try {
      for (const file of uploadFiles) {
        const fd = new FormData();
        fd.append('file', file);
        const ext = file.name.split('.').pop() || '';
        const baseName = file.name.substring(0, file.name.length - ext.length - 1);
        const pretty = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        fd.append('title', pretty);
        fd.append('category', uploadCategory);
        fd.append('resourceType', 'IMAGE');
        fd.append('featured', uploadFeatured ? 'true' : 'false');
        await admin.upload(fd);
      }
      setShowUploadModal(false);
      setUploadFiles([]);
      setUploadCategory('General');
      setUploadFeatured(false);
      load();
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await admin.resources.update(editTarget.id, {
        title: editTarget.title,
        description: editTarget.description,
        category: editTarget.category,
        featured: editTarget.featured,
        altText: editTarget.altText,
        caption: editTarget.caption,
      });
      setEditTarget(null);
      load();
    } catch { /* silent */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await admin.resources.delete(deleteTarget.url);
      setResources((prev) => prev.filter((f) => f.url !== deleteTarget.url));
      setDeleteTarget(null);
    } catch { /* silent */ }
    setDeleting(false);
  };

  const toggleFeatured = async (item: ImageResource) => {
    try {
      await admin.resources.update(item.id, { featured: !item.featured });
      setResources((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, featured: !r.featured } : r))
      );
    } catch { /* silent */ }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Images & Gallery</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {resources.length} images · {totalSize(resources)} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Images
          </button>
          <button onClick={load} className="btn-secondary p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card-dark rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Image className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Images</p>
            <p className="text-2xl font-bold">{stats.totalImages || resources.length}</p>
          </div>
        </div>
        <div className="glass-card-dark rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <HardDrive className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Storage Used</p>
            <p className="text-2xl font-bold">{humanSize(stats.totalStorage)}</p>
          </div>
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
            placeholder="Search images by title, filename, alt text..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filterCategory === cat
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <Image className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No images found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id || item.url + i}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (i % 20) * 0.03 }}
              className="group relative rounded-xl overflow-hidden bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-500/30 transition-all"
            >
              <div
                className="aspect-square overflow-hidden cursor-pointer"
                onClick={() => setPreviewItem(item)}
              >
                <img
                  src={item.url}
                  alt={item.altText || item.title || item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-white text-xs font-medium truncate">{item.title || item.name}</p>
                {item.category && (
                  <p className="text-white/60 text-xs truncate">{item.category}</p>
                )}
              </div>

              {/* Top actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleFeatured(item)}
                  className={`p-1.5 rounded-lg backdrop-blur-sm transition-all ${
                    item.featured
                      ? 'bg-amber-500/80 text-white'
                      : 'bg-black/40 text-white/80 hover:bg-black/60'
                  }`}
                  title={item.featured ? 'Unfeature' : 'Feature'}
                >
                  <Star className="w-3.5 h-3.5" fill={item.featured ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setEditTarget(item); }}
                  className="p-1.5 rounded-lg bg-black/40 text-white/80 hover:bg-black/60 backdrop-blur-sm transition-all"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                  className="p-1.5 rounded-lg bg-black/40 text-white/80 hover:bg-red-500/80 backdrop-blur-sm transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Featured badge */}
              {item.featured && (
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/80 text-white backdrop-blur-sm">
                    Featured
                  </span>
                </div>
              )}

              {/* Size badge */}
              <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white/70 backdrop-blur-sm">
                  {humanSize(item.size)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-emerald-500/10">
                    <Upload className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-lg">Upload Images</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {uploadError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Drag & drop images here, or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP, GIF</p>
                </div>

                {/* Selected files */}
                {uploadFiles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {uploadFiles.length} file(s) selected
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {uploadFiles.map((file, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() => removeUploadFile(idx)}
                            className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category (for all)</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="input-field w-full"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 py-1">
                  <button
                    type="button"
                    onClick={() => setUploadFeatured(!uploadFeatured)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      uploadFeatured ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      uploadFeatured ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Feature on Homepage</label>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={uploading} className="btn-primary inline-flex items-center gap-2">
                    {uploading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    {uploading ? 'Uploading...' : `Upload ${uploadFiles.length > 0 ? `(${uploadFiles.length})` : ''}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-500/10">
                    <Edit3 className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="font-bold text-lg">Edit Image Details</h3>
                </div>
                <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {editTarget.url && (
                <div className="mb-4 rounded-xl overflow-hidden">
                  <img
                    src={editTarget.url}
                    alt=""
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={editTarget.title}
                    onChange={(e) => setEditTarget({ ...editTarget, title: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={editTarget.altText || ''}
                    onChange={(e) => setEditTarget({ ...editTarget, altText: e.target.value })}
                    placeholder="Descriptive text for accessibility"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Caption</label>
                  <textarea
                    value={editTarget.caption || editTarget.description || ''}
                    onChange={(e) => setEditTarget({ ...editTarget, caption: e.target.value, description: e.target.value })}
                    placeholder="Optional caption displayed with image"
                    className="input-field w-full h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={editTarget.category}
                    onChange={(e) => setEditTarget({ ...editTarget, category: e.target.value })}
                    className="input-field w-full"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 py-1">
                  <button
                    type="button"
                    onClick={() => setEditTarget({ ...editTarget, featured: !editTarget.featured })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      editTarget.featured ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      editTarget.featured ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured on Homepage</label>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button onClick={() => setEditTarget(null)} className="btn-secondary">Cancel</button>
                <button onClick={handleEdit} disabled={saving} className="btn-primary inline-flex items-center gap-2">
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal (fullsize lightbox) */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center"
            >
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-full bg-black/50 text-white/80 hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={previewItem.url}
                alt={previewItem.altText || previewItem.title || previewItem.name}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              {(previewItem.title || previewItem.caption) && (
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white text-sm font-medium">{previewItem.title}</p>
                  {previewItem.caption && (
                    <p className="text-white/60 text-xs mt-1">{previewItem.caption}</p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/10">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-bold text-lg">Delete Image?</h3>
              </div>
              <div className="mb-4 rounded-xl overflow-hidden">
                <img
                  src={deleteTarget.url}
                  alt=""
                  className="w-full h-32 object-cover"
                />
              </div>
              <p className="text-sm text-gray-500 mb-2">This will permanently delete:</p>
              <p className="text-sm font-mono bg-gray-100 dark:bg-dark-900 px-3 py-2 rounded-lg text-red-500 break-all mb-6">
                {deleteTarget.name}
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="btn-primary bg-red-500 hover:bg-red-600 border-red-500 inline-flex items-center gap-2">
                  {deleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
