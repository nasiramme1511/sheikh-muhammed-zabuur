import { useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Printer, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FaQrcode } from 'react-icons/fa';

interface QrCodeShareProps {
  url: string;
  title?: string;
  onClose?: () => void;
}

export default function QrCodeShare({ url, title, onClose }: QrCodeShareProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  const handleDownload = async () => {
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `qr-${title || 'code'}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
      toast.success('QR code downloaded');
    } catch {
      toast.error('Failed to download QR code');
    }
  };

  const handlePrint = () => {
    const win = window.open('');
    if (win) {
      win.document.write(`<img src="${qrUrl}" onload="window.print();window.close()" />`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const res = await fetch(qrUrl);
        const blob = await res.blob();
        const file = new File([blob], `qr-${title || 'code'}.png`, { type: 'image/png' });
        await navigator.share({ title: title || 'QR Code', files: [file] });
      } catch {
        // user cancelled
      }
    } else {
      toast.error('Share not supported on this browser');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="w-full max-w-sm mx-auto bg-surface-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-glass overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-icc-500/10 flex items-center justify-center">
            <FaQrcode className="w-4 h-4 text-icc-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">QR Code</h3>
            {title && (
              <p className="text-[11px] text-white/40 truncate max-w-[200px]">{title}</p>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col items-center gap-4">
        <div className="p-3 bg-white rounded-xl shadow-inner">
          <img
            ref={imgRef}
            src={qrUrl}
            alt={`QR code for ${url}`}
            className="w-44 h-44"
            crossOrigin="anonymous"
          />
        </div>
        <p className="text-xs text-white/40 text-center break-all max-w-full px-2 line-clamp-2">
          {url}
        </p>
      </div>

      <div className="flex items-center gap-2 px-5 pb-5">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 text-white text-xs font-semibold transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold border border-white/10 transition-all"
        >
          <Printer className="w-3.5 h-3.5" />
          Print
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold border border-white/10 transition-all"
          title="Share QR"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
