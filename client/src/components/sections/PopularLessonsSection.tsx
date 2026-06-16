import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Play, Clock, User, ArrowRight } from 'lucide-react';
import { useTranslation, type TranslationKey } from '../../i18n';

const lessons = [
  {
    title: 'Tafsir Al-Fatihah',
    teacher: 'Ust. Shaafii Muhammad',
    category: 'Tafsir',
    duration: '15 min',
    image: 'https://placehold.co/400x225/065F46/ffffff?text=Tafsir+Al-Fatihah',
    progress: 75,
    slug: 'tafsir-al-fatihah',
    color: '#10B981',
  },
  {
    title: 'Conditions of Prayer',
    teacher: 'Dr Zakir Naik',
    category: 'Fiqh',
    duration: '20 min',
    image: 'https://placehold.co/400x225/92400E/ffffff?text=Conditions+of+Prayer',
    progress: 100,
    slug: 'conditions-of-prayer',
    color: '#F59E0B',
  },
  {
    title: 'Introduction to Tajweed',
    teacher: 'Assim Al Hakeem',
    category: 'Tajweed',
    duration: '12 min',
    image: 'https://placehold.co/400x225/4C1D95/ffffff?text=Intro+to+Tajweed',
    progress: 30,
    slug: 'intro-to-tajweed',
    color: '#8B5CF6',
  },
  {
    title: 'Foundations of Faith',
    teacher: 'Nouman Ali Khan',
    category: 'Aqeedah',
    duration: '18 min',
    image: 'https://placehold.co/400x225/831843/ffffff?text=Foundations+of+Faith',
    progress: 0,
    slug: 'foundations-of-faith',
    color: '#EC4899',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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

export default function PopularLessonsSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/50 to-dark-900" />
      <div className="absolute top-1/3 right-0 w-80 h-80 opacity-10">
        <div className="w-full h-full rounded-full bg-icc-500 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 mb-4">
            <Play className="w-3.5 h-3.5 text-icc-400" />
            <span className="text-xs font-medium text-icc-300">{t('popular_lessons.badge')}</span>
          </div>
          <h2 className="section-title">
            <span className="text-gradient-icc">{t('popular_lessons.title')}</span>
          </h2>
          <p className="section-subtitle">
            {t('popular_lessons.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 gap-6"
        >
          {lessons.map((lesson) => (
            <motion.div key={lesson.slug} variants={cardVariants} className="group tilt-card">
              <Link
                to={`/lessons/${lesson.slug}`}
                className="block glass-card-premium overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-44 h-36 sm:h-auto flex-shrink-0 overflow-hidden">
                    <img
                      src={lesson.image}
                      alt={lesson.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-dark-900/50 to-transparent sm:bg-gradient-to-t from-dark-900/60 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-icc-500/80 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 md:p-5 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: `${lesson.color}15`,
                            color: lesson.color,
                            border: `1px solid ${lesson.color}25`,
                          }}
                        >
                          {lesson.category}
                        </span>
                        <span className="text-[10px] text-white/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.duration}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-white group-hover:text-icc-400 transition-colors line-clamp-1">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {lesson.teacher}
                      </p>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-white/30">{lesson.progress}% {t('levels.progress')}</span>
                        <span className="text-white/30">
                          {lesson.progress === 0
                            ? t('popular_lessons.not_started')
                            : lesson.progress === 100
                              ? t('popular_lessons.completed')
                              : t('popular_lessons.in_progress')}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${lesson.color}, ${lesson.color}80)` }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${lesson.progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-10"
        >
          <Link to="/search">
            <motion.span
              className="btn-outline inline-flex items-center gap-2 group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('popular_lessons.browse_all')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
