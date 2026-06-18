import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Sparkles, Quote } from 'lucide-react';
import { useTranslation } from '../../i18n';

const reminders = [
  {
    arabic: 'إِنَّ اللَّهَ لَا يَغْفِرُ أَنْ يُشْرَكَ بِهِ وَيَغْفِرُ مَا دُونَ ذَٰلِكَ لِمَنْ يَشَاءُ',
    translation: 'Indeed, Allah does not forgive association with Him, but He forgives what is less than that for whom He wills.',
    source: "Surah An-Nisa 4:48",
    type: 'Quran',
  },
  {
    arabic: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنْسَ إِلَّا لِيَعْبُدُونِ',
    translation: 'And I did not create the jinn and mankind except to worship Me.',
    source: "Surah Adh-Dhariyat 51:56",
    type: 'Quran',
  },
  {
    arabic: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    translation: 'Whoever takes a path in search of knowledge, Allah will make easy for him a path to Paradise.',
    source: "Sahih Muslim",
    type: 'Hadith',
  },
  {
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    translation: 'My Lord, increase me in knowledge.',
    source: "Surah Ta-Ha 20:114",
    type: 'Quran',
  },
  {
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    translation: 'The best of you are those who learn the Quran and teach it.',
    source: "Sahih al-Bukhari",
    type: 'Hadith',
  },
];

export default function DailyReminder() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reminders.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const reminder = reminders[current];

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />

      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-icc-500/5 blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gold-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-icc-400" />
            <span className="text-xs font-medium text-icc-300">{t('daily_reminder.title')}</span>
          </div>
          <h2 className="section-title">
            <span className="text-gradient-icc">{t('daily_reminder.subtitle')}</span>
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-icc-500/50 to-transparent" />
            <Quote className="absolute top-6 left-6 w-8 h-8 text-icc-500/20" />
            <Quote className="absolute bottom-6 right-6 w-8 h-8 text-icc-500/20 rotate-180" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
                style={{
                  background: reminder.type === 'Quran' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: reminder.type === 'Quran' ? '#0EA5E9' : '#F59E0B',
                  border: `1px solid ${reminder.type === 'Quran' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                }}
              >
                {reminder.type === 'Quran' ? '📖' : '📜'} {reminder.type}
              </div>

              <p className="font-amiri text-2xl md:text-3xl lg:text-4xl text-white/90 leading-relaxed mb-8" dir="rtl">
                {reminder.arabic}
              </p>

              <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent mx-auto mb-8" />

              <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto mb-6">
                "{reminder.translation}"
              </p>

              <p className="text-sm text-icc-400 font-medium">
                — {reminder.source}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-2 mt-6">
          {reminders.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'bg-icc-500 w-6'
                  : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
