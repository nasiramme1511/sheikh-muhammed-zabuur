import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';
import { useTranslation, type TranslationKey } from '../../i18n';

const teachers = [
  {
    name: 'Assim Al Hakeem',
    title: 'Islamic Jurisprudence',
    image: 'https://placehold.co/200x200/10B981/ffffff?text=AA',
    lessons: 45,
    color: '#10B981',
    socials: ['X', 'YT', 'Web'],
  },
  {
    name: 'Mufti Menk',
    title: 'Islamic Spirituality',
    image: 'https://placehold.co/200x200/F59E0B/ffffff?text=MM',
    lessons: 52,
    color: '#F59E0B',
    socials: ['X', 'YT', 'Web'],
  },
  {
    name: 'Nouman Ali Khan',
    title: 'Quran Tafsir',
    image: 'https://placehold.co/200x200/8B5CF6/ffffff?text=NK',
    lessons: 38,
    color: '#8B5CF6',
    socials: ['X', 'YT', 'Web'],
  },
  {
    name: 'Omar Suleiman',
    title: 'Islamic History',
    image: 'https://placehold.co/200x200/EC4899/ffffff?text=OS',
    lessons: 41,
    color: '#EC4899',
    socials: ['X', 'YT', 'Web'],
  },
  {
    name: 'Yasir Qadhi',
    title: 'Aqeedah & Theology',
    image: 'https://placehold.co/200x200/06B6D4/ffffff?text=YQ',
    lessons: 35,
    color: '#06B6D4',
    socials: ['X', 'YT', 'Web'],
  },
  {
    name: 'Dr Zakir Naik',
    title: 'Comparative Religion',
    image: 'https://placehold.co/200x200/F97316/ffffff?text=ZN',
    lessons: 28,
    color: '#F97316',
    socials: ['X', 'YT', 'Web'],
  },
  {
    name: 'Uthman Ibn Farooq',
    title: 'Quran & Tafsir',
    image: 'https://placehold.co/200x200/6366F1/ffffff?text=UF',
    lessons: 31,
    color: '#6366F1',
    socials: ['X', 'YT', 'Web'],
  },
  {
    name: 'Bilal Assad',
    title: 'Islamic Spirituality',
    image: 'https://placehold.co/200x200/14B8A6/ffffff?text=BA',
    lessons: 26,
    color: '#14B8A6',
    socials: ['X', 'YT', 'Web'],
  },
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

export default function TeachersSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/30 to-dark-900" />
      <div className="absolute top-1/2 left-0 w-64 h-64 opacity-10">
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
            <Users className="w-3.5 h-3.5 text-icc-400" />
            <span className="text-xs font-medium text-icc-300">{t('teachers_page.our_scholars')}</span>
          </div>
          <h2 className="section-title">
            {t('teachers_page.title')}
          </h2>
          <p className="section-subtitle">
            {t('teachers_page.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {teachers.map((teacher) => (
            <motion.div key={teacher.name} variants={cardVariants} className="group tilt-card">
              <div className="glass-card-premium p-6 text-center h-full flex flex-col">
                <div className="relative mx-auto mb-5 w-24 h-24">
                  <div
                    className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle, ${teacher.color}, transparent)`,
                      transform: 'scale(1.4)',
                    }}
                  />
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-full h-full rounded-full object-cover border-2 border-white/10 group-hover:border-icc-400/50 transition-all duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg"
                    style={{ background: teacher.color }}
                  >
                    ✓
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-icc-400 transition-colors">
                  {teacher.name}
                </h3>
                <p className="text-sm text-white/50 mt-1">{teacher.title}</p>
                <div className="flex items-center justify-center gap-3 mt-2 text-xs">
                  <span className="text-white/40">{teacher.lessons} {t('teachers.lessons_count')}</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-auto pt-4 border-t border-white/5">
                  {teacher.socials.map((s) => (
                    <a
                      key={s}
                      href="#"
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-icc-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      onClick={(e) => e.preventDefault()}
                    >
                      <span className="text-[10px] font-bold text-white/40 hover:text-icc-400 transition-colors">{s}</span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-10"
        >
          <Link to="/teachers">
            <motion.span
              className="btn-outline inline-flex items-center gap-2 group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('teachers_page.view_all')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
