import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Music, Video, Image, X, CheckCircle,
  AlertCircle, RefreshCw, Save, Trash2, Search, FolderOpen,
  Globe, Star, SkipForward, Copy, Download,
} from 'lucide-react';
import { HiUpload } from 'react-icons/hi';
import { bulkImport } from '../../lib/api';
import { COLLECTIONS, getCollectionBySlug } from '../../config/collections';
import toast from 'react-hot-toast';

interface ImportResult {
  id?: number;
  file: string;
  title?: string;
  url?: string;
  size?: number;
  type?: string;
  resourceType?: string;
  category?: string;
  language?: string;
  status: string;
  message?: string;
}

interface CategoryStat {
  name: string;
  slug: string;
  audio: number;
  video: number;
  pdfs: number;
  recordings: number;
  total: number;
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'om', label: 'Afaan Oromo' },
  { value: 'am', label: 'Amharic' },
];

const DUPLICATE_ACTIONS = [
  { value: 'skip', label: 'Skip', icon: SkipForward },
  { value: 'replace', label: 'Replace', icon: RefreshCw },
  { value: 'rename', label: 'Rename Copy', icon: Copy },
];

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getFileIcon(type?: string) {
  switch (type) {
    case 'audio': case 'AUDIO': return <Music className="w-5 h-5 text-icc-400" />;
    case 'video': case 'VIDEO': return <Video className="w-5 h-5 text-blue-400" />;
    case 'pdf': case 'PDF': return <FileText className="w-5 h-5 text-red-400" />;
    case 'image': case 'IMAGE': return <Image className="w-5 h-5 text-purple-400" />;
    default: return <FileText className="w-5 h-5 text-white/40" />;
  }
}

export default function AdminImport() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [results, setResults] = useState<ImportResult[]>([]);
  const [mode, setMode] = useState<'upload' | 'results' | 'scan'>('upload');
  const [language, setLanguage] = useState('en');
  const [featured, setFeatured] = useState(false);
  const [duplicateAction, setDuplicateAction] = useState('skip');
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editItem, setEditItem] = useState<ImportResult | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const loadCategoryStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await bulkImport.getCategories();
      setCategoryStats(res.data);
    } catch { }
    finally { setLoadingStats(false); }
  }, []);

  function deriveCollectionFromPath(filePath: string): string | null {
    const n = filePath.toLowerCase().replace(/[-_]/g, ' ');
    for (const col of COLLECTIONS) {
      for (const prefix of col.prefixes) {
        if (n.includes(prefix)) return col.slug;
      }
    }
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    e.target.value = '';
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateProgress = async () => {
    const steps = ['Uploading...', 'Processing...', 'Generating Metadata...', 'Creating Resources...'];
    for (let i = 0; i < steps.length; i++) {
      setProgressLabel(steps[i]);
      setProgress(Math.round(((i + 1) / steps.length) * 100));
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setResults([]);
    setMode('upload');

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('language', language);
    formData.append('featured', String(featured));
    formData.append('duplicateAction', duplicateAction);

    simulateProgress();

    try {
      const res = await bulkImport.upload(formData);
      setResults(res.data.results || []);
      setMode('results');
      toast.success(`Imported ${res.data.imported} files`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Import failed');
    } finally {
      setUploading(false);
      setProgressLabel('');
      setProgress(0);
    }
  };

  const handleScanFolder = async () => {
    setUploading(true);
    setResults([]);
    setMode('scan');

    try {
      const res = await bulkImport.scanFolder({ language, featured, duplicateAction });
      setResults(res.data.results || []);
      setMode('results');
      toast.success(`Scanned folder - ${res.data.imported} new files`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Scan failed');
    } finally {
      setUploading(false);
    }
  };

  const toggleSelect = (id?: number) => {
    if (!id) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const ids = results.filter(r => r.id).map(r => r.id!);
    if (selectedIds.size === ids.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(ids));
  };

  const filteredResults = results.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (r.title || r.file).toLowerCase().includes(q) || (r.category || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="w-6 h-6 text-icc-400" />
          Content Importer
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={loadCategoryStats} className="btn-outline text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh Stats
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categoryStats.slice(0, 8).map(cat => (
          <div key={cat.slug} className="glass-card-dark p-3 text-center">
            <p className="text-lg font-bold text-white">{cat.total}</p>
            <p className="text-[10px] text-white/40 truncate">{cat.name}</p>
          </div>
        ))}
      </div>

      {/* Import Controls */}
      <div className="glass-card-dark p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-icc-500/50">
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Duplicate Action</label>
            <select value={duplicateAction} onChange={e => setDuplicateAction(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-icc-500/50">
              {DUPLICATE_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Featured</label>
            <label className="flex items-center gap-2 h-full pt-1">
              <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-icc-500 focus:ring-icc-500" />
              <span className="text-sm text-white/50">Mark as featured</span>
            </label>
          </div>
        </div>

        {/* File Drop Zone */}
        <div
          className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-icc-500/30 transition-all cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(14,165,233,0.5)'; }}
          onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; if (e.dataTransfer.files) setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); }}
        >
          <HiUpload className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm mb-1">Drop files here or click to browse</p>
          <p className="text-white/30 text-xs">Supports MP3, WAV, M4A, MP4, WebM, MOV, PDF, JPG, PNG</p>
          <input ref={fileInputRef} type="file" multiple accept=".mp3,.wav,.m4a,.ogg,.mp4,.webm,.mov,.mkv,.pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileSelect} className="hidden" />
          <input ref={folderInputRef} type="file" {...({ webkitdirectory: '' } as any)} multiple onChange={handleFolderSelect} className="hidden" />
        </div>

        {/* Collections quick pick */}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-outline text-xs inline-flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Select Files
          </button>
          <button type="button" onClick={() => folderInputRef.current?.click()} className="btn-outline text-xs inline-flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5" /> Select Folder (Smart Import)
          </button>
        </div>

        {/* File List with Collection Badges */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file, i) => {
              const detectedSlug = deriveCollectionFromPath(file.webkitRelativePath || file.name);
              const col = detectedSlug ? getCollectionBySlug(detectedSlug) : null;
              return (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
                  {getFileIcon(file.type.startsWith('audio') ? 'audio' : file.type.startsWith('video') ? 'video' : file.type === 'application/pdf' ? 'pdf' : 'image')}
                  <span className="text-sm text-white/70 flex-1 truncate">{file.webkitRelativePath || file.name}</span>
                  {col && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-icc-500/10 text-icc-400 border border-icc-500/20">{col.icon} {col.name}</span>
                  )}
                  <span className="text-xs text-white/30">{humanSize(file.size)}</span>
                  <button onClick={() => removeFile(i)} className="p-1 hover:bg-red-500/10 rounded text-white/30 hover:text-red-400 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button onClick={handleUpload} disabled={files.length === 0 || uploading}
            className="btn-icc inline-flex items-center gap-2">
            {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload Files
          </button>
          <button onClick={handleScanFolder} disabled={uploading}
            className="btn-outline inline-flex items-center gap-2 text-sm">
            <FolderOpen className="w-4 h-4" /> Scan Upload Folder
          </button>
        </div>

        {/* Progress Bar */}
        {uploading && progress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-icc-400">{progressLabel}</span>
              <span className="text-white/50">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-icc-500 to-icc-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {mode === 'results' && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-dark p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-icc-400" />
                Imported Resources ({results.length})
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-icc-400">{results.filter(r => r.status === 'created').length} imported</span>
                <span className="text-white/30">|</span>
                <span className="text-yellow-400">{results.filter(r => r.status === 'skipped').length} skipped</span>
                <span className="text-white/30">|</span>
                <span className="text-orange-400">{results.filter(r => r.status === 'skipped' && r.message === 'Duplicate detected').length} duplicates</span>
                <span className="text-white/30">|</span>
                <span className="text-blue-400">{results.filter(r => r.status === 'replaced').length} replaced</span>
                <span className="text-white/30">|</span>
                <span className="text-red-400">{results.filter(r => r.status === 'error').length} failed</span>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-xs mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search imported files..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-icc-500/50" />
            </div>

            {/* Bulk Select */}
            <div className="flex items-center gap-2 mb-3">
              <label className="flex items-center gap-2 text-sm text-white/50">
                <input type="checkbox" checked={selectedIds.size === results.filter(r => r.id).length && results.length > 0}
                  onChange={toggleSelectAll} className="rounded border-white/10 bg-white/5 text-icc-500" />
                Select All
              </label>
              {selectedIds.size > 0 && (
                <span className="text-xs text-white/40">{selectedIds.size} selected</span>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-white/30 uppercase border-b border-white/5">
                    <th className="px-2 py-2 w-8"></th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Language</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((r, i) => (
                    <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-all">
                      <td className="px-2 py-2">
                        {r.id && (
                          <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)}
                            className="rounded border-white/10 bg-white/5 text-icc-500" />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {getFileIcon(r.type)}
                          <span className="text-white font-medium truncate max-w-[200px]">{r.title || r.file}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          r.resourceType === 'AUDIO' ? 'bg-icc-500/10 text-icc-400' :
                          r.resourceType === 'VIDEO' ? 'bg-blue-500/10 text-blue-400' :
                          r.resourceType === 'PDF' ? 'bg-red-500/10 text-red-400' :
                          'bg-purple-500/10 text-purple-400'
                        }`}>
                          {r.resourceType || r.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-white/50 text-xs">{r.category || '-'}</td>
                      <td className="px-3 py-2">
                        <span className="text-xs text-white/40">{r.language || 'en'}</span>
                      </td>
                      <td className="px-3 py-2">
                        {r.status === 'created' ? <CheckCircle className="w-4 h-4 text-icc-400" /> :
                         r.status === 'skipped' ? <SkipForward className="w-4 h-4 text-yellow-400" /> :
                         r.status === 'error' ? <AlertCircle className="w-4 h-4 text-red-400" /> :
                         <RefreshCw className="w-4 h-4 text-blue-400" />}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditItem(r); setEditTitle(r.title || ''); setEditCategory(r.category || ''); }}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-icc-400 transition-all" title="Edit">
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <a href={r.url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-blue-400 transition-all" title="View">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {results.length === 0 && (
              <p className="text-center py-8 text-white/30">No files imported yet.</p>
            )}

            {/* Inline Edit */}
            <AnimatePresence>
              {editItem && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <h3 className="text-sm font-medium text-white mb-3">Edit: {editItem.file}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/50 mb-1">Title</label>
                      <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 mb-1">Category</label>
                      <select value={editCategory} onChange={e => setEditCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
                        {['Tafsir','Hadith','Riyadus Salihin','Tajweed','Usul al-Fiqh','Fiqh','Seerah','Aqeedah','Arabic Language','Manhaj','Adab',"Da'wah",'Khutbah','Ramadan Series','Questions & Answers','General Lectures'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={async () => {
                      try {
                        const { default: api } = await import('../../lib/api');
                        if (editItem.id) {
                          await api.put(`/admin/resources/${editItem.id}`, { title: editTitle, category: editCategory });
                          setResults(prev => prev.map(r => r.id === editItem.id ? { ...r, title: editTitle, category: editCategory } : r));
                          toast.success('Updated');
                        }
                        setEditItem(null);
                      } catch { toast.error('Failed to update'); }
                    }} className="btn-icc text-xs py-1.5 px-3">Save</button>
                    <button onClick={() => setEditItem(null)} className="btn-outline text-xs py-1.5 px-3">Cancel</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
