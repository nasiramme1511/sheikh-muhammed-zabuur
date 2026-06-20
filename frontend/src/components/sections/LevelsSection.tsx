import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { BookOpen, ArrowRight, Star, BookMarked, Heart, Target, User } from 'lucide-react';
import { useTranslation, type TranslationKey } from '../../i18n';

const levels = [
  { icon: BookMarked, titleKey: 'foundations_of_islam' as TranslationKey, descKey: 'foundations_of_islam_desc' as TranslationKey, lessons: 24, color: '#0EA5E9', slug: 'foundations' },
  { icon: Heart, titleKey: 'worship_basics' as TranslationKey, descKey: 'worship_basics_desc' as TranslationKey, lessons: 32, color: '#F59E0B', slug: 'worship' },
  { icon: User, titleKey: 'daily_muslim_life' as TranslationKey, descKey: 'daily_muslim_life_desc' as TranslationKey, lessons: 28, color: '#8B5CF6', slug: 'daily-life' },
  { icon: Star, titleKey: 'advanced_learning' as TranslationKey, descKey: 'advanced_learning_desc' as TranslationKey, lessons: 45, color: '#EC4899', slug: 'advanced' },
  { icon: Target, titleKey: 'personal_development' as TranslationKey, descKey: 'personal_development_desc' as TranslationKey, lessons: 20, color: '#06B6D4', slug: 'development' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function LevelsSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/50 to-dark-900" />
      <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
        <div className="w-full h-full rounded-full bg-icc-500 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 mb-4">
            <BookOpen className="w-3.5 h-3.5 text-icc-400" />
            <span className="text-xs font-medium text-icc-300">{t('levels.title')}</span>
          </div>
          <h2 className="section-title">
            {t('levels.subtitle')}
          </h2>
          <p className="section-subtitle">
            {t('levels.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {levels.map((level, i) => {
            const Icon = level.icon;
            const progress = Math.min(100, Math.floor((level.lessons / 45) * 100));
            return (
              <motion.div key={level.slug} variants={cardVariants} className="group tilt-card">
                <Link
                  to={`/levels/${level.slug}`}
                  className="block glass-card-premium p-6 h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: `${level.color}15`,
                        border: `1px solid ${level.color}30`,
                      }}
                    >
                      <Icon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-3" style={{ color: level.color }} />
                    </div>
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{
                        background: `${level.color}10`,
                        color: level.color,
                        border: `1px solid ${level.color}20`,
                      }}
                    >
                      {t('levels.level')} {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-icc-400 transition-colors">
                    {t(level.titleKey)}
                  </h3>
                  <p className="text-sm text-white/50 mb-4 line-clamp-2">{t(level.descKey)}</p>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-white/40">{level.lessons} {t('levels.lessons')}</span>
                      <span className="text-white/40">{progress}% {t('levels.completed')}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${level.color}, ${level.color}80)` }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-icc-400 font-medium group-hover:gap-2 transition-all">
                    {t('levels.continue_level')} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
