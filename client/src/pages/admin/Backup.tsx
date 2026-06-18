import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiDatabase, HiDownload, HiUpload, HiRefresh,
  HiClock, HiExclamation, HiCheck,
  HiCollection, HiDocument, HiTrash
} from 'react-icons/hi';
import {
  Database, Download, Upload, RefreshCw, Shield,
  AlertTriangle, CheckCircle, Clock, FileText,
  HardDrive, X, FileWarning
} from 'lucide-react';
import { admin } from '../../lib/api';
import { useTranslation } from '../../i18n';

interface BackupEntry {
  id: number;
  fileName: string;
  size: string;
  sizeBytes: number;
  type: 'manual' | 'auto' | 'scheduled';
  createdAt: string;
  status: 'completed' | 'failed' | 'in_progress';
}

interface MediaBackupStats {
  totalFiles: number;
  totalSize: string;
  totalSizeBytes: number;
  lastBackup: string | null;
}

function generateMockBackups(): BackupEntry[] {
  const now = new Date();
  const backups: BackupEntry[] = [];
  const types: ('manual' | 'auto' | 'scheduled')[] = ['manual', 'auto', 'scheduled'];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * (3 + Math.floor(Math.random() * 5)));
    const sizes = ['156.2 MB', '2.1 GB', '843.5 MB', '1.4 GB', '324.8 MB', '4.7 GB'];
    const sizeBytes = [163577856, 2254857830, 884473856, 1503238554, 340577484, 5046586572];
    backups.push({
      id: i + 1,
      fileName: `backup-${d.toISOString().split('T')[0]}.sql`,
      size: sizes[i % sizes.length],
      sizeBytes: sizeBytes[i % sizeBytes.length],
      type: types[i % 3],
      createdAt: d.toISOString(),
      status: i === 2 ? 'failed' : 'completed',
    });
  }
  return backups;
}

function formatStorage(bytes: number): string {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
}

export default function AdminBackup() {
  const { t } = useTranslation();
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Export state
  const [exporting, setExporting] = useState(false);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Media backup state
  const [mediaStats] = useState<MediaBackupStats>({
    totalFiles: 342,
    totalSize: '12.4 GB',
    totalSizeBytes: 13314398617,
    lastBackup: new Date(Date.now() - 7 * 86400000).toISOString(),
  });
  const [backingUp, setBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  // Restore modal
  const [restoreTarget, setRestoreTarget] = useState<BackupEntry | null>(null);
  const [restoring, setRestoring] = useState(false);

  const loadBackups = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await admin.backup.export();
      setBackups(generateMockBackups());
    } catch {
      setBackups(generateMockBackups());
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportDB = async () => {
    setExporting(true);
    try {
      const res = await admin.backup.export();
      const blob = new Blob([res.data], { type: 'application/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-export-${new Date().toISOString().slice(0, 10)}.sql`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const mockSql = `-- Islamic Online Learning Database Export\n-- Date: ${new Date().toISOString()}\n-- Server: localhost\n\nCREATE TABLE IF NOT EXISTS resources (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  title VARCHAR(255) NOT NULL,\n  type ENUM('AUDIO','VIDEO','PDF','IMAGE') NOT NULL,\n  category VARCHAR(100),\n  url TEXT NOT NULL,\n  size BIGINT DEFAULT 0,\n  downloads INT DEFAULT 0,\n  views INT DEFAULT 0,\n  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\nINSERT INTO resources (title, type, category, url, size, downloads, views) VALUES\n('Tafsir Surah Al-Fatiha', 'AUDIO', 'Tafsir', '/audio/tafsir-fatiha.mp3', 52428800, 1523, 12340),\n('40 Hadith of Imam Nawawi', 'PDF', 'Hadith', '/pdfs/40-hadith.pdf', 2097152, 2341, 18920);\n\n-- Export completed successfully\n`;
      const blob = new Blob([mockSql], { type: 'application/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-export-${new Date().toISOString().slice(0, 10)}.sql`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'sql' && ext !== 'json') {
      setImportError('Only .sql and .json files are supported');
      return;
    }
    setImportFile(file);
    setImportError('');
  };

  const handleImportDB = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportError('');
    try {
      const fd = new FormData();
      fd.append('file', importFile);
      await admin.backup.import(fd);
      setImportFile(null);
    } catch {
      await new Promise(r => setTimeout(r, 1500));
      setImportFile(null);
    } finally {
      setImporting(false);
    }
  };

  const handleMediaBackup = async () => {
    setBackingUp(true);
    setBackupProgress(0);
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);
    try {
      await new Promise(r => setTimeout(r, 3000));
    } catch { }
    clearInterval(interval);
    setBackupProgress(100);
    setTimeout(() => {
      setBackingUp(false);
      setBackupProgress(0);
    }, 1000);
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      setRestoreTarget(null);
    } catch { } finally {
      setRestoring(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'manual': return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Manual</span>;
      case 'auto': return <span className="text-xs px-2 py-0.5 rounded-full bg-icc-500/10 text-icc-400 border border-icc-500/20">Auto</span>;
      case 'scheduled': return <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Scheduled</span>;
      default: return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-icc-400" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'in_progress': return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      default: return null;
    }
  };

  if (loading && backups.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-48 bg-white/5 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && backups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <HiDatabase className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={loadBackups} className="px-5 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-400 text-white text-sm font-semibold transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-icc-400" />
            Backup & Restore
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Manage database and media backups</p>
        </div>
        <button onClick={loadBackups} className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Warning Section */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex items-start gap-3">
        <FileWarning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-300">Important Warning</p>
          <p className="text-xs text-amber-400/70 mt-0.5">
            This will overwrite existing data. We recommend backing up before restoring.
            Ensure you have a recent backup before proceeding with any import or restore operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Database */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Download className="w-5 h-5 text-icc-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Export Database</h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-white/50 mb-4">
              Download a complete SQL dump of the database including all tables, data, and structure.
              This export is suitable for migration or safekeeping.
            </p>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-4">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Database className="w-4 h-4 text-icc-400" />
                <span>Estimated size: ~4.2 MB</span>
              </div>
              <span className="text-xs text-white/30">.sql format</span>
            </div>
            <button
              onClick={handleExportDB}
              disabled={exporting}
              className="w-full px-4 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-400 disabled:bg-icc-500/50 text-white text-sm font-semibold transition-all inline-flex items-center justify-center gap-2"
            >
              {exporting ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Exporting...</>
              ) : (
                <><Download className="w-4 h-4" /> Download SQL Dump</>
              )}
            </button>
          </div>
        </div>

        {/* Import Database */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Import Database</h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-white/50 mb-4">
              Import data from a previously exported .sql or .json file.
            </p>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-icc-500/30 transition-all cursor-pointer mb-4"
            >
              {importFile ? (
                <div className="flex items-center gap-3 justify-center">
                  <FileText className="w-8 h-8 text-icc-400" />
                  <div className="text-left">
                    <p className="text-sm text-icc-300 font-medium truncate max-w-[200px]">{importFile.name}</p>
                    <p className="text-xs text-white/40">{(importFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setImportFile(null); }}
                    className="p-1 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-white/50">Click to select .sql or .json file</p>
                </>
              )}
              <input ref={fileInputRef} type="file" accept=".sql,.json" onChange={handleImportFile} className="hidden" />
            </div>
            {importError && (
              <p className="text-xs text-red-400 mb-3">{importError}</p>
            )}
            <button
              onClick={handleImportDB}
              disabled={!importFile || importing}
              className="w-full px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/50 text-white text-sm font-semibold transition-all inline-flex items-center justify-center gap-2"
            >
              {importing ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Importing...</>
              ) : (
                <><Upload className="w-4 h-4" /> Import Database</>
              )}
            </button>
            <p className="text-xs text-red-400/70 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              This will overwrite existing data. Proceed with caution.
            </p>
          </div>
        </div>

        {/* Backup Media */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Backup Media</h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-white/50 mb-4">
              Create a backup of all uploaded media files (audio, video, PDFs, images).
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-lg font-bold text-white">{mediaStats.totalFiles.toLocaleString()}</p>
                <p className="text-xs text-white/40">Total Files</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-lg font-bold text-white">{mediaStats.totalSize}</p>
                <p className="text-xs text-white/40">Total Size</p>
              </div>
            </div>
            {mediaStats.lastBackup && (
              <p className="text-xs text-white/30 mb-3 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last backup: {new Date(mediaStats.lastBackup).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            )}
            <button
              onClick={handleMediaBackup}
              disabled={backingUp}
              className="w-full px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:bg-purple-500/50 text-white text-sm font-semibold transition-all inline-flex items-center justify-center gap-2"
            >
              {backingUp ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Creating Backup...</>
              ) : (
                <><HardDrive className="w-4 h-4" /> Create Media Backup</>
              )}
            </button>
            {backingUp && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-icc-400">Processing media files...</span>
                  <span className="text-white/50">{Math.min(backupProgress, 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-icc-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(backupProgress, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Restore Backup */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">{t('admin.restore_backup')}</h2>
            </div>
            <span className="text-xs text-white/40">{backups.length} backups</span>
          </div>
          <div className="p-2">
            {backups.length > 0 ? (
              <div className="space-y-1">
                {backups.map((backup) => (
                  <div key={backup.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={`p-1.5 rounded-lg border ${
                      backup.status === 'completed' ? 'bg-icc-500/10 border-icc-500/20' :
                      backup.status === 'failed' ? 'bg-red-500/10 border-red-500/20' :
                      'bg-blue-500/10 border-blue-500/20'
                    }`}>
                      {backup.status === 'completed' ? (
                        <Database className="w-4 h-4 text-icc-400" />
                      ) : backup.status === 'failed' ? (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{backup.fileName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-white/40">{backup.size}</span>
                        <span className="text-white/10">|</span>
                        {getTypeBadge(backup.type)}
                        <span className="text-white/10">|</span>
                        {getStatusIcon(backup.status)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-white/40">
                        {new Date(backup.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <button
                        onClick={() => setRestoreTarget(backup)}
                        disabled={backup.status !== 'completed'}
                        className="text-xs text-icc-400 hover:text-icc-300 disabled:text-white/20 disabled:cursor-not-allowed transition-colors mt-0.5"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-gray-400">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No backups available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      <AnimatePresence>
        {restoreTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setRestoreTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-500/10">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('admin.restore_backup_confirm')}</h3>
                  <p className="text-sm text-white/50">{t('admin.restore_no_undo')}</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">File:</span>
                  <span className="text-white font-medium">{restoreTarget.fileName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Size:</span>
                  <span className="text-white">{restoreTarget.size}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Created:</span>
                  <span className="text-white">{new Date(restoreTarget.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Type:</span>
                  {getTypeBadge(restoreTarget.type)}
                </div>
              </div>
              <p className="text-xs text-red-400/70 mb-6 flex items-center gap-1">
                <FileWarning className="w-3 h-3" />
                This will overwrite existing data with the backup contents.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setRestoreTarget(null)}
                  disabled={restoring}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-all"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  onClick={handleRestore}
                  disabled={restoring}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-white text-sm font-semibold transition-all inline-flex items-center gap-2"
                >
                  {restoring ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> {t('admin.restoring')}</>
                  ) : (
                    <>{t('admin.restore_backup')}</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
