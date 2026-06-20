import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Library, Headphones, Video, FileText, Radio, Send, Users,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { admin } from '../../lib/api';
import { series as seriesApi } from '../../lib/api';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>({});
  const [seriesCount, setSeriesCount] = useState(0);

  useEffect(() => {
    admin.getStats().then(res => setStats(res.data || {})).catch(() => {});
    seriesApi.getAll().then(res => setSeriesCount(res.data?.length || 0)).catch(() => {});
  }, []);

  const cards = [
    { icon: Library, label: t('admin.study_series'), value: seriesCount, href: '/admin/series', color: 'text-icc-400' },
    { icon: Headphones, label: t('admin.audio_lessons'), value: stats.audioCount || 0, href: '/admin/audio', color: 'text-blue-400' },
    { icon: Video, label: t('admin.video_lessons'), value: stats.videoCount || 0, href: '/admin/videos', color: 'text-purple-400' },
    { icon: FileText, label: t('admin.pdf_library'), value: stats.pdfCount || 0, href: '/admin/pdfs', color: 'text-green-400' },
    { icon: Radio, label: t('admin.live_broadcasts'), value: stats.liveCount || 0, href: '/admin/live', color: 'text-red-400' },
    { icon: Send, label: t('admin.telegram_channels'), value: stats.telegramCount || 0, href: '/admin/telegram', color: 'text-sky-400' },
    { icon: Users, label: t('admin.users'), value: stats.userCount || 0, href: '/admin/site-settings', color: 'text-gold-400' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t('admin.dashboard')}</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <Link
            key={i}
            to={card.href}
            className="glass-premium p-5 rounded-xl hover:border-icc-500/30 transition-all"
          >
            <card.icon className={`w-6 h-6 ${card.color} mb-3`} />
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-white/40 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-premium p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">{t('admin.quick_actions')}</h2>
          <div className="space-y-2">
            {[
              { href: '/admin/series', label: t('admin.manage_series') },
              { href: '/admin/audio', label: t('admin.manage_audio') },
              { href: '/admin/videos', label: t('admin.manage_videos') },
              { href: '/admin/live', label: t('admin.manage_live') },
            ].map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="block px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
