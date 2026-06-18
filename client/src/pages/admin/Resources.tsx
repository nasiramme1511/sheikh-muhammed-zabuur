import { useState, useEffect, useRef } from 'react';
import {
  Search, Trash2, Copy, Eye, Download, FileText,
  Music, Video, Image, HardDrive, RefreshCw,
  Upload, X, CheckCircle, AlertCircle, Edit3, Save,
  MoveRight, Wand2, Star, Globe, Globe2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { admin, books } from '../../lib/api';
import { COLLECTIONS, getCollectionBySlug, COLLECTION_COLORS } from '../../config/collections';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../i18n';
import type { Book } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';

interface ResourceItem {
  id: number;
  name: string;
  title: string;
  description?: string;
  category: string;
  language: string;
  author?: string;
  url: string;
  size: number;
  type: string;
  resourceType: string;
  collection?: string;
  createdAt: string;
  featured: boolean;
  bookId?: number | null;
  book?: { id: number; title: string; slug?: string } | null;
}

const CATEGORIES = ['Tafsir', 'Hadith', 'Riyadus Salihin', 'Tajweed', 'Usul al-Fiqh', 'Fiqh', 'Seerah', 'Aqeedah', 'Arabic Language', 'Manhaj', 'Adab', "Da'wah", 'Khutbah', 'Ramadan Series', 'Questions & Answers', 'General'];
const RESOURCE_TYPES = ['PDF', 'AUDIO', 'VIDEO', 'IMAGE'];

const TYPE_ICONS: Record<string, any> = {
  pdf: FileText,
  audio: Music,
  video: Video,
  image: Image,
  PDF: FileText,
  AUDIO: Music,
  VIDEO: Video,
  IMAGE: Image,
};

const TYPE_COLORS: Record<string, string> = {
  pdf: 'text-red-400 bg-red-500/10 border-red-500/20',
  audio: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  video: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  image: 'text-icc-400 bg-icc-500/10 border-icc-500/20',
  PDF: 'text-red-400 bg-red-500/10 border-red-500/20',
  AUDIO: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  VIDEO: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  IMAGE: 'text-icc-400 bg-icc-500/10 border-icc-500/20',
};

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function totalSize(files: ResourceItem[]): string {
  const total = files.reduce((acc, f) => acc + (f.size || 0), 0);
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
  if (total < 1024 * 1024 * 1024) return `${(total / (1024 * 1024)).toFixed(1)} MB`;
  return `${(total / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function AdminResources() {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [bookList, setBookList] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [filterType, setFilterType] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<ResourceItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadOverwrite, setUploadOverwrite] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editTarget, setEditTarget] = useState<ResourceItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<any[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetCollection, setMoveTargetCollection] = useState('');
  const [movingCollection, setMovingCollection] = useState(false);
  const [autoClassifying, setAutoClassifying] = useState(false);

  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState('General');
  const [uploadResourceType, setUploadResourceType] = useState('PDF');
  const [uploadLanguage, setUploadLanguage] = useState('en');
  const [uploadFeatured, setUploadFeatured] = useState(false);
  const [uploadBookId, setUploadBookId] = useState<string>('');
  const [uploadCollection, setUploadCollection] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStartTime, setUploadStartTime] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    
    // Auto-fill Title from name
    const ext = file.name.split('.').pop() || '';
    const baseName = file.name.substring(0, file.name.length - ext.length - 1);
    const pretty = baseName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    setUploadTitle(pretty);

    // Auto-detect type
    const mime = file.type;
    const extLower = ext.toLowerCase();
    if (mime === 'application/pdf' || extLower === 'pdf') {
      setUploadResourceType('PDF');
    } else if (mime.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.aac', '.m4a'].includes('.' + extLower)) {
      setUploadResourceType('AUDIO');
    } else if (mime.startsWith('video/') || ['.mp4', '.webm', '.ogv', '.mov'].includes('.' + extLower)) {
      setUploadResourceType('VIDEO');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a file to upload');
      return;
    }
    if (!uploadTitle.trim()) {
      setUploadError('Title is required');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setUploadSpeed('');
    const startTime = Date.now();
    setUploadStartTime(startTime);
    const fileForProgress = uploadFile;
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('title', uploadTitle.trim());
      fd.append('description', uploadDescription.trim());
      fd.append('category', uploadCategory);
      fd.append('resourceType', uploadResourceType);
      fd.append('language', uploadLanguage);
      fd.append('featured', uploadFeatured ? 'true' : 'false');
      if (uploadBookId) fd.append('bookId', uploadBookId);
      if (uploadOverwrite) fd.append('overwrite', 'true');
      fd.append('collection', uploadCollection || '');

      await admin.upload(fd, (pct) => {
        setUploadProgress(pct);
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed > 0 && fileForProgress) {
          const loaded = (pct / 100) * fileForProgress.size;
          const speedBps = loaded / elapsed;
          const speed = speedBps > 1024 * 1024
            ? `${(speedBps / (1024 * 1024)).toFixed(1)} MB/s`
            : `${(speedBps / 1024).toFixed(1)} KB/s`;
          setUploadSpeed(speed);
        }
      });
      
      // Reset state and close modal
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setUploadCategory('General');
      setUploadResourceType('PDF');
      setUploadLanguage('en');
      setUploadFeatured(false);
      setUploadBookId('');
      setUploadCollection('');
      load();
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Failed to upload resource');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadSpeed('');
    }
  };

  const load = () => {
    setLoading(true);
    Promise.all([
      admin.resources.getAll(),
      books.getAll(),
    ])
      .then(([res, booksRes]) => {
        setResources(Array.isArray(res.data) ? res.data : res.data?.items ?? []);
        setBookList(booksRes.data as Book[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = resources.filter((f) => {
    const matchSearch = !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.title?.toLowerCase().includes(search.toLowerCase()) ||
      f.category?.toLowerCase().includes(search.toLowerCase()) ||
      f.book?.title?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || f.resourceType === filterType.toUpperCase();
    return matchSearch && matchType;
  });

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
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
        bookId: editTarget.bookId || null,
        resourceType: editTarget.resourceType,
        collection: (editTarget as any).collection || '',
      });
      setEditTarget(null);
      load();
    } catch { /* silent */ }
    setSaving(false);
  };

  const typeCounts = {
    all: resources.length,
    pdf: resources.filter((f) => f.resourceType === 'PDF').length,
    audio: resources.filter((f) => f.resourceType === 'AUDIO').length,
    video: resources.filter((f) => f.resourceType === 'VIDEO').length,
    image: resources.filter((f) => f.resourceType === 'IMAGE').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.resources_manager_title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {resources.length} resources · {totalSize(resources)} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              setLoadingDuplicates(true);
              setShowDuplicates(true);
              try {
                const res = await admin.duplicates.find();
                setDuplicateGroups(res.data);
              } catch { setDuplicateGroups([]); }
              setLoadingDuplicates(false);
            }}
            className="btn-secondary inline-flex items-center gap-2 text-xs"
          >
            <Search className="w-3.5 h-3.5" />
            Find Duplicates
          </button>
          <button
            onClick={async () => {
              setRepairing(true);
              try { await admin.repairTypes(); load(); } catch {}
              setRepairing(false);
            }}
            disabled={repairing}
            className="btn-secondary inline-flex items-center gap-2 text-xs"
            title="Fix incorrectly typed resources based on file extension"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${repairing ? 'animate-spin' : ''}`} />
            Repair Types
          </button>
          <button
            onClick={async () => {
              if (!confirm('Delete ALL resources? This cannot be undone!')) return;
              try {
                await admin.resources.deleteAll();
                load();
              } catch {}
            }}
            className="btn-secondary inline-flex items-center gap-2 text-xs text-red-500 border-red-500/20 hover:bg-red-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete All
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Resource
          </button>
          <button onClick={load} className="btn-secondary p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['all', 'pdf', 'audio', 'video', 'image'] as const).map((type) => {
          const Icon = type === 'all' ? HardDrive : TYPE_ICONS[type];
          const count = typeCounts[type];
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-start transition-all ${
                filterType === type
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                  : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className={`p-1.5 rounded-lg border ${type !== 'all' ? TYPE_COLORS[type] : 'text-gray-400 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-gray-500 capitalize">{type}</div>
                <div className="text-sm font-bold">{count}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search resources by name, title, category, or book..."
          className="input-field ps-10"
        />
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-icc-50 dark:bg-icc-900/20 border border-icc-200 dark:border-icc-800">
          <span className="text-sm font-medium text-icc-700 dark:text-icc-300">
            {selectedIds.length} selected
          </span>
          <div className="flex-1" />
          <button
            onClick={() => setShowMoveModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-all"
          >
            <MoveRight className="w-3.5 h-3.5" /> Move
          </button>
          <button
            onClick={async () => {
              try {
                await admin.resources.bulkFeatured(selectedIds, true);
                setSelectedIds([]);
                load();
              } catch {}
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-all"
          >
            <Star className="w-3.5 h-3.5" /> Feature
          </button>
          <button
            onClick={async () => {
              try {
                await admin.resources.bulkFeatured(selectedIds, false);
                setSelectedIds([]);
                load();
              } catch {}
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-500/10 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-500/20 transition-all"
          >
            <Star className="w-3.5 h-3.5" /> Unfeature
          </button>
          <button
            onClick={async () => {
              try {
                await admin.resources.bulkPublish(selectedIds, true);
                setSelectedIds([]);
                load();
              } catch {}
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-icc-500/10 text-icc-600 dark:text-icc-400 text-xs font-medium hover:bg-icc-500/20 transition-all"
          >
            <Globe className="w-3.5 h-3.5" /> Publish
          </button>
          <button
            onClick={async () => {
              try {
                await admin.resources.bulkPublish(selectedIds, false);
                setSelectedIds([]);
                load();
              } catch {}
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-medium hover:bg-orange-500/20 transition-all"
          >
            <Globe2 className="w-3.5 h-3.5" /> Unpublish
          </button>
          <button
            onClick={async () => {
              if (!confirm(`Delete ${selectedIds.length} resources?`)) return;
              setBulkDeleting(true);
              try {
                await admin.resources.bulkDelete(selectedIds);
                setSelectedIds([]);
                load();
              } catch {}
              setBulkDeleting(false);
            }}
            disabled={bulkDeleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> {bulkDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Auto-classify */}
      <div className="flex justify-end">
        <button
          onClick={async () => {
            setAutoClassifying(true);
            try {
              await admin.resources.autoClassify(selectedIds.length > 0 ? selectedIds : undefined);
              load();
            } catch {}
            setAutoClassifying(false);
          }}
          disabled={autoClassifying}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-500 text-xs font-medium hover:bg-purple-500/20 disabled:opacity-50 transition-all"
        >
          <Wand2 className={`w-3.5 h-3.5 ${autoClassifying ? 'animate-spin' : ''}`} />
          {autoClassifying ? 'Classifying...' : selectedIds.length > 0 ? 'Auto-Classify Selected' : 'Auto-Classify All'}
        </button>
      </div>

      {/* Resources Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <HardDrive className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{t('admin.no_resources_found')}</p>
          </div>
        ) : isMobile ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {filtered.map((file, i) => {
              const Icon = TYPE_ICONS[file.resourceType] || FileText;
              const colorClass = TYPE_COLORS[file.resourceType] || TYPE_COLORS.image;
              const isExpanded = expandedCards.has(file.id);
              const toggleExpand = () => {
                const next = new Set(expandedCards);
                if (next.has(file.id)) next.delete(file.id); else next.add(file.id);
                setExpandedCards(next);
              };
              return (
                <div key={file.id || file.url + i} className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg border shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-white break-words">
                        {file.title || file.name}
                      </div>
                      {file.title && file.name !== file.title && (
                        <div className="text-xs text-gray-400 truncate mt-0.5">{file.name}</div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border uppercase ${colorClass}`}>
                          {file.resourceType?.toLowerCase() || file.type}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          file.category ? 'text-icc-400 bg-icc-500/10 border-icc-500/20' : 'text-gray-500'
                        }`}>
                          {file.category || '-'}
                        </span>
                        <span className="text-xs text-gray-400">{humanSize(file.size)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(file.id)}
                        onChange={() => {
                          setSelectedIds(prev =>
                            prev.includes(file.id) ? prev.filter(id => id !== file.id) : [...prev, file.id]
                          );
                        }}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <button onClick={toggleExpand} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all" title="More details">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 space-y-2">
                      {file.collection && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Collection</span>
                          <span>{(() => {
                            const col = getCollectionBySlug(file.collection);
                            return col ? `${col?.icon} ${col?.name || file.collection}` : file.collection;
                          })()}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Book</span>
                        <span className="text-gray-900 dark:text-gray-100">{file.book?.title || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Date</span>
                        <span className="text-gray-900 dark:text-gray-100 text-xs">
                          {new Date(file.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => setEditTarget(file)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-500 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all min-h-[44px]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => setPreviewUrl(file.url)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-blue-500 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all min-h-[44px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => handleCopy(file.url)}
                          className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium text-icc-500 bg-icc-500/10 border border-icc-500/20 hover:bg-icc-500/20 transition-all min-h-[44px]"
                        >
                          {copiedUrl === file.url ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <a
                          href={file.url}
                          download={file.name}
                          className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium text-icc-500 bg-icc-500/10 border border-icc-500/20 hover:bg-icc-500/20 transition-all min-h-[44px]"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setDeleteTarget(file)}
                          className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all min-h-[44px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.length === filtered.length}
                      onChange={() => {
                        if (selectedIds.length === filtered.length) setSelectedIds([]);
                        else setSelectedIds(filtered.map(f => f.id));
                      }}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Resource</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Category</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Type</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Collection</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Book</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Size</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-end px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filtered.map((file, i) => {
                  const Icon = TYPE_ICONS[file.resourceType] || FileText;
                  const colorClass = TYPE_COLORS[file.resourceType] || TYPE_COLORS.image;
                  return (
                    <tr key={file.id || file.url + i} className={`hover:bg-gray-50 dark:hover:bg-white/2 transition-colors ${selectedIds.includes(file.id) ? 'bg-icc-50/50 dark:bg-icc-900/10' : ''}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(file.id)}
                          onChange={() => {
                            setSelectedIds(prev =>
                              prev.includes(file.id) ? prev.filter(id => id !== file.id) : [...prev, file.id]
                            );
                          }}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-1.5 rounded-lg border shrink-0 ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium truncate block max-w-[180px]" title={file.title || file.name}>
                              {file.title || file.name}
                            </span>
                            {file.title && file.name !== file.title && (
                              <span className="text-xs text-gray-400 truncate block max-w-[180px]">{file.name}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          file.category ? 'text-icc-400 bg-icc-500/10 border-icc-500/20' : 'text-gray-500'
                        }`}>
                          {file.category || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border uppercase ${colorClass}`}>
                          {file.resourceType?.toLowerCase() || file.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {file.collection ? (() => {
                          const col = getCollectionBySlug(file.collection);
                          const colColor = col ? (COLLECTION_COLORS[col.slug] || 'text-gray-400 bg-gray-500/10 border-gray-500/20') : 'text-gray-400 bg-gray-500/10 border-gray-500/20';
                          return (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colColor}`}>
                              {col?.icon} {col?.name || file.collection}
                            </span>
                          );
                        })() : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">
                        {file.book?.title || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{humanSize(file.size)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(file.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <button
                            onClick={() => setEditTarget(file)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"
                            title="Edit metadata"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {/* Preview */}
                          <button
                            onClick={() => setPreviewUrl(file.url)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Copy URL */}
                          <button
                            onClick={() => handleCopy(file.url)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-icc-500 hover:bg-icc-50 dark:hover:bg-icc-500/10 transition-all"
                            title="Copy URL"
                          >
                            {copiedUrl === file.url ? (
                              <CheckCircle className="w-4 h-4 text-icc-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          {/* Download */}
                          <a
                            href={file.url}
                            download={file.name}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-icc-500 hover:bg-icc-50 dark:hover:bg-icc-500/10 transition-all"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(file)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                            title={t('admin.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                  <div className="p-2 rounded-full bg-icc-500/10">
                    <Upload className="w-5 h-5 text-icc-500" />
                  </div>
                  <h3 className="font-bold text-lg">Upload Resource</h3>
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
                {/* File picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File</label>
                  <input
                    type="file"
                    accept="image/*,audio/*,video/*,application/pdf"
                    onChange={handleFileChange}
                    required
                    className="w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-xl file:border-0
                      file:text-xs file:font-semibold
                      file:bg-icc-500/10 file:text-icc-500
                      hover:file:bg-icc-500/20 file:cursor-pointer"
                  />
                  {uploadFile && (
                    <p className="text-xs text-gray-400 mt-1">
                      Selected: {uploadFile.name} ({humanSize(uploadFile.size)})
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    required
                    placeholder="Enter resource title"
                    className="input-field w-full"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Enter optional description"
                    className="input-field w-full h-20 resize-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
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

                {/* Collection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Collection</label>
                  <select
                    value={uploadCollection}
                    onChange={(e) => setUploadCollection(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-icc-500/50 text-sm"
                  >
                    <option value="">None (General)</option>
                    {COLLECTIONS.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Resource Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource Type</label>
                  <select
                    value={uploadResourceType}
                    onChange={(e) => setUploadResourceType(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="PDF">PDF</option>
                    <option value="AUDIO">Audio</option>
                    <option value="VIDEO">Video</option>
                    <option value="IMAGE">Image</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                  <select
                    value={uploadLanguage}
                    onChange={(e) => setUploadLanguage(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic (العربية)</option>
                    <option value="am">Amharic (አማርኛ)</option>
                    <option value="om">Oromoo (Afaan Oromoo)</option>
                  </select>
                </div>

                {/* Featured */}
                <div className="flex items-center gap-3 py-1">
                  <button
                    type="button"
                    onClick={() => setUploadFeatured(!uploadFeatured)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      uploadFeatured ? 'bg-icc-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      uploadFeatured ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Feature on Homepage</label>
                </div>

                {/* Book */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Book</label>
                  <select
                    value={uploadBookId}
                    onChange={(e) => setUploadBookId(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Select Book (Optional)</option>
                    {bookList.map((b) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                </div>

                {/* Overwrite toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="modal-overwrite"
                    checked={uploadOverwrite}
                    onChange={(e) => setUploadOverwrite(e.target.checked)}
                    className="w-4 h-4 rounded text-icc-500 border-gray-300 focus:ring-icc-500 bg-transparent"
                  />
                  <label htmlFor="modal-overwrite" className="text-sm text-gray-700 dark:text-gray-300">
                    Replace existing resource with same filename
                  </label>
                </div>

                {uploading && uploadProgress > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{uploadProgress}%</span>
                      {uploadSpeed && <span>{uploadSpeed}</span>}
                      {uploadFile && (
                        <span>{humanSize(uploadFile.size)}</span>
                      )}
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-icc-500 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      {uploadProgress < 100
                        ? `Uploading... ~${uploadSpeed ? Math.round(((100 - uploadProgress) / uploadProgress) * ((Date.now() - uploadStartTime) / 1000)) + 's remaining' : 'calculating...'}`
                        : 'Processing...'}
                    </p>
                  </div>
                )}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    {uploading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    {uploading ? 'Uploading...' : 'Upload Resource'}
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
                  <h3 className="font-bold text-lg">Edit Resource Metadata</h3>
                </div>
                <button
                  onClick={() => setEditTarget(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={editTarget.title}
                    onChange={(e) => setEditTarget({ ...editTarget, title: e.target.value })}
                    className="input-field w-full"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={editTarget.description || ''}
                    onChange={(e) => setEditTarget({ ...editTarget, description: e.target.value })}
                    className="input-field w-full h-20 resize-none"
                  />
                </div>

                {/* Category */}
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

                {/* Collection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Collection</label>
                  <select
                    value={editTarget.collection || ''}
                    onChange={(e) => setEditTarget({ ...editTarget, collection: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-icc-500/50 text-sm"
                  >
                    <option value="">None</option>
                    {COLLECTIONS.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Resource Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource Type</label>
                  <select
                    value={editTarget.resourceType}
                    onChange={(e) => setEditTarget({ ...editTarget, resourceType: e.target.value })}
                    className="input-field w-full"
                  >
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t} value={t}>{t === 'AUDIO' ? 'Audio' : t === 'VIDEO' ? 'Video' : t === 'IMAGE' ? 'Image' : t}</option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                  <select
                    value={editTarget.language || 'en'}
                    onChange={(e) => setEditTarget({ ...editTarget, language: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic (العربية)</option>
                    <option value="am">Amharic (አማርኛ)</option>
                    <option value="om">Oromoo (Afaan Oromoo)</option>
                  </select>
                </div>

                {/* Featured */}
                <div className="flex items-center gap-3 py-1">
                  <button
                    type="button"
                    onClick={() => setEditTarget({ ...editTarget, featured: !editTarget.featured })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      editTarget.featured ? 'bg-icc-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      editTarget.featured ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured on Homepage</label>
                </div>

                {/* Book */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Book</label>
                  <select
                    value={editTarget.bookId ?? ''}
                    onChange={(e) => setEditTarget({ ...editTarget, bookId: e.target.value ? Number(e.target.value) : null })}
                    className="input-field w-full"
                  >
                    <option value="">Select Book</option>
                    {bookList.map((b) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setEditTarget(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  disabled={saving}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[80vh] bg-dark-800 rounded-2xl border border-white/10 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-dark-900/50 shrink-0">
                <span className="text-sm text-white/60 truncate">{previewUrl}</span>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-3 shrink-0"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {(() => {
                  // Detect type by resourceType of the previewed file
                  const pFile = resources.find(r => r.url === previewUrl);
                  const pType = pFile?.resourceType?.toUpperCase();
                  if (pType === 'PDF' || previewUrl.includes('/pdfs/')) {
                    return <iframe src={previewUrl} className="w-full h-full border-0" title="Preview" />;
                  } else if (pType === 'AUDIO' || previewUrl.includes('/audio/')) {
                    return (
                      <div className="flex flex-col items-center justify-center h-full gap-4 bg-gradient-to-b from-dark-900 to-dark-800">
                        <div className="w-24 h-24 rounded-full bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center">
                          <Music className="w-10 h-10 text-blue-400" />
                        </div>
                        <p className="text-white/60 text-sm">{pFile?.title || 'Audio File'}</p>
                        <audio controls className="w-full max-w-lg px-8">
                          <source src={previewUrl} />
                        </audio>
                      </div>
                    );
                  } else if (pType === 'VIDEO' || previewUrl.includes('/videos/')) {
                    return (
                      <video controls playsInline className="w-full h-full object-contain bg-black">
                        <source src={previewUrl} />
                      </video>
                    );
                  } else {
                    return <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-4" />;
                  }
                })()}
              </div>
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
                <h3 className="font-bold text-lg">{t('admin.delete_resource')}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {t('admin.delete_warning')}
              </p>
              <p className="text-sm font-mono bg-gray-100 dark:bg-dark-900 px-3 py-2 rounded-lg text-red-500 break-all mb-6">
                {deleteTarget.name}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="btn-secondary"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-primary bg-red-500 hover:bg-red-600 border-red-500 inline-flex items-center gap-2"
                >
                  {deleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {t('admin.delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move to Collection Modal */}
      <AnimatePresence>
        {showMoveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowMoveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <MoveRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Move to Collection</h3>
                  <p className="text-sm text-gray-500">Move {selectedIds.length} resource(s) to a collection</p>
                </div>
              </div>
              <select
                value={moveTargetCollection}
                onChange={(e) => setMoveTargetCollection(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm mb-4"
              >
                <option value="">No collection (unassign)</option>
                {COLLECTIONS.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowMoveModal(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium">Cancel</button>
                <button
                  onClick={async () => {
                    setMovingCollection(true);
                    try {
                      await admin.resources.moveCollection(selectedIds, moveTargetCollection);
                      setShowMoveModal(false);
                      setSelectedIds([]);
                      load();
                    } catch {}
                    setMovingCollection(false);
                  }}
                  disabled={movingCollection}
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium disabled:opacity-50"
                >
                  {movingCollection ? 'Moving...' : 'Move'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duplicates Modal */}
      <AnimatePresence>
        {showDuplicates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDuplicates(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-4xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-500/10">
                    <Search className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="font-bold text-lg">Duplicate Resources</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDuplicates(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {loadingDuplicates ? (
                <div className="py-16 flex justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : duplicateGroups.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-3 text-icc-400" />
                  <p>{t('admin.no_duplicates_found')}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm text-gray-500">Found {duplicateGroups.length} duplicate groups. Keep the one you want and delete the rest.</p>
                  {duplicateGroups.map((group: any, gi: number) => (
                    <div key={gi} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 dark:bg-dark-900/50 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          {group.type} match
                        </span>
                        <span className="text-xs text-gray-400 truncate flex-1">{group.key}</span>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {group.items.map((item: any) => (
                          <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">{item.title}</span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                                  item.resourceType === 'PDF' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                                  item.resourceType === 'AUDIO' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                                  item.resourceType === 'VIDEO' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                                  'text-icc-400 bg-icc-500/10 border-icc-500/20'
                                }`}>{item.resourceType}</span>
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                #{item.id} · {item.fileUrl?.split('/').pop()} · {item.downloads} downloads · {item.views} views

                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4 shrink-0">
                              <button
                                onClick={async () => {
                                  const others = group.items.filter((x: any) => x.id !== item.id).map((x: any) => x.id);
                                  if (!confirm(`Keep "${item.title}" and delete ${others.length} duplicate(s)?`)) return;
                                  try {
                                    await admin.duplicates.merge(item.id, others);
                                    const res = await admin.duplicates.find();
                                    setDuplicateGroups(res.data);
                                  } catch {}
                                }}
                                className="px-2 py-1 text-xs font-semibold rounded-lg bg-icc-500/10 text-icc-500 border border-icc-500/20 hover:bg-icc-500/20 transition-colors"
                              >
                                Keep This
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm(`Delete "${item.title}" (#${item.id})? This cannot be undone.`)) return;
                                  try {
                                    await admin.resources.delete(item.url);
                                    const res = await admin.duplicates.find();
                                    setDuplicateGroups(res.data);
                                  } catch {}
                                }}
                                className="px-2 py-1 text-xs font-semibold rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}