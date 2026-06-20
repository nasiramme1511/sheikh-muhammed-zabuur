import { useState, useEffect } from 'react';
import {
  FileText, Upload, RefreshCw, Search, Star, Edit3, Trash2, Eye, Download,
  X, AlertCircle, Save, BookOpen, HardDrive, ChevronDown, ChevronUp, Square, CheckSquare,
} from 'lucide-react';
import { admin } from '../../lib/api';
import { COLLECTIONS } from '../../config/collections';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';
import { useTranslation } from '../../i18n';

interface PdfResource {
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
  deletedAt?: string;
  featured: boolean;
  views: number;
  downloads: number;
  pages?: number;
  teacher?: { id: number; name: string; slug?: string } | null;
  book?: { id: number; title: string; slug?: string } | null;
}

const CATEGORIES = ['Tafsir', 'Hadith', 'Riyadus Salihin', 'Tajweed', 'Usul al-Fiqh', 'Fiqh', 'Seerah', 'Aqeedah', 'Arabic Language', 'Manhaj', 'Adab', "Da'wah", 'Khutbah', 'Ramadan Series', 'Questions & Answers', 'General'];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic (العربية)' },
  { value: 'am', label: 'Amharic (አማርኛ)' },
  { value: 'om', label: 'Oromoo (Afaan Oromoo)' },
];

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function totalSize(files: PdfResource[]): string {
  const total = files.reduce((acc, f) => acc + (f.size || 0), 0);
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
  if (total < 1024 * 1024 * 1024) return `${(total / (1024 * 1024)).toFixed(1)} MB`;
  return `${(total / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function PdfManagement() {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const [resources, setResources] = useState<PdfResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<PdfResource | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<PdfResource | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [editTarget, setEditTarget] = useState<PdfResource | null>(null);
  const [saving, setSaving] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState('General');
  const [uploadLanguage, setUploadLanguage] = useState('en');
  const [uploadFeatured, setUploadFeatured] = useState(false);
  const [uploadCollection, setUploadCollection] = useState('');

  const [stats, setStats] = useState({ totalPdf: 0, totalDownloads: 0, totalStorage: 0 });

  // Trash & bulk state
  const [tab, setTab] = useState<'active' | 'trash'>('active');
  const [trashItems, setTrashItems] = useState<PdfResource[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [permanentDeleting, setPermanentDeleting] = useState(false);
  const [deletePermanentTarget, setDeletePermanentTarget] = useState<PdfResource | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      admin.resources.getAll(),
      admin.getStats(),
    ])
      .then(([res, statsRes]) => {
        const all = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        setResources(all.filter((r: PdfResource) => r.resourceType === 'PDF'));
        const s = statsRes.data as any;
        setStats({
          totalPdf: s.totalPdf || 0,
          totalDownloads: s.totalDownloads || 0,
          totalStorage: s.storageByType?.pdf || s.totalStorage || 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadTrash = () => {
    setLoading(true);
    admin.resources.getTrash()
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        setTrashItems(all.filter((r: PdfResource) => r.resourceType === 'PDF'));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 'active') load();
    else loadTrash();
  }, [tab]);

  const displayItems = tab === 'active' ? resources : trashItems;

  const filtered = displayItems.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      f.title?.toLowerCase().includes(q) ||
      f.name?.toLowerCase().includes(q) ||
      f.category?.toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((f) => f.id)));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    const ext = file.name.split('.').pop() || '';
    const baseName = file.name.substring(0, file.name.length - ext.length - 1);
    const pretty = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    setUploadTitle(pretty);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) { setUploadError('Please select a PDF file to upload'); return; }
    if (!uploadTitle.trim()) { setUploadError('Title is required'); return; }
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('title', uploadTitle.trim());
      fd.append('description', uploadDescription.trim());
      fd.append('category', uploadCategory);
      fd.append('resourceType', 'PDF');
      fd.append('language', uploadLanguage);
      fd.append('featured', uploadFeatured ? 'true' : 'false');
      fd.append('collection', uploadCollection || '');
      await admin.upload(fd);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setUploadCategory('General');
      setUploadLanguage('en');
      setUploadFeatured(false);
      setUploadCollection('');
      load();
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Failed to upload PDF');
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
        language: editTarget.language,
        featured: editTarget.featured,
      });
      setEditTarget(null);
      load();
    } catch { /* silent */ }
    setSaving(false);
  };

  const handleDelete = async (permanent: boolean) => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await admin.resources.delete(deleteTarget.url, permanent);
      if (permanent) {
        setResources((prev) => prev.filter((f) => f.url !== deleteTarget.url));
        setTrashItems((prev) => prev.filter((f) => f.url !== deleteTarget.url));
      } else {
        setResources((prev) => prev.filter((f) => f.url !== deleteTarget.url));
      }
      setDeleteTarget(null);
    } catch { /* silent */ }
    setDeleting(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      await admin.resources.bulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setShowBulkDeleteConfirm(false);
      load();
    } catch { /* silent */ }
    setBulkDeleting(false);
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      await admin.resources.deleteAll('PDF');
      setShowDeleteAllConfirm(false);
      load();
    } catch { /* silent */ }
    setDeletingAll(false);
  };

  const handleRestore = async (ids: number[]) => {
    setRestoring(true);
    try {
      await admin.resources.restore(ids);
      loadTrash();
    } catch { /* silent */ }
    setRestoring(false);
  };

  const handlePermanentDelete = async (ids: number[]) => {
    setPermanentDeleting(true);
    try {
      await admin.resources.deletePermanent(ids);
      setTrashItems((prev) => prev.filter((f) => !ids.includes(f.id)));
      setDeletePermanentTarget(null);
    } catch { /* silent */ }
    setPermanentDeleting(false);
  };

  const toggleFeatured = async (item: PdfResource) => {
    try {
      await admin.resources.update(item.id, { featured: !item.featured });
      setResources((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, featured: !r.featured } : r))
      );
    } catch { /* silent */ }
  };

  const handlePreview = (item: PdfResource) => {
    setPreviewItem(item);
    setPreviewUrl(item.url);
  };

  const totalDownloads = resources.reduce((acc, r) => acc + (r.downloads || 0), 0);

  const DeleteConfirmModal = () => (
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
              <h3 className="font-bold text-lg">{t('admin.delete_pdf')}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-2">{t('admin.delete_warning')}</p>
            <p className="text-sm font-mono bg-gray-100 dark:bg-dark-900 px-3 py-2 rounded-lg text-red-500 break-all mb-6">
              {deleteTarget.title || deleteTarget.name}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary">{t('admin.cancel')}</button>
              <button onClick={() => handleDelete(false)} disabled={deleting} className="btn-icc inline-flex items-center gap-2">
                {deleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                <Trash2 className="w-4 h-4" />
                Move to Trash
              </button>
              <button onClick={() => handleDelete(true)} disabled={deleting} className="btn-danger inline-flex items-center gap-2">
                {deleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.pdf_management_title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {resources.length} PDFs · {totalSize(resources)} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tab === 'active' && (
            <button onClick={() => setShowUploadModal(true)} className="btn-primary inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload PDF
            </button>
          )}
          <button onClick={tab === 'active' ? load : loadTrash} className="btn-secondary p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card-dark rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <FileText className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total PDFs</p>
            <p className="text-2xl font-bold">{stats.totalPdf || resources.length}</p>
          </div>
        </div>
        <div className="glass-card-dark rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-icc-500/10 border border-icc-500/20">
            <Download className="w-6 h-6 text-icc-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Downloads</p>
            <p className="text-2xl font-bold">{totalDownloads.toLocaleString()}</p>
          </div>
        </div>
        <div className="glass-card-dark rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <HardDrive className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Storage Used</p>
            <p className="text-2xl font-bold">{humanSize(stats.totalStorage)}</p>
          </div>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => { setTab('active'); setSelectedIds(new Set()); }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'active' ? 'border-icc-500 text-icc-400' : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => { setTab('trash'); setSelectedIds(new Set()); }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors inline-flex items-center gap-1.5 ${
            tab === 'trash' ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Trash
          {trashItems.length > 0 && (
            <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">{trashItems.length}</span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === 'active' ? "Search PDFs by title, filename, or category..." : "Search trash..."}
          className="input-field ps-10"
        />
      </div>

      {/* Bulk action bar */}
      {tab === 'active' && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-icc-500/10 border border-icc-500/20">
          <span className="text-sm text-icc-400 font-medium">{selectedIds.size} selected</span>
          <button onClick={() => setShowBulkDeleteConfirm(true)} disabled={bulkDeleting} className="btn-danger text-xs px-3 py-1.5 min-h-[36px] inline-flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            {bulkDeleting ? 'Moving...' : 'Move to Trash'}
          </button>
          <button onClick={() => handleRestore(Array.from(selectedIds))} disabled={restoring} className="btn-secondary text-xs px-3 py-1.5 min-h-[36px] inline-flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${restoring ? 'animate-spin' : ''}`} />
            Restore
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-400 hover:text-gray-300 ml-auto">Clear selection</button>
        </div>
      )}

      {tab === 'active' && (
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDeleteAllConfirm(true)} className="btn-secondary text-xs px-3 py-1.5 min-h-[36px] inline-flex items-center gap-1.5 text-red-400 border-red-500/20 hover:border-red-500/40">
            <Trash2 className="w-3.5 h-3.5" />
            Delete All PDFs
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{tab === 'active' ? t('admin.no_pdf_resources') : 'Trash is empty'}</p>
          </div>
        ) : isMobile ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {filtered.map((file, i) => {
              const isExpanded = expandedCards.has(file.id || i);
              const toggleExpand = () => {
                const next = new Set(expandedCards);
                const key = file.id || i;
                if (next.has(key)) next.delete(key); else next.add(key);
                setExpandedCards(next);
              };
              return (
                <div key={file.id || file.url + i} className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    {tab === 'active' && (
                      <button onClick={() => toggleSelect(file.id)} className="mt-1 shrink-0">
                        {selectedIds.has(file.id) ? <CheckSquare className="w-4 h-4 text-icc-400" /> : <Square className="w-4 h-4 text-gray-500" />}
                      </button>
                    )}
                    <div className="p-2 rounded-lg border border-red-500/20 bg-red-500/10 shrink-0">
                      <FileText className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-white break-words">{file.title || file.name}</div>
                      {file.title && file.name !== file.title && <div className="text-xs text-gray-400 truncate mt-0.5">{file.name}</div>}
                      {file.deletedAt && <p className="text-xs text-red-400 mt-0.5">Deleted {new Date(file.deletedAt).toLocaleDateString()}</p>}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full border text-icc-400 bg-icc-500/10 border-icc-500/20">{file.category || '-'}</span>
                        <span className="text-xs text-gray-400 uppercase">{file.language || '-'}</span>
                        <span className="text-xs text-gray-400">{humanSize(file.size)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {tab === 'active' && (
                        <button onClick={() => toggleFeatured(file)} className={`p-1.5 rounded-lg transition-all ${file.featured ? 'text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-amber-400'}`} title={file.featured ? 'Unfeature' : 'Feature'}>
                          <Star className="w-4 h-4" fill={file.featured ? 'currentColor' : 'none'} />
                        </button>
                      )}
                      <button onClick={toggleExpand} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all" title="More actions">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Downloads</span>
                        <span className="text-gray-900 dark:text-gray-100">{file.downloads?.toLocaleString() || 0}</span>
                      </div>
                      {file.pages && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Pages</span>
                          <span className="text-gray-900 dark:text-gray-100">{file.pages}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        {tab === 'active' ? (
                          <>
                            <button onClick={() => setEditTarget(file)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-500 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all min-h-[44px]">
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button onClick={() => handlePreview(file)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-blue-500 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all min-h-[44px]">
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <a href={file.url} download={file.name} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-icc-500 bg-icc-500/10 border border-icc-500/20 hover:bg-icc-500/20 transition-all min-h-[44px]">
                              <Download className="w-3.5 h-3.5" /> Download
                            </a>
                            <button onClick={() => setDeleteTarget(file)} className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all min-h-[44px]">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleRestore([file.id])} disabled={restoring} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-icc-500 bg-icc-500/10 border border-icc-500/20 hover:bg-icc-500/20 transition-all min-h-[44px]">
                              <RefreshCw className="w-3.5 h-3.5" /> Restore
                            </button>
                            <button onClick={() => setDeletePermanentTarget(file)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all min-h-[44px]">
                              <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-dark-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {tab === 'active' && (
                    <th className="px-4 py-3 w-10">
                      <button onClick={toggleSelectAll} className="flex items-center">
                        {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4 text-icc-400" /> : <Square className="w-4 h-4 text-gray-500" />}
                      </button>
                    </th>
                  )}
                  <th className="text-start px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Title</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Category</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Language</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Pages</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Downloads</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Size</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Featured</th>
                  <th className="text-end px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filtered.map((file, i) => (
                  <tr key={file.id || file.url + i} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                    {tab === 'active' && (
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelect(file.id)} className="flex items-center">
                          {selectedIds.has(file.id) ? <CheckSquare className="w-4 h-4 text-icc-400" /> : <Square className="w-4 h-4 text-gray-500" />}
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 shrink-0">
                          <FileText className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium truncate block max-w-[200px]" title={file.title || file.name}>{file.title || file.name}</span>
                          {file.title && file.name !== file.title && <span className="text-xs text-gray-400 truncate block max-w-[200px]">{file.name}</span>}
                          {file.deletedAt && <span className="text-xs text-red-400">Deleted {new Date(file.deletedAt).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full border text-icc-400 bg-icc-500/10 border-icc-500/20">{file.category || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 uppercase text-xs">{file.language || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{file.pages ? `${file.pages} pages` : '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{file.downloads?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-gray-500">{humanSize(file.size)}</td>
                    <td className="px-4 py-3">
                      {tab === 'active' ? (
                        <button onClick={() => toggleFeatured(file)} className={`p-1 rounded-lg transition-all ${file.featured ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' : 'text-gray-400 hover:text-amber-400 hover:bg-amber-500/10'}`} title={file.featured ? 'Unfeature' : 'Feature'}>
                          <Star className="w-4 h-4" fill={file.featured ? 'currentColor' : 'none'} />
                        </button>
                      ) : <span className="text-gray-500 text-xs">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {tab === 'active' ? (
                          <>
                            <button onClick={() => setEditTarget(file)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all" title="Edit metadata"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => handlePreview(file)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all" title="Preview"><Eye className="w-4 h-4" /></button>
                            <a href={file.url} download={file.name} className="p-1.5 rounded-lg text-gray-400 hover:text-icc-500 hover:bg-icc-50 dark:hover:bg-icc-500/10 transition-all" title="Download"><Download className="w-4 h-4" /></a>
                            <button onClick={() => setDeleteTarget(file)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" title={t('admin.delete')}><Trash2 className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handlePreview(file)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all" title="Preview"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => handleRestore([file.id])} disabled={restoring} className="p-1.5 rounded-lg text-icc-400 hover:text-icc-300 hover:bg-icc-500/10 transition-all" title="Restore">
                              <RefreshCw className={`w-4 h-4 ${restoring ? 'animate-spin' : ''}`} />
                            </button>
                            <button onClick={() => setDeletePermanentTarget(file)} className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all" title="Delete forever"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                  <div className="p-2 rounded-full bg-red-500/10"><Upload className="w-5 h-5 text-red-500" /></div>
                  <h3 className="font-bold text-lg">Upload PDF</h3>
                </div>
                <button type="button" onClick={() => setShowUploadModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"><X className="w-4 h-4 text-white/60" /></button>
              </div>

              {uploadError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PDF File</label>
                  <input type="file" accept=".pdf,application/pdf" onChange={handleFileChange} required className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-500/10 file:text-red-500 hover:file:bg-red-500/20 file:cursor-pointer" />
                  {uploadFile && <p className="text-xs text-gray-400 mt-1">Selected: {uploadFile.name} ({humanSize(uploadFile.size)})</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} required placeholder="Enter PDF title" className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder="Enter optional description" className="input-field w-full h-20 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className="input-field w-full">
                    {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Collection</label>
                  <select value={uploadCollection} onChange={(e) => setUploadCollection(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-icc-500/50 text-sm">
                    <option value="">None (General)</option>
                    {COLLECTIONS.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                  <select value={uploadLanguage} onChange={(e) => setUploadLanguage(e.target.value)} className="input-field w-full">
                    {LANGUAGES.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
                  </select>
                </div>
                <div className="flex items-center gap-3 py-1">
                  <button type="button" onClick={() => setUploadFeatured(!uploadFeatured)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${uploadFeatured ? 'bg-icc-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${uploadFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Feature on Homepage</label>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={uploading} className="btn-primary inline-flex items-center gap-2">
                    {uploading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    {uploading ? 'Uploading...' : 'Upload PDF'}
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
                  <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-500/10"><Edit3 className="w-5 h-5 text-amber-500" /></div>
                  <h3 className="font-bold text-lg">Edit PDF Metadata</h3>
                </div>
                <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><X className="w-4 h-4 text-white/60" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input type="text" value={editTarget.title} onChange={(e) => setEditTarget({ ...editTarget, title: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={editTarget.description || ''} onChange={(e) => setEditTarget({ ...editTarget, description: e.target.value })} className="input-field w-full h-20 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={editTarget.category} onChange={(e) => setEditTarget({ ...editTarget, category: e.target.value })} className="input-field w-full">
                    {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                  <select value={editTarget.language || 'en'} onChange={(e) => setEditTarget({ ...editTarget, language: e.target.value })} className="input-field w-full">
                    {LANGUAGES.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
                  </select>
                </div>
                <div className="flex items-center gap-3 py-1">
                  <button type="button" onClick={() => setEditTarget({ ...editTarget, featured: !editTarget.featured })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editTarget.featured ? 'bg-icc-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editTarget.featured ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured on Homepage</label>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button onClick={() => setEditTarget(null)} className="btn-secondary">Cancel</button>
                <button onClick={handleEdit} disabled={saving} className="btn-primary inline-flex items-center gap-2">
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewUrl && previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => { setPreviewUrl(null); setPreviewItem(null); }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[80vh] bg-dark-800 rounded-2xl border border-white/10 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-dark-900/50 shrink-0">
                <span className="text-sm text-white/60 truncate">{previewItem.title || previewItem.name}</span>
                <button onClick={() => { setPreviewUrl(null); setPreviewItem(null); }} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-3 shrink-0"><X className="w-4 h-4 text-white/60" /></button>
              </div>
              <div className="flex-1 overflow-hidden">
                <iframe src={previewUrl} className="w-full h-full border-0" title="PDF Preview" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal />

      {/* Bulk Delete Confirm Modal */}
      <AnimatePresence>
        {showBulkDeleteConfirm && (
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
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/10"><AlertCircle className="w-5 h-5 text-red-500" /></div>
                <h3 className="font-bold text-lg">Move to Trash</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Move {selectedIds.size} selected PDF(s) to trash? You can restore them later.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowBulkDeleteConfirm(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleBulkDelete} disabled={bulkDeleting} className="btn-danger inline-flex items-center gap-2">
                  {bulkDeleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Trash2 className="w-4 h-4" /> Move to Trash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete All Confirm Modal */}
      <AnimatePresence>
        {showDeleteAllConfirm && (
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
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/10"><AlertCircle className="w-5 h-5 text-red-500" /></div>
                <h3 className="font-bold text-lg">Delete All PDFs</h3>
              </div>
              <p className="text-sm text-gray-500 mb-2">This will permanently delete all {resources.length} PDF files from the server. This action cannot be undone.</p>
              <p className="text-xs text-red-400 font-medium mb-6">Are you sure?</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowDeleteAllConfirm(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleDeleteAll} disabled={deletingAll} className="btn-danger inline-flex items-center gap-2">
                  {deletingAll && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Trash2 className="w-4 h-4" /> Delete All Permanently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permanent Delete Confirm Modal */}
      <AnimatePresence>
        {deletePermanentTarget && (
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
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/10"><AlertCircle className="w-5 h-5 text-red-500" /></div>
                <h3 className="font-bold text-lg">Delete Forever</h3>
              </div>
              <p className="text-sm text-gray-500 mb-2">This will permanently delete "{deletePermanentTarget.title || deletePermanentTarget.name}" from the server. This action cannot be undone.</p>
              <p className="text-xs text-red-400 font-medium mb-6">Are you sure?</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeletePermanentTarget(null)} className="btn-secondary">Cancel</button>
                <button onClick={() => handlePermanentDelete([deletePermanentTarget.id])} disabled={permanentDeleting} className="btn-danger inline-flex items-center gap-2">
                  {permanentDeleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Trash2 className="w-4 h-4" /> Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
