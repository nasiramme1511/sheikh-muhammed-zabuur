import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play, Headphones, ChevronRight, Video,
  BookOpen, Award, CheckCircle, Heart, Sparkles,
  Clock, Send, MessageCircle, Radio, MapPin, Share2, QrCode,
  BookMarked, Star, TrendingUp, Users, Layers,
} from 'lucide-react';
import { series as seriesApi, live as liveApi, resources } from '../lib/api';
import { useTranslation } from '../i18n';
import ResponsiveScholarImage from '../components/ResponsiveScholarImage';
import { useAppearance } from '../context/AppearanceContext';
import { useSEO } from '../seo/metadata';
import SeriesCard from '../components/sections/SeriesCard';
import HeroSection from '../components/sections/HeroSection';
import QrCodeShare from '../components/QrCodeShare';

interface LiveState {
  isActive: boolean;
  title: string;
  url: string;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Home() {
  const { t } = useTranslation();
  const { settings } = useAppearance();
  const [liveState, setLiveState] = useState<LiveState>({ isActive: false, title: '', url: '' });
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [audioList, setAudioList] = useState<any[]>([]);
  const [videoList, setVideoList] = useState<any[]>([]);
  const [showQr, setShowQr] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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
    liveApi.getCurrent().then(res => {
      if (res.data) setLiveState({ isActive: !!res.data.isActive, title: res.data.title || '', url: res.data.url || '' });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    seriesApi.getAll().then(res => {
      setSeriesList(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    resources.getAll({ resourceType: 'AUDIO', limit: 4 })
      .then(res => setAudioList(res.data?.items || res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    resources.getAll({ resourceType: 'VIDEO', limit: 4 })
      .then(res => setVideoList(res.data?.items || res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  const QUICK_ACTIONS = [
    { icon: Radio, label: 'Watch Live', href: '/live', color: 'from-red-500 to-red-600', shadow: 'shadow-red-500/20' },
    { icon: Headphones, label: 'Audio Library', href: '/audio', color: 'from-icc-500 to-icc-600', shadow: 'shadow-icc-500/20' },
    { icon: Video, label: 'Video Library', href: '/videos', color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20' },
    { icon: BookOpen, label: 'Study Series', href: '/series', color: 'from-gold-500 to-amber-600', shadow: 'shadow-gold-500/20' },
    { icon: MapPin, label: 'Visit Location', href: null, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20', onClick: () => window.open('https://maps.app.goo.gl/ehUvnR3LAsLNov3A7?g_st=ac', '_blank') },
    { icon: Share2, label: 'Share App', href: null, color: 'from-sky-500 to-sky-600', shadow: 'shadow-sky-500/20', onClick: () => { if (navigator.share) { navigator.share({ title: 'Sheikh Mohammed Zabuur', url: window.location.origin }).catch(() => {}); } else { navigator.clipboard.writeText(window.location.origin); } } },
    { icon: QrCode, label: 'Scan QR Code', href: null, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20', onClick: () => setShowQr(true) },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <HeroSection />

      {/* ── QUICK ACTION CARDS ── */}
      <section className="relative z-10 py-10 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {action.href ? (
                  <Link
                    to={action.href}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white ${action.shadow} hover:shadow-lg hover:scale-[1.02] transition-all`}
                  >
                    <action.icon className="w-6 h-6" />
                    <span className="text-[10px] font-bold text-center leading-tight">{action.label}</span>
                  </Link>
                ) : (
                  <button
                    onClick={action.onClick}
                    className={`w-full flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white ${action.shadow} hover:shadow-lg hover:scale-[1.02] transition-all`}
                  >
                    <action.icon className="w-6 h-6" />
                    <span className="text-[10px] font-bold text-center leading-tight">{action.label}</span>
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
        {showQr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowQr(false)}>
            <div onClick={e => e.stopPropagation()}>
              <QrCodeShare url={window.location.origin} title="Sheikh Mohammed Zabuur Platform" onClose={() => setShowQr(false)} />
            </div>
          </div>
        )}
      </section>

      {/* ── AUDIO LIBRARY PREVIEW ── */}
      <section className="relative z-10 py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-semibold text-icc-400 uppercase tracking-wider">{t('home.section_audio_badge')}</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">{t('home.latest_audio')}</h2>
              <p className="text-white/40 text-sm mt-1">{t('home.latest_audio_desc')}</p>
            </div>
            <Link to="/audio" className="hidden sm:flex items-center gap-1 text-sm text-icc-400 hover:text-icc-300 transition-colors font-medium">
              {t('nav.view_all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
          {audioList.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">{t('home.no_audio')}</p>
          ) : (
            <motion.div variants={containerVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {audioList.map((item: any, i: number) => (
                <motion.div key={item.id || i} variants={itemVariants}>
                  <Link
                    to={item.url || '#'}
                    className="glass-premium block rounded-2xl p-5 border border-white/5 hover:border-icc-500/30 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-icc-500/10 border border-icc-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Headphones className="w-5 h-5 text-icc-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-icc-400 transition-colors line-clamp-2 mb-2">
                      {item.title || item.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      {item.category && (
                        <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                          {item.category}
                        </span>
                      )}
                      {item.duration ? (
                        <span className="flex items-center gap-1 text-[10px] text-white/40">
                          <Clock className="w-3 h-3" />
                          {formatDuration(item.duration)}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-icc-400 font-medium group-hover:gap-2.5 transition-all">
                        <Play className="w-3 h-3" /> {t('home.listen')}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
          <div className="mt-6 text-center sm:hidden">
            <Link to="/audio" className="btn-outline text-xs py-2 px-4">{t('nav.view_all')}</Link>
          </div>
        </div>
      </section>

      {/* ── VIDEO LIBRARY PREVIEW ── */}
      <section className="relative z-10 py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-semibold text-icc-400 uppercase tracking-wider">{t('home.section_video_badge')}</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">{t('home.latest_video')}</h2>
              <p className="text-white/40 text-sm mt-1">{t('home.latest_video_desc')}</p>
            </div>
            <Link to="/videos" className="hidden sm:flex items-center gap-1 text-sm text-icc-400 hover:text-icc-300 transition-colors font-medium">
              {t('nav.view_all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
          {videoList.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">{t('home.no_video')}</p>
          ) : (
            <motion.div variants={containerVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {videoList.map((item: any, i: number) => (
                <motion.div key={item.id || i} variants={itemVariants}>
                  <Link
                    to={item.url || '#'}
                    className="glass-premium block rounded-2xl overflow-hidden border border-white/5 hover:border-icc-500/30 transition-all duration-300 group"
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-icc-500/10 to-icc-600/5 flex items-center justify-center overflow-hidden">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title || item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Video className="w-10 h-10 text-icc-400/40" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-icc-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 shadow-lg shadow-icc-500/20">
                          <Play className="w-5 h-5 ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-white group-hover:text-icc-400 transition-colors line-clamp-2 mb-2">
                        {item.title || item.name}
                      </h3>
                      {item.category && (
                        <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
          <div className="mt-6 text-center sm:hidden">
            <Link to="/videos" className="btn-outline text-xs py-2 px-4">{t('nav.view_all')}</Link>
          </div>
        </div>
      </section>

      {/* ── STATS COUNTER ── */}
      <section className="relative z-10 py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-icc-500/5 via-transparent to-gold-500/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BookMarked, label: 'Structured Series', value: seriesList.length || '12+' },
              { icon: Headphones, label: 'Audio Lessons', value: `${audioList.length * 5}+` },
              { icon: Users, label: 'Active Students', value: '1,000+' },
              { icon: Star, label: 'Years Teaching', value: '15+' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-premium p-6 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-icc-500/20 to-gold-500/10 border border-icc-500/20 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-icc-400" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-white/50">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STUDY SERIES ── */}
      <section className="relative z-10 py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-semibold text-icc-400 uppercase tracking-wider">{t('home.series_badge')}</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">{t('home.series_title')}</h2>
              <p className="text-white/40 text-sm mt-1">{t('home.series_desc')}</p>
            </div>
            <Link to="/series" className="hidden sm:flex items-center gap-1 text-sm text-icc-400 hover:text-icc-300 transition-colors font-medium">
              {t('nav.view_all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div variants={containerVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {seriesList.slice(0, 8).map((item: any, i: number) => (
              <motion.div key={item.slug || i} variants={itemVariants}>
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
          </motion.div>
          <div className="mt-6 text-center sm:hidden">
            <Link to="/series" className="btn-outline text-xs py-2 px-4">{t('nav.view_all')}</Link>
          </div>
        </div>
      </section>

      {/* ── LIVE STREAM STATUS ── */}
      {liveState.isActive && (
        <section className="relative z-10 py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-icc-500/5 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            <motion.div variants={itemVariants} className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                {t('home.live_now_badge')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{t('home.live_learning_title')}</h2>
              <p className="text-white/50 max-w-xl mx-auto">{t('home.live_learning_desc')}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-premium p-6 max-w-3xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{liveState.title || t('home.video_stream_title')}</h3>
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
                  <iframe src={liveState.url} className="w-full h-full" allowFullScreen title={liveState.title || t('home.video_stream_title')} />
                ) : (
                  <div className="text-center">
                    <Play className="w-10 h-10 text-white/20 mx-auto mb-2" />
                    <p className="text-xs text-white/30">{t('home.stream_offline')}</p>
                  </div>
                )}
              </div>
              <Link to="/live" className="btn-gold w-full text-center text-xs py-2.5">
                {t('home.join_stream')}
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── ABOUT SHEIKH ── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-8 items-center">
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

      {/* ── FEATURES GRID ── */}
      <section className="relative z-10 py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <span className="text-xs font-semibold text-icc-400 uppercase tracking-wider">Platform Features</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">Everything You Need</h2>
            <p className="text-white/40 text-sm mt-2 max-w-2xl mx-auto">
              A complete Islamic learning platform designed for authentic knowledge acquisition
            </p>
          </motion.div>
          <motion.div variants={containerVariants} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Headphones, title: 'Audio Lectures', desc: 'High-quality audio lessons covering Aqeedah, Tafsir, Hadith, Fiqh and more.', color: 'from-icc-500 to-icc-600' },
              { icon: Video, title: 'Video Lessons', desc: 'Watch recorded video lectures and live stream broadcasts.', color: 'from-purple-500 to-purple-600' },
              { icon: BookOpen, title: 'Structured Series', desc: 'Follow organized study circles with progressive learning paths.', color: 'from-gold-500 to-amber-600' },
              { icon: Layers, title: 'Resource Library', desc: 'Access PDF books, documents, and supplementary materials.', color: 'from-cyan-500 to-cyan-600' },
              { icon: TrendingUp, title: 'Track Progress', desc: 'Bookmark lessons, track your learning journey and downloads.', color: 'from-emerald-500 to-emerald-600' },
              { icon: MessageCircle, title: 'Community', desc: 'Join Telegram channels for updates, reminders, and discussions.', color: 'from-sky-500 to-sky-600' },
            ].map((feature, i) => (
              <motion.div key={feature.title} variants={itemVariants} className="glass-premium p-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} bg-opacity-20 border border-white/10 flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TELEGRAM / CONTACT CTA ── */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-icc-500/5 via-transparent to-gold-500/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 mb-4">
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider">Stay Connected</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">Community</span>
            </h2>
            <p className="text-white/50 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
              Stay updated with new lessons, live streams, and Islamic reminders. Follow Sheikh Mohammed Zabuur on Telegram and reach out for more information.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://t.me/sheikhmohammedzabuur"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold px-6 py-3 text-sm font-bold inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {t('footer.join_telegram')}
              </a>
              <Link
                to="/contact"
                className="btn-outline px-6 py-3 text-sm font-bold inline-flex items-center gap-2 border-white/10 hover:border-icc-500/40"
              >
                <MessageCircle className="w-4 h-4" />
                {t('footer.contact_us')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
