import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Music, Video, FileText, Radio, Tv, ArrowRight,
  Play, Download, Eye, Sparkles, BookOpen, ChevronRight,
  Star, MessageCircle, GraduationCap,
  ScrollText, UserRound, Languages, Heart, Library,
  Quote, TrendingUp, Headphones, Clock, BookMarked,
  Shield, Globe, Monitor, CheckCircle, Menu, X,
  ChevronLeft, ChevronRight as ChevronRightIcon, Bot,
  Coffee, Moon, Sun, Users, Award,
} from 'lucide-react';
import { resources as resourcesApi, collections as collectionsApi, live as liveApi } from '../lib/api';
import { COLLECTIONS, COLLECTION_COLORS, getCollectionBySlug } from '../config/collections';
import type { Resource } from '../types';
import { useTranslation } from '../i18n';
import { useAppearance } from '../context/AppearanceContext';
import { useSEO } from '../seo/metadata';
import TelegramSection from '../components/sections/TelegramSection';

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

const CATEGORY_ICONS: Record<string, string> = {
  Aqeedah: '⭐', Hadith: '📖', Tafsir: '📜', Fiqh: '⚖️',
  Seerah: '🕌', Tajweed: '🎵', Arabic: '📝', Usul: '🏛️',
  Manhaj: '🗺️', Adab: '🌸', Khutbah: '🎙️', Ramadan: '🌙',
  'Questions & Answers': '❓', General: '📚',
};

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
  { name: 'Aisha Mohamed', country: 'Ethiopia', text: 'This platform has completely transformed my understanding of Islam. The structured courses and authentic teachers make learning so easy and enjoyable.', rating: 5 },
  { name: 'Ahmed Hassan', country: 'Somalia', text: 'Finally, a platform that provides authentic Islamic knowledge in multiple languages. The audio lessons are perfect for learning on the go.', rating: 5 },
  { name: 'Fatima Ali', country: 'Kenya', text: 'I started as a complete beginner and now I can recite Quran with proper Tajweed. The teachers are patient and knowledgeable.', rating: 5 },
  { name: 'Omar Abdirahman', country: 'USA', text: 'The level system is brilliant. It guides you step by step from basics to advanced topics.', rating: 4 },
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
      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-icc-500/10 text-icc-400 border border-icc-500/20 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{count}{suffix}</div>
      <div className="text-sm text-white/50">{label}</div>
    </motion.div>
  );
}

function SkeletonCard({ wide = false }: { wide?: boolean }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-white/5 border border-white/5 p-5 ${wide ? 'h-40' : 'h-52'}`}>
      <div className="flex gap-3 h-full">
        <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0" />
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
  const [testimonialIdx, setTestimonialIdx] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => setTestimonialIdx(prev => (prev + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|v=)([^#&?]{11})/);
    return m ? m[1] : null;
  };

  return (
    <div className="min-h-screen text-white">
      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          backgroundImage: `url("${settings.backgroundImage}")`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 z-0 hero-overlay" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-icc-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,_#F59E0B_1.5px,_transparent_1.5px)] bg-[length:40px_40px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              {liveState.isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider mb-6 cursor-pointer hover:bg-red-500/20 transition-all"
                  onClick={() => window.location.href = '/live'}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  {t('nav.live_now_join')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400 text-xs font-semibold uppercase tracking-wider mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t('hero.badge')}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-display-sm md:text-display-md lg:text-display-lg mb-6 tracking-tight"
              >
                <span className="block text-white">{t('hero.title_line1')}</span>
                <span className="block icc-gradient-text">{t('hero.title_line2')}</span>
                <span className="block text-heading-lg font-semibold text-white/60 mt-4">
                  {t('home.platform_name')}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-body-lg text-white/60 max-w-xl leading-relaxed mb-10"
              >
                {t('home.hero_desc_alt')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-3 mb-16"
              >
                <Link to="/audio" className="btn-icc gap-2 px-6 py-3 text-sm">
                  <Music className="w-4 h-4" /> {t('home.listen_to_audio')}
                </Link>
                <Link to="/videos" className="btn-icc gap-2 px-6 py-3 text-sm bg-icc-600">
                  <Video className="w-4 h-4" /> {t('home.watch_videos')}
                </Link>
                <Link to="/pdfs" className="btn-outline gap-2 px-6 py-3 text-sm">
                  <FileText className="w-4 h-4" /> {t('home.read_pdfs')}
                </Link>
                <Link
                  to="/live"
                  className={`gap-2 px-6 py-3 text-sm rounded-xl font-semibold flex items-center transition-all ${
                    liveState.isActive
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30'
                      : 'btn-outline'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  {liveState.isActive ? t('home.join_live_stream') : t('home.live_stream')}
                </Link>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                <CounterStat value={stats.audio} label={t('home.audio_lectures_stat')} icon={Music} />
                <CounterStat value={stats.video} label={t('home.video_classes_stat')} icon={Video} />
                <CounterStat value={stats.pdf} label={t('home.pdf_books_stat')} icon={FileText} />
                <CounterStat value={stats.total} label="Resources" icon={Library} />
              </div>
            </div>

            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                  <img
                    src="/images/sheikh-zabuur.jpg"
                    alt="Sheikh Mohammed Zabuur"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white font-bold text-lg">Sheikh Mohammed Zabuur</p>
                    <p className="text-white/60 text-sm">Scholar & Islamic Educator</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Why Choose Us
            </span>
            <h2 className="text-display-sm md:text-display-md font-bold text-white mb-4">
              Authentic Islamic Education
            </h2>
            <p className="text-body-md text-white/50 max-w-2xl mx-auto">
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
                  transition={{ delay: idx * 0.1 }}
                  className="glass-premium p-6 text-center"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-icc-500/10 text-icc-400 border border-icc-500/20 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.label}</h3>
                  <p className="text-sm text-white/50">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── LEARNING TRACKS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Learning Paths
            </span>
            <h2 className="text-display-sm md:text-display-md font-bold text-white mb-4">
              Featured Learning Tracks
            </h2>
            <p className="text-body-md text-white/50 max-w-2xl mx-auto">
              Choose your path and begin your journey of authentic Islamic knowledge
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRACKS.map((track, idx) => (
              <motion.div
                key={track.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-white/5 hover:border-icc-500/30 transition-all duration-300 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${track.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="p-5">
                  <span className="text-3xl mb-3 block">{track.icon}</span>
                  <h3 className="text-base font-bold text-white group-hover:text-icc-400 transition-colors">{track.name}</h3>
                  <p className="text-xs text-white/40 mt-1">{track.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATISTICS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-900/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-islamic-pattern opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display-sm md:text-display-md font-bold text-white mb-4">
              Platform Statistics
            </h2>
            <p className="text-body-md text-white/50 max-w-2xl mx-auto">
              Growing daily with authentic Islamic content
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <CounterStat value={100} label="Audio Lectures" icon={Music} suffix="+" />
            <CounterStat value={50} label="Video Lessons" icon={Video} suffix="+" />
            <CounterStat value={30} label="PDF Books" icon={FileText} suffix="+" />
            <CounterStat value={4} label="Languages" icon={Globe} />
          </div>
        </div>
      </section>

      {/* ── LATEST AUDIO ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400 text-xs font-semibold mb-3">
                <Headphones className="w-3 h-3" /> Audio
              </span>
              <h2 className="text-heading-xl font-bold text-white">{t('home.latest_audio')}</h2>
            </div>
            <Link to="/audio" className="flex items-center gap-1.5 text-sm text-icc-400 hover:text-icc-300 font-medium transition-colors">
              {t('common.view_all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? [1,2,3,4].map(i => <SkeletonCard key={i} />)
              : audios.length === 0
                ? <p className="text-white/40 text-sm col-span-4 py-8 text-center">{t('home.no_audio')}</p>
                : audios.slice(0, 4).map((audio, idx) => (
                    <motion.div
                      key={audio.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="glass-premium p-5 flex flex-col gap-4 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-icc-500/10 text-icc-400 border border-icc-500/20 flex items-center justify-center shrink-0">
                          <Music className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${CAT_COLORS[audio.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
                              {audio.category}
                            </span>
                            {audio.collection && (() => {
                              const col = getCollectionBySlug(audio.collection);
                              const colColor = col ? (COLLECTION_COLORS[col.slug] || 'bg-white/5 text-white/50 border-white/10') : 'bg-white/5 text-white/50 border-white/10';
                              return (
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colColor}`}>
                                  {col?.icon} {col?.name || audio.collection}
                                </span>
                              );
                            })()}
                          </div>
                          <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-icc-400 transition-colors leading-snug">
                            {audio.title}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 text-xs text-white/40">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{audio.views}</span>
                        <Link to="/audio" className="flex items-center gap-1 text-icc-400 hover:text-icc-300 font-semibold">
                          <Play className="w-3.5 h-3.5" /> {t('home.listen')}
                        </Link>
                      </div>
                    </motion.div>
                  ))
            }
          </div>
        </div>
      </section>

      {/* ── LATEST VIDEOS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-3">
                <Video className="w-3 h-3" /> Video
              </span>
              <h2 className="text-heading-xl font-bold text-white">{t('home.latest_video')}</h2>
            </div>
            <Link to="/videos" className="flex items-center gap-1.5 text-sm text-icc-400 hover:text-icc-300 font-medium transition-colors">
              {t('common.view_all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? [1,2,3,4].map(i => <SkeletonCard key={i} />)
              : videos.length === 0
                ? <p className="text-white/40 text-sm col-span-4 py-8 text-center">{t('home.no_video')}</p>
                : videos.slice(0, 4).map((video, idx) => {
                    const ytId = getYoutubeId(video.url);
                    return (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="glass-premium overflow-hidden group cursor-pointer"
                      >
                        <div className="aspect-video bg-surface-950 relative overflow-hidden">
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
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-2xl bg-icc-500 flex items-center justify-center shadow-lg shadow-icc-500/30">
                              <Play className="w-5 h-5 text-white pl-0.5" />
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${CAT_COLORS[video.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
                              {video.category}
                            </span>
                            {video.collection && (() => {
                              const col = getCollectionBySlug(video.collection);
                              const colColor = col ? (COLLECTION_COLORS[col.slug] || 'bg-white/5 text-white/50 border-white/10') : 'bg-white/5 text-white/50 border-white/10';
                              return (
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colColor}`}>
                                  {col?.icon} {col?.name || video.collection}
                                </span>
                              );
                            })()}
                          </div>
                          <Link to="/videos" className="block text-sm font-bold text-white group-hover:text-icc-400 transition-colors line-clamp-2 leading-snug">
                            {video.title}
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })
            }
          </div>
        </div>
      </section>

      {/* ── LATEST PDFs ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-3">
                <FileText className="w-3 h-3" /> PDF
              </span>
              <h2 className="text-heading-xl font-bold text-white">{t('home.pdf_books')}</h2>
            </div>
            <Link to="/pdfs" className="flex items-center gap-1.5 text-sm text-icc-400 hover:text-icc-300 font-medium transition-colors">
              {t('common.view_all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? [1,2,3,4].map(i => <SkeletonCard key={i} />)
              : pdfs.length === 0
                ? <p className="text-white/40 text-sm col-span-4 py-8 text-center">{t('home.no_pdfs')}</p>
                : pdfs.slice(0, 4).map((pdf, idx) => (
                    <motion.div
                      key={pdf.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="glass-premium p-5 flex flex-col gap-4 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${CAT_COLORS[pdf.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
                              {pdf.category}
                            </span>
                            {pdf.collection && (() => {
                              const col = getCollectionBySlug(pdf.collection);
                              const colColor = col ? (COLLECTION_COLORS[col.slug] || 'bg-white/5 text-white/50 border-white/10') : 'bg-white/5 text-white/50 border-white/10';
                              return (
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colColor}`}>
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
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 text-xs text-white/40">
                        <span>{pdf.sizeHuman || '—'}</span>
                        <a
                          href={pdf.url}
                          download
                          className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold"
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

      {/* ── LIVE STREAM ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-icc-500/5 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="glass-premium p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                liveState.isActive ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-white/40 border border-white/10'
              }`}>
                <Radio className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl md:text-2xl font-bold text-white">Live Streaming</h3>
                  {liveState.isActive && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-lg">
                  {liveState.isActive
                    ? 'Sheikh Mohammed Zabuur is live now. Join the session and learn directly.'
                    : 'Check the schedule for upcoming live sessions with Sheikh Mohammed Zabuur.'}
                </p>
              </div>
            </div>
            <Link
              to="/live"
              className={`px-8 py-3 text-sm rounded-xl font-semibold shrink-0 whitespace-nowrap flex items-center gap-2 transition-all ${
                liveState.isActive
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30'
                  : 'btn-icc'
              }`}
            >
              <Radio className="w-4 h-4" />
              {liveState.isActive ? 'Join Live Stream' : 'View Schedule'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED CONTENT ── */}
      {featured.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold mb-3">
                  <Star className="w-3 h-3" /> Featured
                </span>
                <h2 className="text-heading-xl font-bold text-white">Featured Content</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {featured.slice(0, 4).map((item, idx) => {
                const isPdf = item.resourceType === 'PDF';
                const isAudio = item.resourceType === 'AUDIO';
                const isVideo = item.resourceType === 'VIDEO';
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-premium p-5 flex flex-col gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isPdf ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        isAudio ? 'bg-icc-500/10 text-icc-400 border-icc-500/20' :
                        'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {isPdf ? <FileText className="w-5 h-5" /> : isAudio ? <Music className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-1.5 mb-1">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${CAT_COLORS[item.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
                            {item.category}
                          </span>
                          {item.collection && (() => {
                            const col = getCollectionBySlug(item.collection);
                            const colColor = col ? (COLLECTION_COLORS[col.slug] || 'bg-white/5 text-white/50 border-white/10') : 'bg-white/5 text-white/50 border-white/10';
                            return (
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colColor}`}>
                                {col?.icon} {col?.name || item.collection}
                              </span>
                            );
                          })()}
                        </div>
                        <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-icc-400 transition-colors">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.views}</span>
                      <Link to={isPdf ? '/pdfs' : isAudio ? '/audio' : '/videos'} className="flex items-center gap-1 text-icc-400 hover:text-icc-300 font-semibold">
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

      {/* ── TELEGRAM ── */}
      <TelegramSection />

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Testimonials
            </span>
            <h2 className="text-display-sm md:text-display-md font-bold text-white mb-4">
              What Students Say
            </h2>
            <p className="text-body-md text-white/50 max-w-2xl mx-auto">
              Hear from our global community of learners
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="glass-premium p-8 md:p-12 text-center relative overflow-hidden">
              <Quote className="w-12 h-12 text-icc-500/20 absolute top-6 left-6" />
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[1,2,3,4,5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= TESTIMONIALS[testimonialIdx].rating ? 'text-gold-400 fill-gold-400' : 'text-white/10'}`}
                    />
                  ))}
                </div>
                <p className="text-body-lg text-white/80 leading-relaxed mb-8 italic">
                  "{TESTIMONIALS[testimonialIdx].text}"
                </p>
                <div>
                  <p className="text-base font-bold text-white">{TESTIMONIALS[testimonialIdx].name}</p>
                  <p className="text-sm text-white/40">{TESTIMONIALS[testimonialIdx].country}</p>
                </div>
                <div className="flex items-center justify-center gap-2 mt-6">
                  {TESTIMONIALS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTestimonialIdx(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === testimonialIdx ? 'bg-icc-400 w-6' : 'bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Testimonial ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT SHEIKH ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="glass-premium p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-icc-500/10 text-icc-400 border border-icc-500/20 flex items-center justify-center shrink-0">
                <UserRound className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{t('home.about_sheikh')}</h3>
                <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-xl">
                  {t('home.about_desc')}
                </p>
              </div>
            </div>
            <Link to="/about" className="btn-icc px-8 py-3 text-sm shrink-0 whitespace-nowrap flex items-center gap-2">
              {t('home.read_biography')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-900/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-heading-xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-body-md text-white/50 mb-8">
            Subscribe to receive notifications about new lessons, live streams, and Islamic reminders.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all text-sm"
            />
            <button type="submit" className="btn-icc px-8 py-3 whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
