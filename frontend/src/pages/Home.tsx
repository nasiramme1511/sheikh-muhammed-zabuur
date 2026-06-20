import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Radio, Headphones, ChevronRight, Video,
  BookOpen, Award, CheckCircle, Heart, Sparkles,
} from 'lucide-react';
import { series as seriesApi, live as liveApi } from '../lib/api';
import { useTranslation } from '../i18n';
import ResponsiveScholarImage from '../components/ResponsiveScholarImage';
import { useAppearance } from '../context/AppearanceContext';
import { useSEO } from '../seo/metadata';
import SeriesCard from '../components/sections/SeriesCard';
import HeroSection from '../components/sections/HeroSection';

interface LiveState {
  isActive: boolean;
  title: string;
  url: string;
}

export default function Home() {
  const { t } = useTranslation();
  const { settings } = useAppearance();
  const [liveState, setLiveState] = useState<LiveState>({ isActive: false, title: '', url: '' });
  const [seriesList, setSeriesList] = useState<any[]>([]);

  useSEO({
    title: 'Home',
    description: 'Sheikh Mohammed Zabuur — Islamic Digital Archive & Learning Platform',
    canonical: '/',
    structuredData: {
      '@type': 'WebSite',
      name: 'Sheikh Mohammed Zabuur',
      url: 'https://sheikhmohammedzabuur.com',
      description: 'Study Islamic knowledge through structured series by Sheikh Mohammed Zabuur.',
    },
  });

  useEffect(() => {
    liveApi.get().then(res => {
      if (res.data) setLiveState({ isActive: !!res.data.isActive, title: res.data.title || '', url: res.data.url || '' });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    seriesApi.getAll().then(res => {
      setSeriesList(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {});
  }, []);

  return (
    <div>
      <HeroSection />

      {/* ── STUDY SERIES ── */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <span className="text-xs font-semibold text-icc-400 uppercase tracking-wider">{t('home.series_badge')}</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">{t('home.series_title')}</h2>
              <p className="text-white/40 text-sm mt-1">{t('home.series_desc')}</p>
            </div>
            <Link to="/series" className="hidden sm:flex items-center gap-1 text-sm text-icc-400 hover:text-icc-300 transition-colors font-medium">
              {t('nav.view_all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {seriesList.slice(0, 8).map((item: any, i: number) => (
              <motion.div
                key={item.slug || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <SeriesCard
                  name={item.name}
                  nameAmharic={item.nameAmharic}
                  nameArabic={item.nameArabic}
                  nameOromic={item.nameOromic}
                  slug={item.slug}
                  description={item.description}
                  image={item.image}
                  icon={item.icon}
                  color={item.color}
                  totalLessons={item.totalLessons}
                  totalDuration={item.totalDuration}
                  latestLesson={item.latestLesson}
                />
              </motion.div>
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link to="/series" className="btn-outline text-xs py-2 px-4">{t('nav.view_all')}</Link>
          </div>
        </div>
      </section>



      {/* ── LIVE DARS ── */}
      {liveState.isActive && (
        <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-icc-500/5 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <Radio className="w-3.5 h-3.5" />
                {t('home.live_now_badge')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{t('home.live_learning_title')}</h2>
              <p className="text-white/50 max-w-xl mx-auto">{t('home.live_learning_desc')}</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-premium p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{t('home.video_stream_title')}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      <span className="text-[10px] text-red-400 font-semibold">LIVE</span>
                    </div>
                  </div>
                </div>
                <div className="aspect-video rounded-xl bg-surface-900 border border-white/5 flex items-center justify-center mb-4 overflow-hidden">
                  {liveState.url ? (
                    <iframe src={liveState.url} className="w-full h-full" allowFullScreen title={t('home.video_stream_title')} />
                  ) : (
                    <div className="text-center">
                      <Radio className="w-10 h-10 text-white/20 mx-auto mb-2" />
                      <p className="text-xs text-white/30">{t('home.stream_offline')}</p>
                    </div>
                  )}
                </div>
                <Link to="/live" className="btn-icc w-full text-center text-xs py-2.5">
                  {t('home.join_stream')}
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass-premium p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-icc-500/50" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-icc-500/15 text-icc-400 flex items-center justify-center">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{t('home.audio_stream_title')}</h3>
                    <p className="text-[10px] text-white/40 mt-1">{t('home.listen_live')}</p>
                  </div>
                </div>
                <div className="rounded-xl bg-surface-900 border border-white/5 p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [8, 20, 8] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                          className="w-1 bg-icc-400 rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-white/40">{t('home.audio_broadcast')}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-icc-500 rounded-full"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                </div>
                <Link to="/recordings" className="btn-outline w-full text-center text-xs py-2.5">
                  {t('home.browse_recordings')}
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ── ABOUT SHEIKH ── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-8 items-center"
          >
            <div>
              <span className="text-xs font-semibold text-icc-400 uppercase tracking-wider mb-2 block">{t('home.about_sheikh')}</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t('home.scholar_name')}</h2>
              <blockquote className="border-l-2 border-icc-500 pl-4 mb-4">
                <p className="text-white/60 text-sm leading-relaxed italic">"{t('home.hero_desc_alt')}"</p>
              </blockquote>
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { icon: Award, value: t('home.stat_daily_lessons'), color: 'text-icc-400' },
                  { icon: CheckCircle, value: t('home.stat_authentic'), color: 'text-green-400' },
                  { icon: Heart, value: t('home.stat_free_access'), color: 'text-gold-400' },
                  { icon: Sparkles, value: t('home.stat_structured'), color: 'text-purple-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-white/50 bg-white/5 rounded-lg px-3 py-1.5">
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn-icc text-sm px-5 py-2.5 inline-flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> {t('home.read_biography')}
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-icc-500 to-gold-500 opacity-20 blur-xl" />
              <div className="relative rounded-2xl overflow-hidden border border-white/10">
                <ResponsiveScholarImage
                  src="/images/sheikh-zabuur.jpg"
                  alt={t('home.scholar_name')}
                  className="w-full h-[350px] object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
