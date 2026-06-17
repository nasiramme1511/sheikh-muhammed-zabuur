import { useState, useEffect, useRef, type ElementType } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, ArrowRight, BookOpen, Scale, PenTool, Globe, BookMarked, Heart, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { telegram } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface ChannelData {
  id: number;
  name: string;
  teacherName: string | null;
  description: string | null;
  category: string;
}

const iconMap: Record<string, ElementType> = {
  default: BookOpen,
};

function getIconForChannel(name: string): ElementType {
  const lower = name.toLowerCase();
  if (lower.includes('arba')) return BookOpen;
  if (lower.includes('umdat') || lower.includes('ahkaam')) return Scale;
  if (lower.includes('tafsir')) return BookMarked;
  if (lower.includes('buluugh') || lower.includes('bulug') || lower.includes('maram') || lower.includes('maraam')) return Heart;
  if (lower.includes('nahw') || lower.includes('ajrum') || lower.includes('aajir')) return PenTool;
  if (lower.includes('duruus') || lower.includes('muhim')) return Globe;
  return BookOpen;
}

const iconColors = [
  '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#3B82F6',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function TelegramSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    telegram.getAll()
      .then((res) => setChannels(res.data ?? []))
      .catch(() => setChannels([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-dark-900" />
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(245, 158, 11, 0.05) 0%, transparent 50%)`,
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 mb-4">
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-medium text-sky-300">{t('telegram.badge')}</span>
          </div>
          <h2 className="section-title">
            {t('telegram.section_title')} <span className="text-gradient-gold">{t('telegram.section_title_highlight')}</span>
          </h2>
          <p className="section-subtitle">
            {t('telegram.section_subtitle')}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-icc-500 border-t-transparent" />
          </div>
        ) : channels.length === 0 ? null : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {channels.map((ch, i) => {
                  const Icon = getIconForChannel(ch.name);
                  const color = iconColors[i % iconColors.length];
                  return (
                    <motion.div key={ch.id} variants={cardVariants}>
                      <Link
                        to={user ? '/telegram' : '/login'}
                        className="group block glass-card-dark p-5 h-full"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{
                              background: `${color}15`,
                              border: `1px solid ${color}25`,
                            }}
                          >
                            <Icon className="w-5 h-5" style={{ color }} />
                          </div>
                          {!user && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Lock className="w-3 h-3" />
                              {t('telegram.login_required')}
                            </span>
                          )}
                          {user && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {t('telegram.active')}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-white group-hover:text-icc-400 transition-colors line-clamp-1">
                          {ch.name}
                        </h3>
                        {ch.description && (
                          <p className="text-xs text-white/40 mt-2 line-clamp-2 leading-relaxed">{ch.description}</p>
                        )}
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-xs text-sky-400 font-semibold flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5" />
                            {user ? t('telegram.join') : t('telegram.login_required')}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    </motion.div>
                  );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
