import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { testimonials } from '../../config/site';

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

export default function TestimonialsSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-dark-900" />
      <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
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
            <Quote className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs font-medium text-gold-300">{t('testimonials.badge')}</span>
          </div>
          <h2 className="section-title">
            {t('testimonials.title')} <span className="text-gradient-gold">{t('testimonials.title_highlight')}</span>
          </h2>
          <p className="section-subtitle">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 gap-6"
        >
          {testimonials.map((item) => (
            <motion.div
              key={item.name}
              variants={cardVariants}
              className="glass-card-premium p-6 md:p-8 relative group"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-icc-500/10" />
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < item.rating ? 'text-gold-400 fill-gold-400' : 'text-white/10'}`}
                  />
                ))}
              </div>
              <p className="text-sm md:text-base text-white/70 leading-relaxed mb-6 relative z-10">
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-icc-500 to-icc-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-icc-500/20">
                  {item.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-white/40">{item.country}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
