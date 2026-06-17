import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Music, Video, FileText, Radio, Tv, ArrowRight,
  Play, Download, Eye, Sparkles, BookOpen, ChevronRight,
  Star, ScrollText, UserRound, Heart, Library,
  Quote, Headphones, Clock, Globe, Monitor, CheckCircle,
  Moon, Sun, Users, Award,
} from 'lucide-react';
import { resources as resourcesApi, collections as collectionsApi, live as liveApi } from '../lib/api';
import { COLLECTIONS, COLLECTION_COLORS, getCollectionBySlug } from '../config/collections';
import type { Resource } from '../types';
import { useTranslation } from '../i18n';
import { useAppearance } from '../context/AppearanceContext';
import { useSEO } from '../seo/metadata';
import TelegramSection from '../components/sections/TelegramSection';
import PrayerTimesWidget from '../components/PrayerTimesWidget';

interface LiveState {
  isActive: boolean;
  title: string;
  url: string;
}

interface ResourceStats {
  audio: number;
  video: number;
  pdf: number;
  image: number;
  total: number;
}

const CATEGORIES = [
  'Aqeedah', 'Hadith', 'Tafsir', 'Fiqh', 'Seerah', 'Tajweed',
  'Arabic', 'Usul', 'Manhaj', 'Adab', 'Khutbah', 'Ramadan',
  'Questions & Answers', 'General',
];

const CAT_COLORS: Record<string, string> = {
  Aqeedah: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Hadith: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Tafsir: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Fiqh: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Seerah: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Tajweed: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  Arabic: 'bg-red-500/10 text-red-400 border-red-500/20',
  Usul: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Manhaj: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Adab: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Khutbah: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Ramadan: 'bg-emerald-600/10 text-emerald-300 border-emerald-600/20',
  'Questions & Answers': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  General: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const TRACKS = [
  { name: 'Aqeedah', icon: '⭐', desc: 'Islamic Creed & Theology', color: 'from-emerald-500 to-emerald-700' },
  { name: 'Tafsir', icon: '📜', desc: 'Quranic Exegesis', color: 'from-purple-500 to-purple-700' },
  { name: 'Hadith', icon: '📖', desc: 'Prophetic Traditions', color: 'from-blue-500 to-blue-700' },
  { name: 'Fiqh', icon: '⚖️', desc: 'Islamic Jurisprudence', color: 'from-orange-500 to-orange-700' },
  { name: 'Seerah', icon: '🕌', desc: 'Prophetic Biography', color: 'from-yellow-500 to-yellow-700' },
  { name: 'Tajweed', icon: '🎵', desc: 'Quranic Recitation', color: 'from-teal-500 to-teal-700' },
  { name: 'Arabic', icon: '📝', desc: 'Arabic Language', color: 'from-red-500 to-red-700' },
  { name: 'Manhaj', icon: '🗺️', desc: 'Islamic Methodology', color: 'from-cyan-500 to-cyan-700' },
];

const TRUST_FEATURES = [
  { icon: ScrollText, label: 'Authentic Sources', desc: 'All content verified from Quran & Sunnah' },
  { icon: UserRound, label: 'Qualified Teaching', desc: 'Taught by Sheikh Mohammed Zabuur' },
  { icon: Monitor, label: 'Live Learning', desc: 'Real-time interactive sessions' },
  { icon: BookOpen, label: 'Structured Curriculum', desc: 'Step-by-step learning paths' },
];

const TESTIMONIALS = [
  { name: 'Aisha Mohamed', country: 'Ethiopia', text: 'This platform has completely transformed my understanding of Islam. The structured courses and authentic teachers make learning so easy and enjoyable.' },
  { name: 'Ahmed Hassan', country: 'Somalia', text: 'Finally, a platform that provides authentic Islamic knowledge in multiple languages. The audio lessons are perfect for learning on the go.' },
  { name: 'Fatima Ali', country: 'Kenya', text: 'I started as a complete beginner and now I can recite Quran with proper Tajweed. The teachers are patient and knowledgeable.' },
  { name: 'Omar Abdirahman', country: 'USA', text: 'The level system is brilliant. It guides you step by step from basics to advanced topics.' },
];

function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return count;
}

function CounterStat({ value, label, icon: Icon, suffix = '' }: { value: number; label: string; icon: any; suffix?: string }) {
  const count = useCounter(value);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{count}{suffix}</div>
      <div className="text-xs text-white/50 tracking-wider uppercase">{label}</div>
    </motion.div>
  );
}

function SkeletonCard({ wide = false }: { wide?: boolean }) {
  return (
    <div className={`animate-pulse rounded-3xl bg-white/5 border border-white/5 p-5 ${wide ? 'h-40' : 'h-52'}`}>
      <div className="flex gap-3 h-full">
        <div className="w-12 h-12 rounded-2xl bg-white/10 shrink-0" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
          <div className="h-3 bg-white/10 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  useSEO({
    title: 'Home',
    description: 'Sheikh Muhammed Zabuur and Iman Chercher College — Authentic Islamic education. Learn Aqeedah, Tafsir, Hadith, Fiqh, Seerah, Tajweed and more from qualified Sunni teachers in English, Arabic, Amharic, and Afaan Oromo.',
    keywords: 'Sheikh Muhammed Zabuur, Iman Chercher College, Islamic learning, online Islamic education, learn Quran, Aqeedah, Tafsir, Hadith, Fiqh, Islamic courses online',
  });

  const { t } = useTranslation();
  const { settings } = useAppearance();
  const [audios, setAudios] = useState<Resource[]>([]);
  const [videos, setVideos] = useState<Resource[]>([]);
  const [pdfs, setPdfs] = useState<Resource[]>([]);
  const [featured, setFeatured] = useState<Resource[]>([]);
  const [liveState, setLiveState] = useState<LiveState>({ isActive: false, title: '', url: '' });
  const [stats, setStats] = useState<ResourceStats>({ audio: 0, video: 0, pdf: 0, image: 0, total: 0 });
  const [collectionStats, setCollectionStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      resourcesApi.getAll({ type: 'AUDIO', limit: 8 }),
      resourcesApi.getAll({ type: 'VIDEO', limit: 8 }),
      resourcesApi.getAll({ type: 'PDF', limit: 8 }),
      resourcesApi.getFeatured(),
      resourcesApi.getStats(),
      collectionsApi.getStats(),
      liveApi.get(),
    ])
      .then(([audioRes, videoRes, pdfRes, featRes, statsRes, colRes, liveRes]) => {
        setAudios(Array.isArray(audioRes.data) ? audioRes.data.slice(0, 8) : []);
        setVideos(Array.isArray(videoRes.data) ? videoRes.data.filter((v: Resource) => v.fileType !== 'recording').slice(0, 8) : []);
        setPdfs(Array.isArray(pdfRes.data) ? pdfRes.data.slice(0, 8) : []);
        setFeatured(Array.isArray(featRes.data) ? featRes.data.slice(0, 8) : []);
        setStats(statsRes.data || { audio: 0, video: 0, pdf: 0, image: 0, total: 0 });
        setCollectionStats(colRes.data || {});
        setLiveState(liveRes.data || { isActive: false, title: '', url: '' });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|v=)([^#&?]{11})/);
    return m ? m[1] : null;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen text-white bg-slate-950 overflow-x-hidden">
      {/* ── HERO ── */}
      <section
        className="relative min-h-[92vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url("${settings.backgroundImage}")`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed',
        }}
      >
        {/* Modern decorative layers */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
        <div className="absolute inset-0 z-0 hero-overlay" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading, description, key actions */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                {liveState.isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-red-500/20 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    onClick={() => window.location.href = '/live'}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    {t('nav.live_now_join')}
                    <ArrowRight className="w-3 h-3" />
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {t('hero.badge')}
                </motion.div>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]"
              >
                <span className="block text-white mb-2">{t('hero.title_line1')}</span>
                <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">{t('hero.title_line2')}</span>
                <span className="block text-2xl font-bold text-white/50 mt-4 tracking-normal">
                  {t('home.platform_name')}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg text-white/60 leading-relaxed max-w-xl"
              >
                {t('home.hero_desc_alt')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-3 pt-2"
              >
                <Link to="/audio" className="btn-icc gap-2 px-6 py-3.5 text-sm font-semibold tracking-wide">
                  <Music className="w-4.5 h-4.5" /> {t('home.listen_to_audio')}
                </Link>
                <Link to="/videos" className="btn-icc gap-2 px-6 py-3.5 text-sm font-semibold tracking-wide bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 shadow-[0_4px_20px_rgba(20,184,166,0.2)]">
                  <Video className="w-4.5 h-4.5" /> {t('home.watch_videos')}
                </Link>
                <Link to="/pdfs" className="btn-outline gap-2 px-6 py-3.5 text-sm font-semibold border-white/10 hover:border-emerald-500/30">
                  <FileText className="w-4.5 h-4.5" /> {t('home.read_pdfs')}
                </Link>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                <CounterStat value={stats.audio} label={t('home.audio_lectures_stat')} icon={Music} />
                <CounterStat value={stats.video} label={t('home.video_classes_stat')} icon={Video} />
                <CounterStat value={stats.pdf} label={t('home.pdf_books_stat')} icon={FileText} />
                <CounterStat value={stats.total} label="Resources" icon={Library} />
              </div>
            </div>

            {/* Right Column: Interactive components & Profile widget */}
            <div className="lg:col-span-5 space-y-6">
              {/* Sheikh Masterclass Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group hidden lg:block rounded-3xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-white/10 glow-icc"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
                <img
                  src="/images/sheikh-zabuur.jpg"
                  alt="Sheikh Mohammed Zabuur"
                  className="w-full h-[340px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Visual accent bubbles */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl group-hover:bg-amber-500/30 transition-all" />

                {/* Verified scholar badge */}
                <div className="absolute top-4 right-4 z-20 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md shadow-emerald-500/20">
                  <CheckCircle className="w-3.5 h-3.5 fill-white text-emerald-500" />
                  VERIFIED SCHOLAR
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <p className="text-white font-extrabold text-xl tracking-wide">Sheikh Mohammed Zabuur</p>
                  <p className="text-emerald-400 font-semibold text-xs mt-0.5 tracking-wider uppercase">Senior Islamic Lecturer</p>
                </div>
              </motion.div>

              {/* Next Prayer dashboard block */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(16,185,129,0.1)] transition-all"
              >
                <PrayerTimesWidget />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST/VALUE PROPOSITION ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/10 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Authentic Islamic Education
            </h2>
            <p className="text-base text-white/50 max-w-xl mx-auto">
              Learn from authentic sources with structured curriculum designed for all levels
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="glass-premium p-6 flex flex-col items-center text-center group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.label}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── LEARNING PATHS ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              Learning Paths
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Featured Learning Tracks
            </h2>
            <p className="text-base text-white/50 max-w-xl mx-auto">
              Choose your path and begin your journey of authentic Islamic knowledge
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRACKS.map((track, idx) => (
              <motion.div
                key={track.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="group relative overflow-hidden rounded-3xl border border-white/5 hover:border-emerald-500/20 bg-slate-900/40 hover:bg-slate-900/80 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-[0_15px_35px_rgba(16,185,129,0.05)]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${track.color} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`} />
                <div className="p-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all duration-500 mb-4">
                    {track.icon}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">{track.name}</h3>
                  <p className="text-xs text-white/40 mt-2 leading-relaxed">{track.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEDIA: LATEST AUDIO LECTURES ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
                <Headphones className="w-3.5 h-3.5" /> AUDIO LECTURE CATALOG
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('home.latest_audio')}</h2>
            </div>
            <Link to="/audio" className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-semibold transition-colors group">
              {t('common.view_all')} 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? [1,2,3,4].map(i => <SkeletonCard key={i} />)
              : audios.length === 0
                ? <p className="text-white/40 text-sm col-span-4 py-12 text-center glass-premium">{t('home.no_audio')}</p>
                : audios.slice(0, 4).map((audio, idx) => (
                    <motion.div
                      key={audio.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="glass-premium p-5 flex flex-col justify-between gap-5 group relative hover:bg-slate-900/50"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <Music className="w-4.5 h-4.5" />
                          </div>
                          <span className="text-[10px] text-white/30 font-medium">
                            {audio.sizeHuman}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-semibold border ${CAT_COLORS[audio.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
                              {audio.category}
                            </span>
                            {audio.collection && (() => {
                              const col = getCollectionBySlug(audio.collection);
                              const colColor = col ? (COLLECTION_COLORS[col.slug] || 'bg-white/5 text-white/50 border-white/10') : 'bg-white/5 text-white/50 border-white/10';
                              return (
                                <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-semibold border ${colColor}`}>
                                  {col?.icon} {col?.name || audio.collection}
                                </span>
                              );
                            })()}
                          </div>

                          <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-emerald-400 transition-colors leading-snug">
                            {audio.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-white/40 mt-2">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{audio.views} views</span>
                        <Link to="/audio" className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold">
                          <Play className="w-3.5 h-3.5" /> {t('home.listen')}
                        </Link>
                      </div>
                    </motion.div>
                  ))
            }
          </div>
        </div>
      </section>

      {/* ── MEDIA: LATEST VIDEOS ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/10 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-3">
                <Video className="w-3.5 h-3.5" /> CLASS VIDEO STREAM
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('home.latest_video')}</h2>
            </div>
            <Link to="/videos" className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-semibold transition-colors group">
              {t('common.view_all')} 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? [1,2,3,4].map(i => <SkeletonCard key={i} />)
              : videos.length === 0
                ? <p className="text-white/40 text-sm col-span-4 py-12 text-center glass-premium">{t('home.no_video')}</p>
                : videos.slice(0, 4).map((video, idx) => {
                    const ytId = getYoutubeId(video.url);
                    return (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="glass-premium overflow-hidden group hover:bg-slate-900/50 flex flex-col justify-between"
                      >
                        <div>
                          <div className="aspect-video bg-slate-950 relative overflow-hidden">
                            {ytId ? (
                              <img
                                src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={e => (e.target as HTMLImageElement).src = '/video-placeholder.jpg'}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="w-8 h-8 text-purple-400/40" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Play className="w-5 h-5 text-white pl-0.5" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-5 space-y-3">
                            <div className="flex flex-wrap gap-1.5">
                              <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-semibold border ${CAT_COLORS[video.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
                                {video.category}
                              </span>
                              {video.collection && (() => {
                                const col = getCollectionBySlug(video.collection);
                                const colColor = col ? (COLLECTION_COLORS[col.slug] || 'bg-white/5 text-white/50 border-white/10') : 'bg-white/5 text-white/50 border-white/10';
                                return (
                                  <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-semibold border ${colColor}`}>
                                    {col?.icon} {col?.name || video.collection}
                                  </span>
                                );
                              })()}
                            </div>
                            
                            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                              {video.title}
                            </h3>
                          </div>
                        </div>

                        <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between text-xs text-white/40 mt-3">
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{video.views} views</span>
                          <span className="text-[10px] text-white/30 font-medium">Video</span>
                        </div>
                      </motion.div>
                    );
                  })
            }
          </div>
        </div>
      </section>

      {/* ── MEDIA: LATEST PDFs ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-3">
                <FileText className="w-3.5 h-3.5" /> LITERARY LIBRARY
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('home.pdf_books')}</h2>
            </div>
            <Link to="/pdfs" className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-semibold transition-colors group">
              {t('common.view_all')} 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? [1,2,3,4].map(i => <SkeletonCard key={i} />)
              : pdfs.length === 0
                ? <p className="text-white/40 text-sm col-span-4 py-12 text-center glass-premium">{t('home.no_pdfs')}</p>
                : pdfs.slice(0, 4).map((pdf, idx) => (
                    <motion.div
                      key={pdf.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="glass-premium p-5 flex flex-col justify-between gap-5 group hover:bg-slate-900/50"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
                            <FileText className="w-4.5 h-4.5" />
                          </div>
                          <span className="text-[10px] text-white/30 font-medium">PDF Document</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-semibold border ${CAT_COLORS[pdf.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
                              {pdf.category}
                            </span>
                            {pdf.collection && (() => {
                              const col = getCollectionBySlug(pdf.collection);
                              const colColor = col ? (COLLECTION_COLORS[col.slug] || 'bg-white/5 text-white/50 border-white/10') : 'bg-white/5 text-white/50 border-white/10';
                              return (
                                <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-semibold border ${colColor}`}>
                                  {col?.icon} {col?.name || pdf.collection}
                                </span>
                              );
                            })()}
                          </div>

                          <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors leading-snug">
                            {pdf.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-white/40 mt-2">
                        <span>{pdf.sizeHuman || '—'}</span>
                        <a
                          href={pdf.url}
                          download
                          className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-bold"
                        >
                          <Download className="w-3.5 h-3.5" /> {t('home.download')}
                        </a>
                      </div>
                    </motion.div>
                  ))
            }
          </div>
        </div>
      </section>

      {/* ── LIVE BROADCAST CTA ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/10 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="glass-premium p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                liveState.isActive 
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30' 
                  : 'bg-white/5 text-white/40 border border-white/10'
              }`}>
                <Radio className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-extrabold text-white">Live Broadcasting</h3>
                  {liveState.isActive && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      LIVE NOW
                    </span>
                  )}
                </div>
                <p className="text-white/50 text-sm md:text-base max-w-lg leading-relaxed">
                  {liveState.isActive
                    ? 'Sheikh Mohammed Zabuur is currently broadcasting live. Join the active stream to participate directly.'
                    : 'Check the schedule for upcoming live lectures and classes with Sheikh Mohammed Zabuur.'}
                </p>
              </div>
            </div>

            <Link
              to="/live"
              className={`px-8 py-3.5 text-sm rounded-xl font-bold shrink-0 whitespace-nowrap flex items-center gap-2 transition-all ${
                liveState.isActive
                  ? 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 shadow-lg shadow-red-500/30'
                  : 'btn-icc'
              }`}
            >
              <Radio className="w-4.5 h-4.5" />
              {liveState.isActive ? 'Join Live Stream' : 'View Schedule'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED PORTAL ── */}
      {featured.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
                  <Star className="w-3.5 h-3.5" /> CURATED CONTENT
                </span>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Featured Content</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {featured.slice(0, 4).map((item, idx) => {
                const isPdf = item.resourceType === 'PDF';
                const isAudio = item.resourceType === 'AUDIO';
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="glass-premium p-5 flex flex-col justify-between gap-5 group hover:bg-slate-900/50"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isPdf ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          isAudio ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {isPdf ? <FileText className="w-4.5 h-4.5" /> : isAudio ? <Music className="w-4.5 h-4.5" /> : <Video className="w-4.5 h-4.5" />}
                        </div>
                        <span className="text-[10px] text-white/30 font-medium">Featured</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-semibold border ${CAT_COLORS[item.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
                            {item.category}
                          </span>
                          {item.collection && (() => {
                            const col = getCollectionBySlug(item.collection);
                            const colColor = col ? (COLLECTION_COLORS[col.slug] || 'bg-white/5 text-white/50 border-white/10') : 'bg-white/5 text-white/50 border-white/10';
                            return (
                              <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-semibold border ${colColor}`}>
                                {col?.icon} {col?.name || item.collection}
                              </span>
                            );
                          })()}
                        </div>

                        <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-emerald-400 transition-colors leading-snug">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-white/40 mt-2">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{item.views} views</span>
                      <Link to={isPdf ? '/pdfs' : isAudio ? '/audio' : '/videos'} className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold">
                        {isPdf ? <Download className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {isPdf ? t('home.download') : t('home.listen')}
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── TELEGRAM CHANNELS ── */}
      <TelegramSection />

      {/* ── TESTIMONIALS MASONRY ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/10 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              What Students Say
            </h2>
            <p className="text-base text-white/50 max-w-xl mx-auto">
              Hear from our global community of learners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="glass-premium p-6 flex flex-col justify-between gap-6 hover:bg-slate-900/40 hover:-translate-y-1 transition-all duration-300 shadow-md"
              >
                <div className="space-y-4">
                  <Quote className="w-8 h-8 text-emerald-500/10 shrink-0" />
                  <p className="text-sm text-white/70 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-extrabold text-emerald-400 uppercase">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{testimonial.name}</p>
                    <p className="text-xs text-white/40">{testimonial.country}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT SHEIKH BIOGRAPHY ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            
            <div className="md:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                {t('home.about_sheikh')}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
                A Dedicated Path to Propagating Authentic Sunnah
              </h2>
              <p className="text-base text-white/60 leading-relaxed">
                {t('home.about_desc')}
              </p>
              <div className="pt-4">
                <Link to="/about" className="btn-icc px-8 py-3.5 text-sm shrink-0 whitespace-nowrap flex items-center gap-2">
                  {t('home.read_biography')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="md:col-span-5 relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-amber-500 opacity-20 blur-lg group-hover:opacity-35 transition-all" />
              <div className="relative glass-premium p-8 md:p-10 text-center space-y-6 bg-slate-950/80">
                <Quote className="w-12 h-12 text-amber-500/20 mx-auto" />
                <p className="font-quran text-2xl md:text-3xl text-amber-400/80 leading-loose" dir="rtl">
                  طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ
                </p>
                <p className="text-xs text-white/40 tracking-wider max-w-xs mx-auto leading-relaxed">
                  "Seeking knowledge is a mandatory obligation upon every Muslim."
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── NEWSLETTER SIGNUP BANNER ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/10 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Newsletter
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Stay Updated</h2>
          <p className="text-base text-white/50 max-w-md mx-auto leading-relaxed">
            Subscribe to receive notifications about new lessons, live streams, and Islamic reminders.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
            />
            <button type="submit" className="btn-icc px-8 py-3 whitespace-nowrap font-bold">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
