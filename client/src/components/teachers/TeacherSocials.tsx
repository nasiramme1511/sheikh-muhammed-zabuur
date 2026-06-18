import { motion } from 'framer-motion';
import { FaTelegramPlane, FaYoutube, FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaWhatsapp, FaGlobe } from 'react-icons/fa';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from '../../i18n';
import type { Teacher } from '../../types';

interface Props {
  teacher: Teacher;
}

interface SocialItem {
  key: keyof Teacher;
  icon: typeof FaTelegramPlane;
  label: string;
  color: string;
  hoverBg: string;
}

export default function TeacherSocials({ teacher }: Props) {
  const { t } = useTranslation();
  const label = (k: string) => {
    const map: Record<string, string> = {
      telegram: t('teacher_detail_page.telegram'),
      youtube: t('teacher_detail_page.youtube'),
      facebook: t('teacher_detail_page.facebook'),
      instagram: t('teacher_detail_page.instagram'),
      tiktok: t('teacher_detail_page.tiktok'),
      twitter: t('teacher_detail_page.twitter'),
      whatsapp: t('teacher_detail_page.whatsapp'),
      website: t('teacher_detail_page.telegram'),
    };
    return map[k] || k;
  };

  const socials: SocialItem[] = [
    { key: 'telegram', icon: FaTelegramPlane, label: label('telegram'), color: '#0088cc', hoverBg: 'hover:bg-[#0088cc]/20' },
    { key: 'youtube', icon: FaYoutube, label: label('youtube'), color: '#FF0000', hoverBg: 'hover:bg-[#FF0000]/20' },
    { key: 'facebook', icon: FaFacebook, label: label('facebook'), color: '#1877F2', hoverBg: 'hover:bg-[#1877F2]/20' },
    { key: 'instagram', icon: FaInstagram, label: label('instagram'), color: '#E4405F', hoverBg: 'hover:bg-[#E4405F]/20' },
    { key: 'tiktok', icon: FaTiktok, label: label('tiktok'), color: '#ffffff', hoverBg: 'hover:bg-white/10' },
    { key: 'twitter', icon: FaTwitter, label: label('twitter'), color: '#1DA1F2', hoverBg: 'hover:bg-[#1DA1F2]/20' },
    { key: 'whatsapp', icon: FaWhatsapp, label: label('whatsapp'), color: '#25D366', hoverBg: 'hover:bg-[#25D366]/20' },
    { key: 'website', icon: FaGlobe, label: label('website'), color: '#0EA5E9', hoverBg: 'hover:bg-icc-500/20' },
  ];

  const activeSocials = socials.filter((s) => teacher[s.key]);
  if (activeSocials.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <h2 className="text-lg font-semibold text-white mb-4">{t('teacher_detail_page.connect')}</h2>
      <div className="flex flex-wrap gap-2">
        {activeSocials.map((s) => {
          const Icon = s.icon;
          const url = teacher[s.key] as string | undefined;
          if (!url) return null;
          return (
            <a
              key={s.key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={s.label}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-dark-800/50 ${s.hoverBg} transition-all hover:scale-105 group`}
              style={{ borderColor: `${s.color}20` }}
            >
              <Icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">{s.label}</span>
              <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
            </a>
          );
        })}
      </div>
    </motion.div>
  );
}
