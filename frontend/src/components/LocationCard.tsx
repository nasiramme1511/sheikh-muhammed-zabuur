import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, ExternalLink, Share2, QrCode } from 'lucide-react';
import { siteSettings } from '../lib/api';
import QrCodeShare from './QrCodeShare';
import type { SiteSettings } from '../types';

interface LocationCardProps {
  variant?: 'full' | 'compact' | 'minimal';
  title?: string;
  description?: string;
  showQR?: boolean;
  className?: string;
}

export default function LocationCard({
  variant = 'full',
  title = 'Visit Sheikh Mohammed Zabuur',
  description = 'Students and visitors can easily locate the Sheikh\'s teaching location through Google Maps.',
  showQR = true,
  className = '',
}: LocationCardProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    siteSettings.get().then(res => {
      if (res.data) setSettings(res.data);
    }).catch(() => {});
  }, []);

  const googleMapLink = settings?.googleMapLink || 'https://maps.google.com/?q=Ethiopia';

  const handleShareLocation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sheikh Mohammed Zabuur - Location',
          text: 'Visit Sheikh Mohammed Zabuur at his teaching location.',
          url: googleMapLink,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(googleMapLink);
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`glass-card-premium p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-icc-500/10 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-icc-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{title}</h4>
            <p className="text-[10px] text-white/40">Sheikh Mohammed Zabuur — Ethiopia</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={googleMapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-icc-500/10 text-icc-400 hover:bg-icc-500/20 border border-icc-500/20 transition-all text-[11px] font-medium"
          >
            <Navigation className="w-3 h-3" />
            Open in Google Maps
          </a>
          <button
            onClick={handleShareLocation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 border border-white/10 transition-all text-[11px] font-medium"
          >
            <Share2 className="w-3 h-3" />
            Share Location
          </button>
          {showQR && (
            <button
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 border border-white/10 transition-all text-[11px] font-medium"
            >
              <QrCode className="w-3 h-3" />
              QR Code
            </button>
          )}
        </div>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowQrModal(false)}>
            <div onClick={e => e.stopPropagation()}>
              <QrCodeShare url={googleMapLink} title="Sheikh Mohammed Zabuur Location" onClose={() => setShowQrModal(false)} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`glass-card-premium overflow-hidden ${className}`}
    >
      <div className="p-6 md:p-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-icc-500/10 border border-icc-500/20 flex items-center justify-center shrink-0">
            <MapPin className="w-7 h-7 text-icc-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-5">
          <p className="text-xs text-white/40">📍 Sheikh Mohammed Zabuur</p>
          <p className="text-sm text-white/80 font-medium">Authentic Islamic Learning Center</p>
          <p className="text-xs text-white/50 mt-1">Ethiopia</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={googleMapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 text-white text-sm font-semibold transition-all"
          >
            <Navigation className="w-4 h-4" />
            Open in Google Maps
          </a>
          <a
            href={`${googleMapLink}?directions=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Get Directions
          </a>
          <button
            onClick={handleShareLocation}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all text-sm font-medium"
          >
            <Share2 className="w-4 h-4" />
            Share Location
          </button>
          {showQR && (
            <button
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all text-sm font-medium"
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </button>
          )}
        </div>
      </div>

      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowQrModal(false)}>
          <div onClick={e => e.stopPropagation()}>
            <QrCodeShare url={googleMapLink} title="Sheikh Mohammed Zabuur Location" onClose={() => setShowQrModal(false)} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
