import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { FaTelegramPlane, FaWhatsapp, FaFacebook, FaFacebookMessenger, FaEnvelope, FaLink, FaShareAlt, FaQrcode } from 'react-icons/fa';
import toast from 'react-hot-toast';
import QrCodeShare from './QrCodeShare';

interface ShareContentProps {
  url: string;
  title: string;
  description?: string;
  onClose?: () => void;
}

const APP_ID = 'YOUR_FACEBOOK_APP_ID';

const shareOptions = [
  {
    name: 'Telegram',
    icon: FaTelegramPlane,
    color: '#0088cc',
    bgColor: 'bg-[#0088cc]',
    getUrl: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'WhatsApp',
    icon: FaWhatsapp,
    color: '#25D366',
    bgColor: 'bg-[#25D366]',
    getUrl: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(title)}%20${encodeURIComponent(url)}`,
  },
  {
    name: 'Facebook',
    icon: FaFacebook,
    color: '#1877F2',
    bgColor: 'bg-[#1877F2]',
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'Messenger',
    icon: FaFacebookMessenger,
    color: '#0099FF',
    bgColor: 'bg-[#0099FF]',
    getUrl: (url: string) =>
      `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=${APP_ID}`,
  },
  {
    name: 'Email',
    icon: FaEnvelope,
    color: '#EA4335',
    bgColor: 'bg-[#EA4335]',
    getUrl: (url: string, title: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
] as const;

export default function ShareContent({ url, title, description, onClose }: ShareContentProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description || title, url });
      } catch {
        // user cancelled
      }
    }
  };

  if (showQr) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowQr(false)}
          className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <QrCodeShare url={url} title={title} />
      </div>
    );
  }

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
            <FaShareAlt className="w-4 h-4 text-icc-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Share</h3>
            <p className="text-[11px] text-white/40 truncate max-w-[200px]">{title}</p>
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

      <div className="p-5">
        {description && (
          <p className="text-xs text-white/50 mb-4 line-clamp-2">{description}</p>
        )}

        <div className="grid grid-cols-5 gap-3">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <a
                key={option.name}
                href={option.getUrl(url, title)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 group"
                title={option.name}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${option.bgColor} flex items-center justify-center text-white shadow-lg transition-all group-hover:scale-110 group-hover:-translate-y-0.5`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">
                  {option.name}
                </span>
              </a>
            );
          })}
        </div>

        <div className="mt-4 space-y-2">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold border border-white/10 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                Copied
              </>
            ) : (
              <>
                <FaLink className="w-3.5 h-3.5" />
                Copy Link
              </>
            )}
          </button>

          <div className="flex gap-2">
            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 text-white text-xs font-semibold transition-all"
              >
                <FaShareAlt className="w-3.5 h-3.5" />
                Share
              </button>
            )}
            <button
              onClick={() => setShowQr(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold border border-white/10 transition-all"
            >
              <FaQrcode className="w-3.5 h-3.5" />
              QR Code
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
