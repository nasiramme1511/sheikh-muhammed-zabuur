import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlay, HiClock } from 'react-icons/hi';
import { useTranslation } from '../../i18n';

interface LatestLesson {
  id: number;
  title: string;
  slug: string;
  episodeNumber: number;
  duration: number;
  createdAt: string;
}

interface SeriesCardProps {
  name: string;
  nameAmharic?: string;
  nameArabic?: string;
  nameOromic?: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  color?: string;
  totalLessons?: number;
  totalDuration?: number;
  latestLesson?: LatestLesson | null;
}

export default function SeriesCard({
  slug,
  description,
  icon,
  color = '#0EA5E9',
  totalLessons,
  totalDuration,
  latestLesson,
}: SeriesCardProps) {
  const { t } = useTranslation();

  const durationHours = totalDuration ? Math.round(totalDuration / 3600) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Link
        to={`/series/${slug}`}
        className="glass-premium block rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] group"
        style={{
          borderColor: `${color}20`,
          '--series-color': color,
          '--glass-premium-hover-border': `${color}40`,
        } as React.CSSProperties}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}25` }}
        >
          {icon || '\uD83D\uDCDA'}
        </div>

        <h3 className="text-lg font-bold text-center mb-1.5 group-hover:text-icc-400 transition-colors">
          {t('series.names.' + slug as any)}
        </h3>

        {description && (
          <p className="text-sm text-white/60 text-center leading-relaxed line-clamp-2 mb-4">
            {description}
          </p>
        )}

        <div className="flex items-center justify-center gap-4 text-xs text-white/40 mb-4">
          {totalLessons !== undefined && (
            <span className="flex items-center gap-1">
              <HiPlay className="w-3.5 h-3.5" />
              {totalLessons} {t('nav.lessons')}
            </span>
          )}
          {durationHours > 0 && (
            <span className="flex items-center gap-1">
              <HiClock className="w-3.5 h-3.5" />
              {durationHours}h
            </span>
          )}
        </div>

        {latestLesson && (
          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{t('series.latest_lesson')}</p>
            <p className="text-xs text-white/80 truncate font-medium">
              {latestLesson.episodeNumber && `#${latestLesson.episodeNumber} `}
              {latestLesson.title}
            </p>
          </div>
        )}

        <div className="text-center pt-3 border-t border-white/5">
          <span
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-all group-hover:gap-2.5"
            style={{ color }}
          >
            {t('series.view_series')} <span className="text-lg leading-none">&rarr;</span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
