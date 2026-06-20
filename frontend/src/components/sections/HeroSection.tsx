import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Radio, BookOpen, Send, Info, ExternalLink } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAppearance } from '../../context/AppearanceContext';
import ResponsiveScholarImage from '../ResponsiveScholarImage';

export default function HeroSection() {
  const { t } = useTranslation();
  const { settings } = useAppearance();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${settings.backgroundImage}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950/80 via-surface-950/60 to-surface-950/95" />
      </div>

      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[90vh] py-20 lg:py-0">
            {/* Left Side - Scholar Photo */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-icc-500 to-gold-500 opacity-20 blur-xl" />
                <div className="relative rounded-3xl overflow-hidden border border-icc-500/20 bg-surface-900/80">
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/40 to-transparent z-10" />
                  <ResponsiveScholarImage
                    src="/images/sheikh-zabuur.jpg"
                    alt="Sheikh Mohammed Zabuur"
                    className="w-full h-[400px] lg:h-[500px] object-cover"
                  />

                  {/* Live Status Indicator */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-4 left-4 z-20"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      {t('hero.live_status')}
                    </div>
                  </motion.div>

                  {/* Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                    <h2 className="text-xl font-bold text-white mb-1">
                      {t('hero.sheikh_name')}
                    </h2>
                    <p className="text-sm text-gold-400">
                      {t('hero.sheikh_title')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Side - Headline & Buttons */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 lg:space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span className="text-xs font-semibold text-gold-300 uppercase tracking-wider">
                    {t('hero.badge')}
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                    <span className="animated-gradient-text">{t('hero.title_line1')}</span>
                    <br />
                    <span className="text-white">{t('hero.title_line2')}</span>
                  </h1>

                  <p className="text-lg lg:text-xl text-white/60 max-w-2xl leading-relaxed">
                    {t('hero.subtitle')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/series"
                    className="btn-icc px-5 py-3 text-sm font-bold inline-flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Series
                  </Link>
                  <Link
                    to="/live"
                    className="btn-gold px-5 py-3 text-sm font-bold inline-flex items-center gap-2"
                  >
                    <Radio className="w-4 h-4" />
                    Live
                  </Link>
                  <Link
                    to="/contact"
                    className="btn-outline px-5 py-3 text-sm font-bold inline-flex items-center gap-2 border-white/10 hover:border-icc-500/40"
                  >
                    <Send className="w-4 h-4" />
                    Contact
                  </Link>
                  <Link
                    to="/about"
                    className="btn-outline px-5 py-3 text-sm font-bold inline-flex items-center gap-2 border-white/10 hover:border-icc-500/40"
                  >
                    <Info className="w-4 h-4" />
                    About
                  </Link>
                  <a
                    href="https://t.me/sheikhmohammedzabuur"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline px-5 py-3 text-sm font-bold inline-flex items-center gap-2 border-white/10 hover:border-icc-500/40"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Telegram
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
          <motion.div
            className="w-1.5 h-3 rounded-full bg-white/40"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
