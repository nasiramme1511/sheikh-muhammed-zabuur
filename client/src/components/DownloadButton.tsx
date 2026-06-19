import { useState, useEffect } from 'react';
import { Download, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';
import { downloadResource, onDownloadProgress } from '../lib/offline/download';
import toast from 'react-hot-toast';

interface DownloadButtonProps {
  resourceId: number;
  type: 'AUDIO' | 'VIDEO' | 'PDF';
  title: string;
  url: string;
  fileSize: number;
  sizeHuman: string;
  description?: string;
  category?: string;
  duration?: number;
  thumbnail?: string;
  variant?: 'icon' | 'full';
  className?: string;
}

export default function DownloadButton({
  resourceId,
  type,
  title,
  url,
  fileSize,
  sizeHuman,
  description,
  category,
  duration,
  thumbnail,
  variant = 'full',
  className = '',
}: DownloadButtonProps) {
  const { isDownloaded, refresh } = useOffline();
  const [status, setStatus] = useState<'idle' | 'downloading' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const downloaded = isDownloaded(resourceId, type);
  const downloadId = `${type}-${resourceId}`;

  useEffect(() => {
    if (downloaded) setStatus('completed');
  }, [downloaded]);

  async function handleDownload() {
    if (status === 'completed' || downloaded) return;
    setStatus('downloading');
    setProgress(0);

    const unsub = onDownloadProgress(downloadId, (pct, dlStatus) => {
      setProgress(pct);
      if (dlStatus === 'completed') {
        setStatus('completed');
        toast.success(`${type === 'AUDIO' ? 'Audio' : type === 'VIDEO' ? 'Video' : 'PDF'} saved offline`);
        refresh();
      } else if (dlStatus === 'error') {
        setStatus('error');
        toast.error('Download failed');
      }
    });

    try {
      await downloadResource({
        id: resourceId,
        type,
        title,
        url,
        fileSize,
        sizeHuman,
        description,
        category,
        duration,
        thumbnail,
      });
    } catch {
      setStatus('error');
    } finally {
      unsub();
    }
  }

  const labels: Record<string, { done: string; action: string }> = {
    AUDIO: { done: 'Available Offline', action: 'Save Offline' },
    VIDEO: { done: 'Available Offline', action: 'Download Video' },
    PDF: { done: 'Available Offline', action: 'Save PDF' },
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleDownload}
        disabled={status === 'downloading' || downloaded}
        className={`p-2.5 rounded-xl border transition-all duration-200 ${
          downloaded || status === 'completed'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : status === 'downloading'
            ? 'bg-icc-500/10 border-icc-500/30 text-icc-400'
            : 'bg-white/5 border-white/10 text-white/60 hover:bg-icc-500/10 hover:border-icc-500/30 hover:text-icc-400'
        } ${className}`}
        title={downloaded ? labels[type].done : labels[type].action}
      >
        {status === 'downloading' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : downloaded || status === 'completed' ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={status === 'downloading' || downloaded}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
        downloaded || status === 'completed'
          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default'
          : status === 'downloading'
          ? 'bg-icc-500/10 border border-icc-500/30 text-icc-400'
          : 'bg-white/5 border border-white/10 text-white/60 hover:bg-icc-500/10 hover:border-icc-500/30 hover:text-icc-400'
      } ${className}`}
    >
      {status === 'downloading' ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {progress}%
        </>
      ) : downloaded || status === 'completed' ? (
        <>
          <CheckCircle className="w-4 h-4" />
          {labels[type].done}
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          {labels[type].action} ({sizeHuman})
        </>
      )}
    </button>
  );
}
