import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Book, BookOpen, BookMarked, Scale, Mic, Sprout } from 'lucide-react';
import { useTranslation, type TranslationKey } from '../../i18n';

const categories = [
  { icon: BookOpen, name: 'Tafsir', slug: 'tafsir', lessons: 0, color: '#7C3AED' },
  { icon: Scale, name: 'Usul', slug: 'usul', lessons: 0, color: '#059669' },
  { icon: BookMarked, name: 'Bulugh', slug: 'bulugh', lessons: 0, color: '#B45309' },
  { icon: Mic, name: 'Tajreed', slug: 'tajreed', lessons: 0, color: '#4F46E5' },
  { icon: Sprout, name: 'Riyad', slug: 'riyad', lessons: 0, color: '#65A30D' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function CategoriesSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-dark-900" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 opacity-10">
        <div className="w-full h-full rounded-full bg-gold-500 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 mb-4">
            <Book className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs font-medium text-gold-300">{t('home.subjects')}</span>
          </div>
          <h2 className="section-title">
            {t('home.explore_sciences')}
          </h2>
          <p className="section-subtitle">
            {t('home.subjects_desc')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div key={cat.slug} variants={cardVariants}>
                <Link
                  to={`/categories/${cat.slug}`}
                  className="group block glass-card-premium p-4 md:p-5 text-center"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                    style={{
                      background: `${cat.color}15`,
                      border: `1px solid ${cat.color}25`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-icc-400 transition-colors line-clamp-1">
                    {t(('nav.categories_names.' + cat.slug) as TranslationKey)}
                  </h3>
                  <p className="text-xs text-white/40 mt-1">{cat.lessons} {t('nav.lessons')}</p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-10"
        >
          <Link to="/categories">
            <motion.span
              className="btn-outline inline-flex items-center gap-2 group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('home.view_all_categories')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
