import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Headphones, Video, FileText, Radio } from 'lucide-react';
import { useTranslation, type TranslationKey } from '../../i18n';
import { heroStats } from '../../config/site';
import { useAppearance } from '../../context/AppearanceContext';

const floatingShapes = [
  { size: 60, top: '15%', left: '10%', delay: 0, duration: 6, icon: '✨' },
  { size: 40, top: '25%', right: '15%', delay: 1, duration: 7, icon: '🕌' },
  { size: 50, top: '60%', left: '5%', delay: 2, duration: 8, icon: '☪' },
  { size: 35, top: '70%', right: '10%', delay: 0.5, duration: 5.5, icon: '📖' },
  { size: 45, top: '40%', left: '15%', delay: 3, duration: 9, icon: '🌙' },
  { size: 30, top: '80%', left: '25%', delay: 1.5, duration: 7.5, icon: '⭐' },
  { size: 55, top: '20%', left: '80%', delay: 2.5, duration: 6.5, icon: '🔮' },
  { size: 25, top: '50%', right: '5%', delay: 4, duration: 8.5, icon: '💫' },
];

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 5}s`,
  duration: `${10 + Math.random() * 15}s`,
  size: `${2 + Math.random() * 4}px`,
  opacity: `${0.1 + Math.random() * 0.3}`,
}));

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function HeroSection() {
  const { t } = useTranslation();
  const { settings } = useAppearance();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const ctaButtons = [
    { to: '/audio', icon: Headphones, label: t('hero.listen_audio') },
    { to: '/videos', icon: Video, label: t('hero.watch_videos') },
    { to: '/pdfs', icon: FileText, label: t('hero.read_pdfs') },
    { to: '/live', icon: Radio, label: t('hero.join_live') },
  ];

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div className="absolute inset-0 z-0" style={{ y: backgroundY, scale }}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${settings.backgroundImage}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/70 via-emerald-950/50 to-dark-900/90" />
      </motion.div>

      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bottom-0 rounded-full"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              background: 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-[1] pointer-events-none">
        {floatingShapes.map((shape, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl"
            style={{ top: shape.top, left: (shape as any).left, right: (shape as any).right }}
            animate={{ y: [0, -20, 0, 12, 0], rotate: [0, 8, -8, 5, 0], opacity: [0.2, 0.4, 0.2, 0.3, 0.2] }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              delay: shape.delay,
              ease: 'easeInOut',
            }}
          >
            {shape.icon}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-icc-500/10 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-gold-500/5 blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/3 blur-[180px]" />
      </motion.div>

      <motion.div className="relative z-10 max-w-6xl mx-auto px-4 text-center" style={{ opacity, y: textY }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
          }}
          className="flex flex-col items-center"
        >
          <motion.div variants={fadeInUp} transition={{ duration: 0.8 }} className="mb-6">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-gold-500/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="text-xs font-medium text-gold-300 tracking-wider uppercase">{t('hero.badge')}</span>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeInUp} transition={{ duration: 0.8 }} className="mb-4">
            <div className="inline-flex items-center gap-4 mb-6">
              <motion.div
                className="h-px w-16 bg-gradient-to-r from-transparent to-icc-500"
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ delay: 1, duration: 0.8 }}
              />
              <motion.span
                className="font-amiri text-lg text-icc-300"
                dir="rtl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </motion.span>
              <motion.div
                className="h-px w-16 bg-gradient-to-l from-transparent to-icc-500"
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ delay: 1, duration: 0.8 }}
              />
            </div>
          </motion.div>

          <motion.h1 variants={fadeInUp} transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 tracking-tight"
          >
            <span className="animated-gradient-text">{t('hero.title_line1')}</span>
            <br /><span className="text-white">{t('hero.title_line2')}</span>
          </motion.h1>

          <motion.p variants={fadeInUp} transition={{ duration: 0.8 }}
            className="text-lg md:text-xl text-gold-400 font-medium mb-6"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div variants={fadeInUp} transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-white/20" />
            <span className="font-cairo text-2xl md:text-3xl text-gold-400/80" dir="rtl">
              {t('hero.arabic_quote')}
            </span>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-white/20" />
          </motion.div>

          <motion.p variants={fadeInUp} transition={{ duration: 0.8 }}
            className="text-base md:text-lg text-white/60 max-w-3xl mx-auto mb-6 leading-relaxed"
          >
            {t('hero.description')}
          </motion.p>

          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.8 }}
            className="mb-8 px-6 py-3 rounded-2xl border border-gold-500/20 bg-emerald-900/30 backdrop-blur-sm inline-block"
          >
            <p className="text-gold-300 font-cairo text-lg md:text-xl" dir="rtl">
              <span className="text-white/60 text-sm">—</span>{' '}
              الشيخ محمد زبور{' '}
              <span className="text-white/60 text-sm">—</span>
            </p>
            <p className="text-gold-400/80 text-xs md:text-sm tracking-widest uppercase mt-0.5">
              Sheikh Mohammed Zabuur
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:flex md:flex-row md:flex-nowrap gap-3 md:gap-4 mb-16 w-full max-w-2xl"
          >
            {ctaButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <Link key={btn.to} to={btn.to} className="w-full md:w-auto">
                  <motion.div
                    className="btn-icc text-sm md:text-base px-4 md:px-6 py-3 md:py-4 cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-5 md:w-5 md:h-5" /> {btn.label}
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>

          <motion.div variants={fadeInUp} transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-3xl"
          >
            {heroStats.map((stat, i) => (
              <motion.div
                key={stat.key}
                className="glass rounded-2xl p-4 text-center hover:bg-white/10 transition-all duration-300"
                whileHover={{ y: -4, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.1, duration: 0.5 }}
              >
                <span className="text-2xl mb-1 block">{stat.icon}</span>
                <div className="text-xl md:text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                <div className="text-xs text-white/50">{t(stat.key as TranslationKey)}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
          <motion.div
            className="w-1.5 h-3 rounded-full bg-white/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
