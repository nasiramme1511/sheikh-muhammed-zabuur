import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Video, FileText, Radio, Tv, ArrowRight,
  Play, Download, Eye, Sparkles, BookOpen, ChevronRight,
  ScrollText, UserRound, Heart, Library,
  Quote, Headphones, Clock, Globe, Monitor, CheckCircle,
  Moon, Sun, Users, Award, BookOpenCheck, MapPin, 
  ExternalLink, Calendar, Bookmark, X
} from 'lucide-react';
import { resources as resourcesApi, collections as collectionsApi, live as liveApi } from '../lib/api';
import { COLLECTIONS, COLLECTION_COLORS, getCollectionBySlug } from '../config/collections';
import type { Resource } from '../types';
import { useTranslation, type TranslationKey } from '../i18n';
import ResponsiveScholarImage from '../components/ResponsiveScholarImage';
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

interface PrayerTime {
  name: string;
  nameAr: string;
  time: string;
  icon: any;
  color: string;
}

const PRAYER_TIMES: PrayerTime[] = [
  { name: 'Fajr', nameAr: 'الفجر', time: '05:12', icon: SunriseIcon, color: '#0EA5E9' },
  { name: 'Dhuhr', nameAr: 'الظهر', time: '12:30', icon: Sun, color: '#F59E0B' },
  { name: 'Asr', nameAr: 'العصر', time: '15:45', icon: Sun, color: '#F97316' },
  { name: 'Maghrib', nameAr: 'المغرب', time: '18:30', icon: SunsetIcon, color: '#EC4899' },
  { name: 'Isha', nameAr: 'العشاء', time: '20:00', icon: Moon, color: '#8B5CF6' },
];

function SunriseIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 22H6" />
      <path d="m12 18-4-4h8z" />
      <path d="M12 2v8" />
      <path d="m5.22 10.22 1.42 1.42" />
      <path d="m17.36 11.64 1.42-1.42" />
      <path d="M22 22H2" />
      <path d="M16 22a4 4 0 0 0-8 0" />
    </svg>
  );
}

function SunsetIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 22H6" />
      <path d="m16 14-4 4-4-4z" />
      <path d="M12 2v8" />
      <path d="m5.22 10.22 1.42 1.42" />
      <path d="m17.36 11.64 1.42-1.42" />
      <path d="M22 22H2" />
      <path d="M16 22a4 4 0 0 0-8 0" />
    </svg>
  );
}

function getCurrentPrayerIndex(): number {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = PRAYER_TIMES.length - 1; i >= 0; i--) {
    const [h, m] = PRAYER_TIMES[i].time.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    if (currentMinutes >= prayerMinutes) return i;
  }
  return -1;
}

function getNextPrayerIndex(): number {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < PRAYER_TIMES.length; i++) {
    const [h, m] = PRAYER_TIMES[i].time.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    if (currentMinutes < prayerMinutes) return i;
  }
  return 0;
}

const CAT_COLORS: Record<string, string> = {
  Aqeedah: 'bg-icc-500/10 text-icc-400 border-icc-500/20',
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
  Ramadan: 'bg-icc-600/10 text-icc-300 border-icc-600/20',
  'Questions & Answers': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  General: 'bg-white/5 text-white/50 border-white/10',
};

const GALLERY_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80', titleKey: 'gallery_masjid', size: 'large' },
  { url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad5d?auto=format&fit=crop&w=600&q=80', titleKey: 'gallery_teaching', size: 'medium' },
  { url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80', titleKey: 'gallery_study', size: 'medium' },
  { url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80', titleKey: 'gallery_classroom', size: 'large' },
  { url: 'https://images.unsplash.com/photo-1609599006353-e629f1d40a4a?auto=format&fit=crop&w=600&q=80', titleKey: 'gallery_quran', size: 'medium' },
];

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

// Custom Streaming style card for Audio/Video/PDF Resources
function StreamingCard({ item, type, t }: { item: Resource; type: 'AUDIO' | 'VIDEO' | 'PDF'; t: any }) {
  const isPdf = type === 'PDF';
  const isAudio = type === 'AUDIO';
  const isVideo = type === 'VIDEO';

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|v=)([^#&?]{11})/);
    return m ? m[1] : null;
  };

  const ytId = isVideo ? getYoutubeId(item.url) : null;
  const coverUrl = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;

  return (
    <div className="glass-premium w-[240px] sm:w-[260px] lg:w-[280px] overflow-hidden group hover:bg-slate-900/60 transition-all duration-500 flex flex-col justify-between border border-white/5">
      <div>
        {/* Cover thumbnail wrapper */}
        <div className="aspect-[16/10] bg-slate-950/80 relative overflow-hidden flex items-center justify-center">
          {isVideo && coverUrl ? (
            <img
              src={coverUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={e => (e.target as HTMLImageElement).src = '/video-placeholder.jpg'}
            />
          ) : isAudio ? (
            <div className="absolute inset-0 bg-gradient-to-br from-icc-950/40 via-slate-950 to-slate-900/60 flex flex-col justify-between p-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-icc-400 bg-icc-950/60 px-2 py-0.5 rounded border border-icc-500/20">{t('home.badge_audiobook')}</span>
                <Headphones className="w-5 h-5 text-icc-500/60" />
              </div>
              <div className="flex items-center gap-1">
                <Music className="w-4 h-4 text-icc-400 animate-pulse" />
                <span className="text-[10px] text-white/40 tracking-wider">{t('home.badge_lecture_subtitle')}</span>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-slate-950 to-slate-900/60 flex flex-col justify-between p-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">{t('home.badge_document')}</span>
                <FileText className="w-5 h-5 text-amber-500/60" />
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] text-white/40 tracking-wider">{t('home.badge_document_subtitle')}</span>
              </div>
            </div>
          )}

          {/* Hover overlay with streaming options */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {isAudio && (
              <>
                <Link
                  to="/audio"
                  className="w-11 h-11 rounded-2xl bg-icc-500 hover:bg-icc-600 text-white flex items-center justify-center shadow-lg shadow-icc-500/30 transition-transform active:scale-95"
                  title={t('home.listen')}
                >
                  <Play className="w-5 h-5 fill-white pl-0.5" />
                </Link>
                <a
                  href={item.url}
                  download
                  className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/10 transition-transform active:scale-95"
                  title={t('home.download')}
                >
                  <Download className="w-5 h-5" />
                </a>
              </>
            )}

            {isVideo && (
              <Link
                to="/videos"
                className="w-12 h-12 rounded-2xl bg-icc-500 hover:bg-icc-600 text-white flex items-center justify-center shadow-lg shadow-icc-500/30 transition-transform active:scale-95"
                title={t('home.listen')}
              >
                <Play className="w-6 h-6 fill-white pl-0.5" />
              </Link>
            )}

            {isPdf && (
              <>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-2xl bg-icc-500 hover:bg-icc-600 text-white flex items-center justify-center shadow-lg shadow-icc-500/30 transition-transform active:scale-95"
                  title={t('home.read_online')}
                >
                  <BookOpen className="w-5 h-5" />
                </a>
                <a
                  href={item.url}
                  download
                  className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/10 transition-transform active:scale-95"
                  title={t('home.download')}
                >
                  <Download className="w-5 h-5" />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="p-5 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-semibold border ${CAT_COLORS[item.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
              {item.category}
            </span>
            {item.collection && (() => {
              const col = getCollectionBySlug(item.collection);
              const colColor = col ? (COLLECTION_COLORS[col.slug] || 'bg-white/5 text-white/50 border-white/10') : 'bg-white/5 text-white/50 border-white/10';
              return (
                <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-semibold border ${colColor}`}>
                  {col?.icon} {col?.name || item.collection}
                </span>
              );
            })()}
          </div>

          <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-icc-400 transition-colors duration-300">
            {item.title}
          </h3>
        </div>
      </div>

      {/* Footer stats row */}
      <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 mt-3">
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 opacity-60" />
          {t('home.views_suffix', { count: item.views || 0 })}
        </span>
        <span className="font-semibold text-white/30 tracking-wider">
          {isPdf ? item.sizeHuman || 'PDF' : isAudio ? t('home.format_audio') : t('home.format_video')}
        </span>
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

  const { t, language } = useTranslation();
  const { settings } = useAppearance();
  const [audios, setAudios] = useState<Resource[]>([]);
  const [videos, setVideos] = useState<Resource[]>([]);
  const [pdfs, setPdfs] = useState<Resource[]>([]);
  const [featured, setFeatured] = useState<Resource[]>([]);
  const [liveState, setLiveState] = useState<LiveState>({ isActive: false, title: '', url: '' });
  const [stats, setStats] = useState<ResourceStats>({ audio: 0, video: 0, pdf: 0, image: 0, total: 0 });
  const [collectionStats, setCollectionStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Gallery lightbox state
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Horizontal sliders refs
  const audioSliderRef = useRef<HTMLDivElement>(null);
  const videoSliderRef = useRef<HTMLDivElement>(null);
  const pdfSliderRef = useRef<HTMLDivElement>(null);

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

  const slideLeft = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const slideRight = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Bespoke Prayer Countdown calculations inside Hero
  const [nextPrayerIndex, setNextPrayerIndex] = useState(getNextPrayerIndex());
  const [currentPrayerIndex, setCurrentPrayerIndex] = useState(getCurrentPrayerIndex());
  const [hijriDateString, setHijriDateString] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setNextPrayerIndex(getNextPrayerIndex());
      setCurrentPrayerIndex(getCurrentPrayerIndex());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const now = new Date();
    try {
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        calendar: 'islamic',
      };
      const formatter = new Intl.DateTimeFormat('en-u-ca-islamic', options);
      setHijriDateString(formatter.format(now));
    } catch {
      setHijriDateString('');
    }
  }, []);

  const nextPrayer = PRAYER_TIMES[nextPrayerIndex];
  const NextIcon = nextPrayer.icon;

  const prayerKeyMap: Record<string, TranslationKey> = {
    Fajr: 'prayer_times.fajr',
    Dhuhr: 'prayer_times.dhuhr',
    Asr: 'prayer_times.asr',
    Maghrib: 'prayer_times.maghrib',
    Isha: 'prayer_times.isha',
  };

  const remainingMinutes = (() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [h, m] = nextPrayer.time.split(':').map(Number);
    let prayerMinutes = h * 60 + m;
    let diff = prayerMinutes - currentMinutes;
    if (diff < 0) {
      // wraps to next day Fajr
      const [fajrH, fajrM] = PRAYER_TIMES[0].time.split(':').map(Number);
      prayerMinutes = (fajrH + 24) * 60 + fajrM;
      diff = prayerMinutes - currentMinutes;
    }
    return diff;
  })();

  const hoursLeft = Math.floor(remainingMinutes / 60);
  const minutesLeft = remainingMinutes % 60;

  return (
    <div className="min-h-screen text-white bg-[#050505] overflow-x-hidden relative">
      {/* ── GLOBAL BACKDROP SYSTEM ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Animated grid backdrop */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), 
              linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Floating blurred Sky & Gold spheres */}
        <motion.div 
          animate={{
            y: [0, -35, 0],
            x: [0, 15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[8%] left-[-15%] w-[450px] h-[450px] bg-icc-700/10 rounded-full blur-[130px]"
        />
        <motion.div 
          animate={{
            y: [0, 45, 0],
            x: [0, -25, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[25%] right-[-15%] w-[550px] h-[550px] bg-icc-600/10 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{
            y: [0, -50, 0],
            x: [0, 30, 0],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[12%] right-[10%] w-[320px] h-[320px] bg-amber-500/5 rounded-full blur-[110px]"
        />
        <motion.div 
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[8%] left-[10%] w-[280px] h-[280px] bg-amber-600/5 rounded-full blur-[90px]"
        />
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[95vh] flex items-center pt-28 pb-16 z-10 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Premium Headline & CTA */}
            <div className="lg:col-span-7 space-y-8 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-3">
                {liveState.isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-red-500/20 transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)]"
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400 text-xs font-semibold uppercase tracking-wider"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {t('hero.badge')}
                </motion.div>
              </div>

              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white"
                >
                  {t('home.hero_learn_authentic')}{' '}
                  <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-icc-400 via-icc-500 to-sky-200">
                    {t('home.hero_islamic_knowledge')}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                      className="absolute bottom-1 left-0 h-[4px] bg-gradient-to-r from-icc-500 to-amber-400 rounded-full"
                    />
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/60 leading-relaxed text-base md:text-lg max-w-[650px]"
                >
                  {t('home.hero_desc_alt')}
                </motion.p>
              </div>

              {/* Action buttons with glow effects */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <Link 
                  to="/categories" 
                  className="btn-icc px-8 py-4 text-sm font-bold tracking-wide shadow-glow-icc hover:shadow-[0_0_35px_rgba(14,165,233,0.45)] hover:scale-[1.03] active:scale-100 transition-all duration-300"
                >
                  <BookOpen className="w-4.5 h-4.5" />
                  {t('home.start_learning')}
                </Link>

                <Link 
                  to="/audio" 
                  className="btn-outline px-8 py-4 text-sm font-bold tracking-wide border-white/10 hover:border-icc-500/40 hover:bg-icc-500/5 hover:scale-[1.02] active:scale-100 transition-all duration-300"
                >
                  <Library className="w-4.5 h-4.5 text-icc-400" />
                  {t('home.browse_resources')}
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 gap-y-3 gap-x-6 pt-6 max-w-lg border-t border-white/5"
              >
                {[
                  t('home.verified_scholar'),
                  t('home.authentic_teachings'),
                  t('home.thousands_students'),
                  t('home.free_learning')
                ].map((indicator) => (
                  <div key={indicator} className="flex items-center gap-2 text-white/50 text-xs font-medium">
                    <CheckCircle className="w-4 h-4 text-icc-500 shrink-0" />
                    <span>{indicator}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column: Scholar Frame + Floating Cards + Live Prayer Widget */}
            <div className="lg:col-span-5 space-y-8 flex flex-col justify-center relative">
              
              {/* Scholar frame container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative rounded-3xl overflow-hidden border border-amber-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900 group"
              >
                {/* Visual accent bubbles behind/over portrait */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 opacity-70" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-icc-500/5 to-transparent pointer-events-none z-10" />

                <ResponsiveScholarImage
                  src="/images/sheikh-zabuur.jpg"
                  alt={t('home.hero_image_alt')}
                  className="w-full h-[360px] md:h-[400px] group-hover:scale-[1.03] transition-transform duration-700"
                />

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-4 right-4 z-20 bg-icc-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-icc-400/20"
                >
                  <CheckCircle className="w-3.5 h-3.5 fill-white text-icc-500" />
                  {t('home.scholar_badge')}
                </motion.div>

                {/* Info row */}
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <h3 className="text-xl font-extrabold text-white tracking-wide">{t('home.scholar_name')}</h3>
                  <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mt-1">{t('home.scholar_title')}</p>
                </div>

                {/* Overlay Mini Cards (Gently floating) */}
                {/* Card 1: Students count */}
                <motion.div 
                  animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-12 -left-6 z-20 glass-premium px-4 py-2.5 flex items-center gap-2.5 shadow-xl border border-white/10 hover:border-icc-500/30 transition-all cursor-default"
                >
                  <div className="w-8 h-8 rounded-lg bg-icc-500/20 flex items-center justify-center text-icc-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 leading-none">{t('home.students_joined')}</p>
                    <p className="text-xs font-extrabold text-white mt-1">{t('home.students_count_value')}</p>
                  </div>
                </motion.div>

                {/* Card 2: Resources available */}
                <motion.div 
                  animate={{ y: [0, 8, 0], x: [0, -4, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-1/2 -right-6 z-20 glass-premium px-4 py-2.5 flex items-center gap-2.5 shadow-xl border border-white/10 hover:border-amber-500/30 transition-all cursor-default"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Library className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 leading-none">{t('home.resources_label')}</p>
                    <p className="text-xs font-extrabold text-white mt-1">{t('home.resources_value')}</p>
                  </div>
                </motion.div>

                {/* Card 3: Years teaching */}
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute bottom-16 -left-6 z-20 glass-premium px-4 py-2.5 flex items-center gap-2.5 shadow-xl border border-white/10 hover:border-icc-500/30 transition-all cursor-default"
                >
                  <div className="w-8 h-8 rounded-lg bg-icc-500/20 flex items-center justify-center text-icc-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 leading-none">{t('home.years_active_label')}</p>
                    <p className="text-xs font-extrabold text-white mt-1">{t('home.years_active_value')}</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Live Prayer Countdown Widget (Premium glassmorphic dashboard element) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-premium p-5 relative overflow-hidden group border border-white/15 shadow-2xl"
              >
                {/* Glow boarder & radial overlay */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                
                <div className="flex items-center justify-between mb-4">
                  {hijriDateString && (
                    <div className="flex items-center gap-1.5 text-[10px] text-white/50 bg-white/5 px-2.5 py-1 rounded-full">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{hijriDateString}</span>
                    </div>
                  )}
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-icc-400 bg-icc-500/10 border border-icc-500/20 px-2 py-0.5 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-icc-400" />
                    {t('home.prayer_logic_live')}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 tracking-wider uppercase font-semibold">{t('prayer_times.next_prayer')}</p>
                      <p className="text-sm font-bold text-white mt-0.5">{t(prayerKeyMap[nextPrayer.name])}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="text-xl font-extrabold text-white">{nextPrayer.time}</p>
                    <p className="text-[10px] text-white/50 mt-0.5">
                      {t('prayer_times.time_left', { hours: hoursLeft, minutes: minutesLeft })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {PRAYER_TIMES.map((prayer, i) => {
                    const Icon = prayer.icon;
                    const isNext = i === nextPrayerIndex;
                    const isCurrent = i === currentPrayerIndex;
                    const isPast = i < currentPrayerIndex || (currentPrayerIndex === -1 && i < nextPrayerIndex);

                    return (
                      <div
                        key={prayer.name}
                        className={`text-center py-2 px-1 rounded-xl transition-all duration-300 border ${
                          isNext
                            ? 'bg-amber-500/10 border-amber-500/30 shadow-md shadow-amber-500/5'
                            : isCurrent
                            ? 'bg-icc-500/10 border-icc-500/20'
                            : 'bg-white/5 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 mx-auto mb-1.5 ${
                            isNext ? 'text-amber-400' : isCurrent ? 'text-icc-400' : isPast ? 'text-white/20' : 'text-white/40'
                          }`}
                        />
                        <p className={`text-[9px] font-bold ${
                          isNext ? 'text-amber-400' : isCurrent ? 'text-icc-400' : isPast ? 'text-white/20' : 'text-white/40'
                        }`}>
                          {t(prayerKeyMap[prayer.name])}
                        </p>
                        <p className={`text-[8px] mt-0.5 ${
                          isNext ? 'text-amber-400/70' : isPast ? 'text-white/10' : 'text-white/30'
                        }`}>
                          {prayer.time}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST & VALUE PROPOSITION ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/10 border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400 text-xs font-semibold uppercase tracking-wider">
              {t('home.core_principles')}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {t('home.why_trust_title')}
            </h2>
            <p className="text-base text-white/50 max-w-xl mx-auto leading-relaxed">
              {t('home.why_trust_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {([
              { icon: ScrollText, labelKey: 'home.trust_authentic', descKey: 'home.trust_authentic_desc' },
              { icon: BookOpenCheck, labelKey: 'home.trust_structured', descKey: 'home.trust_structured_desc' },
              { icon: Globe, labelKey: 'home.trust_multilanguage', descKey: 'home.trust_multilanguage_desc' },
              { icon: Heart, labelKey: 'home.trust_free', descKey: 'home.trust_free_desc' },
            ] as const).map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.labelKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: idx * 0.08, duration: 0.6 }}
                  className="glass-premium p-7 flex flex-col items-start text-start group border border-white/5 hover:border-icc-500/30 hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-icc-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="w-12 h-12 rounded-xl bg-icc-500/10 text-icc-400 border border-icc-500/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-icc-500/20 group-hover:text-icc-300 transition-all duration-300">
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 tracking-wide group-hover:text-icc-400 transition-colors duration-300">{t(feature.labelKey as TranslationKey)}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{t(feature.descKey as TranslationKey)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── QUALITATIVE STATS BAR ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: BookOpen, key: 'stat_daily_lessons' },
              { icon: ScrollText, key: 'stat_authentic' },
              { icon: Heart, key: 'stat_free_access' },
              { icon: BookOpenCheck, key: 'stat_structured' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: idx * 0.08, duration: 0.6 }}
                  className="glass-premium p-6 text-center relative overflow-hidden group hover:border-icc-500/30 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-icc-500/10 text-icc-400 border border-icc-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-icc-500/20 transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-white/50 tracking-wider uppercase font-semibold">{t(`home.${item.key}` as TranslationKey)}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STUDY CIRCLES ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400 text-xs font-semibold uppercase tracking-wider">
              {t('home.study_circles_badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {t('home.study_circles_title')}
            </h2>
            <p className="text-base text-white/50 max-w-xl mx-auto leading-relaxed">
              {t('home.study_circles_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {([
              { key: 'circle_tafsir', icon: BookOpen },
              { key: 'circle_riyadus', icon: Heart },
              { key: 'circle_bulugh', icon: BookOpenCheck },
              { key: 'circle_usul', icon: ScrollText },
              { key: 'circle_tawheed', icon: Award },
              { key: 'circle_tajreed', icon: BookOpen },
              { key: 'circle_bayquuniyyah', icon: Library },
              { key: 'circle_arbain', icon: BookOpenCheck },
            ] as const).map((circle, idx) => {
              const Icon = circle.icon;
              return (
                <motion.div
                  key={circle.key}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: idx * 0.05, duration: 0.6 }}
                  className="group relative overflow-hidden rounded-3xl border border-white/5 hover:border-icc-500/30 bg-[#0B0B0B]/80 hover:bg-slate-900/80 p-6 transition-all duration-500 shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-icc-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="relative space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-icc-500/10 text-icc-400 border border-icc-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-icc-500/20 transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-icc-400 transition-colors duration-300">
                      {t(`home.${circle.key}` as TranslationKey)}
                    </h3>
                    <p className="text-xs text-white/40 leading-relaxed">
                      {t(`home.${circle.key}_desc` as TranslationKey)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DAILY SCHEDULE ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              {t('home.schedule_badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {t('home.schedule_title')}
            </h2>
            <p className="text-base text-white/50 max-w-xl mx-auto leading-relaxed">
              {t('home.schedule_subtitle')}
            </p>
          </div>

          <div className="glass-premium overflow-hidden rounded-3xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-start text-xs font-bold text-white/60 uppercase tracking-wider">{t('home.schedule_time')}</th>
                  <th className="px-6 py-4 text-start text-xs font-bold text-white/60 uppercase tracking-wider">{t('home.schedule_class')}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { timeKey: 'schedule_5am', classKey: 'schedule_tafsir' },
                  { timeKey: 'schedule_630am', classKey: 'schedule_riyadus' },
                  { timeKey: 'schedule_8am', classKey: 'schedule_bulugh' },
                  { timeKey: 'schedule_930am', classKey: 'schedule_aqeedah' },
                  { timeKey: 'schedule_11am', classKey: 'schedule_closing' },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white font-bold">{t(`home.${row.timeKey}` as TranslationKey)}</td>
                    <td className="px-6 py-4 text-white/70">{t(`home.${row.classKey}` as TranslationKey)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-white/5 bg-white/5 text-center">
              <p className="text-xs text-white/40">{t('home.schedule_day_label')}</p>
              <p className="text-xs text-white/30 mt-1">{t('home.schedule_day_off')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESOURCE SHOWCASE (STREAMING SLIDERS) ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-20">
          
          {/* Slider 1: Audio Lectures */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400 text-xs font-semibold mb-3">
                  <Headphones className="w-3.5 h-3.5 text-icc-400" />
                  {t('home.section_audio_badge')}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {t('home.latest_audio')}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/audio" className="text-xs text-icc-400 hover:text-icc-300 font-bold flex items-center gap-1">
                  {t('common.view_all')}
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <div className="hidden sm:flex items-center gap-1.5">
                  <button 
                    onClick={() => slideLeft(audioSliderRef)}
                    className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-icc-500/30 flex items-center justify-center text-white transition-all active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <button 
                    onClick={() => slideRight(audioSliderRef)}
                    className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-icc-500/30 flex items-center justify-center text-white transition-all active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Slider Content */}
            <div 
              ref={audioSliderRef}
              className="flex gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory"
            >
              {loading ? (
                [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
              ) : audios.length === 0 ? (
                <p className="text-white/40 text-sm py-12 text-center w-full glass-premium">{t('home.no_audio')}</p>
              ) : (
                audios.map(item => (
                  <div key={item.id} className="snap-start">
                    <StreamingCard item={item} type="AUDIO" t={t} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Slider 2: Video Classes */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-3">
                  <Video className="w-3.5 h-3.5 text-purple-400" />
                  {t('home.section_video_badge')}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {t('home.latest_video')}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/videos" className="text-xs text-icc-400 hover:text-icc-300 font-bold flex items-center gap-1">
                  {t('common.view_all')}
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <div className="hidden sm:flex items-center gap-1.5">
                  <button 
                    onClick={() => slideLeft(videoSliderRef)}
                    className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-icc-500/30 flex items-center justify-center text-white transition-all active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <button 
                    onClick={() => slideRight(videoSliderRef)}
                    className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-icc-500/30 flex items-center justify-center text-white transition-all active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Slider Content */}
            <div 
              ref={videoSliderRef}
              className="flex gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory"
            >
              {loading ? (
                [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
              ) : videos.length === 0 ? (
                <p className="text-white/40 text-sm py-12 text-center w-full glass-premium">{t('home.no_video')}</p>
              ) : (
                videos.map(item => (
                  <div key={item.id} className="snap-start">
                    <StreamingCard item={item} type="VIDEO" t={t} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Slider 3: PDF Books */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-3">
                  <FileText className="w-3.5 h-3.5 text-red-400" />
                  {t('home.section_pdf_badge')}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {t('home.pdf_books')}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/pdfs" className="text-xs text-icc-400 hover:text-icc-300 font-bold flex items-center gap-1">
                  {t('common.view_all')}
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <div className="hidden sm:flex items-center gap-1.5">
                  <button 
                    onClick={() => slideLeft(pdfSliderRef)}
                    className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-icc-500/30 flex items-center justify-center text-white transition-all active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <button 
                    onClick={() => slideRight(pdfSliderRef)}
                    className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-icc-500/30 flex items-center justify-center text-white transition-all active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Slider Content */}
            <div 
              ref={pdfSliderRef}
              className="flex gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory"
            >
              {loading ? (
                [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
              ) : pdfs.length === 0 ? (
                <p className="text-white/40 text-sm py-12 text-center w-full glass-premium">{t('home.no_pdfs')}</p>
              ) : (
                pdfs.map(item => (
                  <div key={item.id} className="snap-start">
                    <StreamingCard item={item} type="PDF" t={t} />
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── LIVE BROADCAST CTA ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/10 border-b border-white/5 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-icc-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="glass-premium p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/10">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                liveState.isActive 
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30' 
                  : 'bg-white/5 text-white/40 border border-white/10'
              }`}>
                <Radio className="w-8 h-8" />
              </div>
              <div className="space-y-2 text-start">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-extrabold text-white">{t('home.live_broadcast_title')}</h3>
                  {liveState.isActive && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold shadow-[0_0_10px_rgba(239,68,68,0.15)]">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      {t('home.live_now')}
                    </span>
                  )}
                </div>
                <p className="text-white/50 text-sm md:text-base max-w-lg leading-relaxed">
                  {liveState.isActive
                    ? t('home.live_description_live')
                    : t('home.live_description_upcoming')}
                </p>
              </div>
            </div>

            <Link
              to="/live"
              className={`px-8 py-3.5 text-sm rounded-xl font-bold shrink-0 whitespace-nowrap flex items-center gap-2 transition-all duration-300 ${
                liveState.isActive
                  ? 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 shadow-lg shadow-red-500/30 hover:scale-[1.03]'
                  : 'btn-icc hover:scale-[1.03]'
              }`}
            >
              <Radio className="w-4.5 h-4.5" />
              {liveState.isActive ? t('home.join_live_stream') : t('home.view_schedule')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TELEGRAM CHANNELS ── */}
      <TelegramSection />



      {/* ── ABOUT SHEIKH SECTION (SPLIT LAYOUT WITH TIMELINE) ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-b border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Framed Portrait & Islamic Accents */}
            <div className="lg:col-span-5 relative group">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-icc-500 to-amber-500 opacity-20 blur-xl group-hover:opacity-35 transition-all duration-500 pointer-events-none" />
              <div className="relative rounded-3xl overflow-hidden border border-amber-400/30 p-2 bg-slate-950/80 shadow-2xl">
                {/* Decorative Islamic Geometric corner vectors */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-400/40 z-10 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-400/40 z-10 pointer-events-none" />
                
                <ResponsiveScholarImage
                  src="/images/sheikh-zabuur.jpg"
                  alt={t('home.about_image_alt')}
                  className="w-full h-[400px] rounded-2xl group-hover:scale-[1.01] transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right Column: Biography Content, Quotes & Timeline */}
            <div className="lg:col-span-7 space-y-8 text-start">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400 text-xs font-semibold uppercase tracking-wider">
                  {t('home.about_sheikh')}
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug" dangerouslySetInnerHTML={{ __html: t('home.about_subtitle_heading') }} />
                
              </div>

              {/* Biography quoting */}
              <div className="relative pl-6 border-l-2 border-icc-500/30 italic text-white/70 text-sm leading-relaxed max-w-2xl">
                <Quote className="absolute -left-3 -top-3 w-6 h-6 text-icc-500/10 fill-icc-500/5 rotate-180" />
                "{t('home.about_desc')}"
              </div>

              {/* Timeline milestones */}
              <div className="space-y-5">
                <h4 className="text-xs uppercase tracking-widest font-extrabold text-amber-400">{t('home.timeline_heading')}</h4>
                <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                  
                  {/* Item 1 */}
                  <div className="relative pl-7 flex gap-4 items-start">
                    <div className="absolute left-[5px] top-1.5 w-[7px] h-[7px] rounded-full bg-icc-500 ring-4 ring-icc-500/10" />
                    <div>
                      <p className="text-xs font-bold text-white">{t('home.timeline_education_title')}</p>
                      <p className="text-[11px] text-white/40">{t('home.timeline_education_desc')}</p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="relative pl-7 flex gap-4 items-start">
                    <div className="absolute left-[5px] top-1.5 w-[7px] h-[7px] rounded-full bg-amber-500 ring-4 ring-amber-500/10" />
                    <div>
                      <p className="text-xs font-bold text-white">{t('home.timeline_teaching_title')}</p>
                      <p className="text-[11px] text-white/40">{t('home.timeline_teaching_desc')}</p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="relative pl-7 flex gap-4 items-start">
                    <div className="absolute left-[5px] top-1.5 w-[7px] h-[7px] rounded-full bg-amber-500 ring-4 ring-amber-500/10" />
                    <div>
                      <p className="text-xs font-bold text-white">{t('home.timeline_advanced_title')}</p>
                      <p className="text-[11px] text-white/40">{t('home.timeline_advanced_desc')}</p>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="relative pl-7 flex gap-4 items-start">
                    <div className="absolute left-[5px] top-1.5 w-[7px] h-[7px] rounded-full bg-icc-500 ring-4 ring-icc-500/10" />
                    <div>
                      <p className="text-xs font-bold text-white">{t('home.timeline_continued_title')}</p>
                      <p className="text-[11px] text-white/40">{t('home.timeline_continued_desc')}</p>
                    </div>
                  </div>

                </div>
              </div>

              <div className="pt-2">
                <Link to="/about" className="btn-icc px-8 py-3.5 text-sm font-bold gap-2 hover:scale-[1.03] duration-300">
                  {t('home.read_biography')} 
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SOCIAL PRESENCE SECTION (FLOATING SOCIAL BAR) ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10 border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white tracking-wide">{t('home.connect_title')}</h3>
            <p className="text-xs text-white/45">{t('home.connect_subtitle')}</p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4">
            <a 
              href="https://youtube.com/@sheikhmahammadzabuur-b7f" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-[#FF0000]/10 border border-white/10 hover:border-[#FF0000]/40 text-xs font-bold text-white/80 hover:text-white transition-all hover:-translate-y-1 shadow-md hover:shadow-[#FF0000]/5"
            >
              <YoutubeIcon className="w-5 h-5 text-[#FF0000]" />
              {t('home.social_youtube')}
            </a>
            <a 
              href="https://t.me/sheikhmohammedzabuur" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-[#229ED9]/10 border border-white/10 hover:border-[#229ED9]/40 text-xs font-bold text-white/80 hover:text-white transition-all hover:-translate-y-1 shadow-md hover:shadow-[#229ED9]/5"
            >
              <TelegramIcon className="w-5 h-5 text-[#229ED9]" />
              {t('home.social_telegram')}
            </a>
            <a 
              href="https://facebook.com/profile.php?id=61555767907866" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-[#1877F2]/10 border border-white/10 hover:border-[#1877F2]/40 text-xs font-bold text-white/80 hover:text-white transition-all hover:-translate-y-1 shadow-md hover:shadow-[#1877F2]/5"
            >
              <FacebookIcon className="w-5 h-5 text-[#1877F2]" />
              {t('home.social_facebook')}
            </a>
            <a 
              href="https://www.tiktok.com/@sheikh.mahammad.z" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/40 text-xs font-bold text-white/80 hover:text-white transition-all hover:-translate-y-1 shadow-md"
            >
              <TiktokIcon className="w-4 h-4 text-white" />
              {t('home.social_tiktok')}
            </a>
            <Link 
              to="/about"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-icc-500/10 border border-white/10 hover:border-icc-500/40 text-xs font-bold text-white/80 hover:text-icc-400 transition-all hover:-translate-y-1 shadow-md"
            >
              <Globe className="w-4 h-4 text-icc-400" />
              {t('home.social_official_bio')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── GALLERY SECTION (INTERACTIVE LIGHTBOX) ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400 text-xs font-semibold uppercase tracking-wider">
              {t('home.gallery_badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {t('home.gallery_title')}
            </h2>
            <p className="text-base text-white/50 max-w-xl mx-auto leading-relaxed">
              {t('home.gallery_subtitle')}
            </p>
          </div>

          {/* Gallery grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[240px]">
            {GALLERY_IMAGES.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                onClick={() => setActiveImage(img.url)}
                className={`relative overflow-hidden rounded-3xl border border-white/15 cursor-pointer group bg-slate-900 ${
                  img.size === 'large' ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2' : ''
                }`}
              >
                <img 
                  src={img.url} 
                  alt={t(`home.${img.titleKey}` as TranslationKey)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h4 className="text-sm font-bold text-white tracking-wide">{t(`home.${img.titleKey}` as TranslationKey)}</h4>
                  <p className="text-[11px] text-icc-400 font-semibold mt-1">{t('home.gallery_click_expand')}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Lightbox Modal */}
          <AnimatePresence>
            {activeImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
              >
                <button 
                  onClick={() => setActiveImage(null)}
                  className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-all active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
                <motion.img 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  src={activeImage} 
                  alt={t('home.gallery_expanded_alt')} 
                  className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-white/10 shadow-2xl"
                />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* ── NEWSLETTER SECTION (REDESIGNED COMPLETE) ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden bg-slate-950">
        
        {/* Background gradient overlays */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-icc-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400 text-xs font-semibold uppercase tracking-wider">
            {t('home.newsletter_badge')}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
            {t('footer.stay_updated')}
          </h2>
          <p className="text-sm md:text-base text-white/50 max-w-md mx-auto leading-relaxed">
            {t('footer.newsletter_desc_alt')}
          </p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder={t('footer.email_placeholder_alt')}
              className="flex-1 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/20 transition-all duration-300 text-sm shadow-inner"
            />
            <button 
              type="submit" 
              className="btn-icc px-8 py-3.5 whitespace-nowrap font-bold text-sm bg-gradient-to-r from-icc-500 via-icc-600 to-amber-500 border border-icc-400/20 hover:scale-[1.03] active:scale-100 transition-all duration-300"
            >
              {t('footer.subscribe')}
            </button>
          </form>

          <p className="text-[11px] text-white/40 tracking-wide">
            {t('home.newsletter_no_spam')}
          </p>
        </div>
      </section>
    </div>
  );
}

// Inline Social Icon SVGs to bypass import issue
function YoutubeIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function TelegramIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
    </svg>
  );
}

function FacebookIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
    </svg>
  );
}

function TiktokIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  );
}
