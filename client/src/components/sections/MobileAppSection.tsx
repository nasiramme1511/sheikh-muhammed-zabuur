import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Smartphone, Download, CheckCircle, Star, Play, BookOpen, Headphones } from 'lucide-react';
import { useTranslation, type TranslationKey } from '../../i18n';

export default function MobileAppSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    'feature_offline',
    'feature_audio',
    'feature_progress',
    'feature_bookmarks',
    'feature_reminders',
    'feature_languages',
  ];

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 opacity-20">
        <div className="w-full h-full rounded-full bg-icc-500 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 mb-4">
              <Smartphone className="w-3.5 h-3.5 text-icc-400" />
              <span className="text-xs font-medium text-icc-300">{t('mobile_app.badge')}</span>
            </div>
            <h2 className="section-title text-left">
              {t('mobile_app.title')} <span className="text-gradient-icc">{t('mobile_app.title_highlight')}</span>
            </h2>
            <p className="text-white/60 mb-8 leading-relaxed">
              {t('mobile_app.description')}
            </p>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400" />
                ))}
              </div>
              <span className="text-sm text-white/40">{t('mobile_app.rating')}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((f) => (
                <motion.div
                  key={f}
                  className="flex items-center gap-2 text-sm text-white/60"
                  whileHover={{ x: 3 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <CheckCircle className="w-4 h-4 text-icc-400 flex-shrink-0" />
                  {t(('mobile_app.' + f) as TranslationKey)}
                </motion.div>
              ))}
            </div>

            <motion.a
              href="#"
              className="btn-icc inline-flex items-center gap-3 px-8 py-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => e.preventDefault()}
            >
              <Download className="w-5 h-5" />
              <div className="text-left">
                <div className="text-[10px] opacity-80 font-normal">{t('mobile_app.download_on')}</div>
                <div className="text-base font-semibold -mt-0.5">{t('mobile_app.google_play')}</div>
              </div>
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative flex justify-center"
          >
            <motion.div
              className="relative w-64 h-[520px]"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-dark-800 to-dark-900 border border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-dark-900 rounded-b-xl z-10" />

                <div className="p-4 pt-8 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <img src="/favicon.svg" alt="ICC" className="w-6 h-6 rounded-full" />
                    <span className="text-xs font-semibold text-white">{t('app.title')}</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="glass rounded-xl p-3 flex items-center gap-3"
                        whileHover={{ scale: 1.02, x: 3 }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-icc-500/20 flex items-center justify-center text-lg">
                          {['📖', '🎙️', '📚', '🤲'][i - 1]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white truncate">
                            {['Tafsir Al-Fatihah', 'Tajweed Rules', 'Hadith Basics', 'Daily Dua'][i - 1]}
                          </div>
                          <div className="text-[10px] text-white/40">
                            {['15 min', '20 min', '12 min', '8 min'][i - 1]}
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-full border-2 border-icc-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-icc-500" />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="glass rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">Your Progress</div>
                        <div className="text-[10px] text-white/40">65% complete</div>
                      </div>
                      <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className="w-[65%] h-full rounded-full bg-gradient-to-r from-icc-500 to-gold-500"
                          animate={{ width: ['65%', '70%', '65%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -inset-1 rounded-[2.7rem] bg-gradient-to-b from-icc-500/20 to-transparent -z-10 blur-sm" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
