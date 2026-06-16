import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, BookOpen, Globe, Award } from 'lucide-react';
import { useTranslation } from '../../i18n';
import type { TranslationKey } from '../../i18n';
import { statsData } from '../../config/site';

/** Icons mapped by index to match statsData ordering */
const STAT_ICONS = [Users, BookOpen, Globe, Award];

function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-bold text-white">
      {prefix}{count}{suffix}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function StatsSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-icc-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {statsData.map((stat, i) => {
            const Icon = STAT_ICONS[i] || Users;
            return (
              <motion.div
                key={stat.labelKey}
                variants={itemVariants}
                className="glass-card-premium p-6 md:p-8 text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-icc-500/20 to-icc-600/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Icon className="w-7 h-7 text-icc-400" />
                </div>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <div className="text-sm font-semibold text-white mt-1">{t(stat.labelKey as TranslationKey)}</div>
                <div className="text-xs text-white/40 mt-1">{t(stat.descKey as TranslationKey)}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
