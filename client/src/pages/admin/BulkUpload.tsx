import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, FileText, Music, Video, Image,
  AlertCircle, CheckCircle, RefreshCw, Archive, File,
  Download, Trash2,
} from 'lucide-react';
import { admin } from '../../lib/api';

interface UploadResult {
  file?: string;
  zip?: string;
  title?: string;
  url?: string;
  status: string;
  message?: string;
  size?: number;
  type?: string;
  resourceType?: string;
  category?: string;
  collection?: string;
  extracted?: number;
}

export default function AdminBulkUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [duplicateAction, setDuplicateAction] = useState<'skip' | 'replace'>('skip');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incoming: FileList | File[]) => {
    const newFiles = Array.from(incoming).filter(f => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (!ext) return false;
      const allowed = ['mp3', 'wav', 'm4a', 'ogg', 'aac', 'mp4', 'webm', 'mov', 'mkv', 'ogv', 'pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'zip'];
      return allowed.includes(ext);
    });
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
  };

  const upload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setResults([]);
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    formData.append('duplicateAction', duplicateAction);
    try {
      const res = await admin.uploadBulk(formData);
      setResults(res.data.results || []);
    } catch {
      setResults([{ status: 'error', message: 'Upload failed. Check server connection.' }]);
    }
    setUploading(false);
  };

  const totalCreated = results.filter(r => r.status === 'created').length;
  const totalSkipped = results.filter(r => r.status === 'skipped').length;
  const totalReplaced = results.filter(r => r.status === 'replaced').length;
  const totalExtracted = results.filter(r => r.status === 'extracted').length;
  const totalErrors = results.filter(r => r.status === 'error').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Upload</h1>
        <p className="text-sm text-gray-500 mt-1">Upload multiple files or ZIP archives at once</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
          dragOver
            ? 'border-icc-500 bg-icc-500/5'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-900'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".mp3,.wav,.m4a,.ogg,.aac,.mp4,.webm,.mov,.mkv,.ogv,.pdf,.jpg,.jpeg,.png,.webp,.gif,.zip"
          className="hidden"
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
        />
        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Supports audio, video, PDF, images, and ZIP archives
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </span>
            <button onClick={() => setFiles([])} className="text-xs text-red-400 hover:text-red-300 font-medium">
              Clear all
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50 max-h-64 overflow-y-auto">
            {files.map((file, i) => {
              const ext = file.name.split('.').pop()?.toLowerCase();
              const Icon = ext === 'pdf' ? FileText : ['mp3', 'wav', 'm4a', 'ogg', 'aac'].includes(ext || '') ? Music : ['mp4', 'webm', 'mov', 'mkv'].includes(ext || '') ? Video : ext === 'zip' ? Archive : Image;
              const color = ext === 'pdf' ? 'text-red-400' : ['mp3', 'wav', 'm4a', 'ogg', 'aac'].includes(ext || '') ? 'text-blue-400' : ['mp4', 'webm', 'mov', 'mkv'].includes(ext || '') ? 'text-purple-400' : ext === 'zip' ? 'text-amber-400' : 'text-icc-400';
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <button onClick={() => removeFile(i)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls */}
      {files.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Duplicates:</label>
            <select
              value={duplicateAction}
              onChange={(e) => setDuplicateAction(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            >
              <option value="skip">Skip</option>
              <option value="replace">Replace</option>
            </select>
          </div>
          <button
            onClick={upload}
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-400 disabled:opacity-50 text-white text-sm font-semibold transition-all"
          >
            {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? `Uploading ${files.length} files...` : `Upload ${files.length} Files`}
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Upload Results</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4 text-sm">
              {totalCreated > 0 && <span className="flex items-center gap-1.5 text-icc-500"><CheckCircle className="w-4 h-4" /> {totalCreated} created</span>}
              {totalSkipped > 0 && <span className="flex items-center gap-1.5 text-amber-500"><AlertCircle className="w-4 h-4" /> {totalSkipped} skipped</span>}
              {totalReplaced > 0 && <span className="flex items-center gap-1.5 text-blue-500"><RefreshCw className="w-4 h-4" /> {totalReplaced} replaced</span>}
              {totalExtracted > 0 && <span className="flex items-center gap-1.5 text-purple-500"><Archive className="w-4 h-4" /> {totalExtracted} ZIPs extracted</span>}
              {totalErrors > 0 && <span className="flex items-center gap-1.5 text-red-500"><AlertCircle className="w-4 h-4" /> {totalErrors} errors</span>}
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50 max-h-80 overflow-y-auto">
              <AnimatePresence>
                {results.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 py-2">
                    {r.status === 'created' && <CheckCircle className="w-4 h-4 text-icc-500 shrink-0" />}
                    {r.status === 'skipped' && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                    {r.status === 'replaced' && <RefreshCw className="w-4 h-4 text-blue-500 shrink-0" />}
                    {r.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                    {r.status === 'extracted' && <Archive className="w-4 h-4 text-purple-500 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{r.file || r.zip || r.title}</p>
                      {r.message && <p className="text-xs text-gray-400">{r.message}</p>}
                      {r.category && <p className="text-xs text-gray-400">{r.category}{r.collection ? ` • ${r.collection}` : ''}</p>}
                    </div>
                    {r.size && <span className="text-xs text-gray-400 shrink-0">{(r.size / 1024 / 1024).toFixed(1)} MB</span>}
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
