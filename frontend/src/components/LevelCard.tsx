import { Link } from 'react-router-dom';
import { HiArrowRight, HiCheck, HiLockClosed } from 'react-icons/hi';
import { Level } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedField } from '../lib/language';
import { useTranslation } from '../i18n';

interface Props {
  level: Level;
  index: number;
  userProgress?: { completedLessons: number; totalLessons: number };
  isLocked?: boolean;
}

export default function LevelCard({ level, index, userProgress, isLocked }: Props) {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const localizedName = getLocalizedField(level, 'name', language);
  const localizedDesc = getLocalizedField(level, 'description', language);
  const total = userProgress?.totalLessons || level._count?.lessons || 0;
  const completed = userProgress?.completedLessons || 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={`relative group ${isLocked ? 'opacity-60' : ''}`}>
      <Link
        to={isLocked ? '#' : `/levels/${level.slug}`}
        className={`block glass-card rounded-2xl border border-white/10 p-6 transition-all duration-300 ${
          isLocked ? '' : 'hover:border-gold-500/40 hover:-translate-y-1'
        }`}
        onClick={(e) => { if (isLocked) e.preventDefault(); }}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
            style={{ backgroundColor: level.color ? `${level.color}15` : '#f0fdf4' }}
          >
            {level.icon || '📚'}
          </div>
          {isLocked ? (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <HiLockClosed className="w-4 h-4 text-white/40" />
            </div>
          ) : pct === 100 ? (
            <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center">
              <HiCheck className="w-4 h-4 text-green-400" />
            </div>
          ) : (
            <span className="text-xs font-bold text-white/40">Level {index + 1}</span>
          )}
        </div>

        <h3 className="text-lg font-bold mb-1.5">{localizedName}</h3>
        <p className="text-sm text-white/60 leading-relaxed mb-4 line-clamp-2">
          {localizedDesc}
        </p>

        {total > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-white/60 mb-1.5">
              <span>{completed}/{total} {t('levels.lessons')}</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: level.color || '#0284C7',
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-xs text-white/40">
            {total} {t('levels.lessons')}
          </span>
          {!isLocked && (
            <span className="flex items-center gap-1 text-sm font-medium text-green-400 group-hover:gap-2 transition-all">
              {pct > 0 ? t('levels.continue_level') : t('levels.start_level')}
              <HiArrowRight className="w-4 h-4" />
            </span>
          )}
          {isLocked && (
            <span className="text-xs text-gray-400">{t('levels.unlock_message')}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
