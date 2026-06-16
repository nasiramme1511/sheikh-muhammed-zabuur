import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Music, Video, FileText, Radio, Tv, ArrowRight,
  Play, Download, Eye, Sparkles, BookOpen, ChevronRight,
  Star, BookMarked, BookA, MessageCircle, GraduationCap,
  ScrollText, UserRound, Languages, Heart, Library,
  Minus, Quote, TrendingUp
} from 'lucide-react';
import { resources as resourcesApi, collections as collectionsApi, live as liveApi } from '../lib/api';
import { COLLECTIONS, COLLECTION_COLORS } from '../config/collections';
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
  Aqeedah: '⭐',
  Hadith: '📖',
  Tafsir: '📜',
  Fiqh: '⚖️',
  Seerah: '🕌',
  Tajweed: '🎵',
  Arabic: '📝',
  Usul: '🏛️',
  Manhaj: '🗺️',
  Adab: '🌸',
  Khutbah: '🎙️',
  Ramadan: '🌙',
  'Questions & Answers': '❓',
  General: '📚',
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">
        {count}{suffix}
      </div>
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

    keywords: 'Sheikh Muhammed Zabuur, Iman Chercher College, Islamic learning, online Islamic education, learn Quran, Aqeedah, Tafsir, Hadith, Fiqh, Islamic courses online, free Islamic education, learn Islam online, Arabic, Amharic, Afaan Oromo',
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

  return (
    <div className="min-h-screen text-white">
      {/* ── HERO ───────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          backgroundImage: `url("${settings.backgroundImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(135deg, rgba(2, 48, 32, 0.85) 0%, rgba(2, 24, 16, 0.6) 40%, rgba(0, 0, 0, 0.3) 100%)'
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,_#F59E0B_1.5px,_transparent_1.5px)] bg-[length:40px_40px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-16 w-full">
          <div className="max-w-4xl mx-auto text-center">
            {liveState.isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider mb-6 cursor-pointer"
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('hero.badge')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]"
            >
              <span className="block text-white">{t('hero.title_line1')}</span>
              <span className="block icc-gradient-text py-1">{t('hero.title_line2')}</span>
              <span className="block text-2xl md:text-3xl font-semibold text-white/60 mt-3">
                {t('home.platform_name')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              {t('home.hero_desc_alt')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-16"
            >
              <Link to="/audio" className="btn-icc gap-2 px-6 py-3 text-sm">
                <Music className="w-4 h-4" /> {t('home.listen_to_audio')}
              </Link>
              <Link to="/videos" className="btn-icc gap-2 px-6 py-3 text-sm bg-emerald-600">
                <Video className="w-4 h-4" /> {t('home.watch_videos')}
              </Link>
              <Link to="/pdfs" className="btn-outline gap-2 px-6 py-3 text-sm">
                <FileText className="w-4 h-4" /> {t('home.read_pdfs')}
              </Link>
              <Link to="/live" className={`gap-2 px-6 py-3 text-sm rounded-xl font-semibold flex items-center transition-all ${
                liveState.isActive
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30'
                  : 'btn-outline'
              }`}>
                <Radio className="w-4 h-4" />
                {liveState.isActive ? t('home.join_live_stream') : t('home.live_stream')}
              </Link>
            </motion.div>

            {/* Real Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto">
              <CounterStat value={stats.audio} label={t('home.audio_lectures_stat')} icon={Music} />
              <CounterStat value={stats.video} label={t('home.video_classes_stat')} icon={Video} />
              <CounterStat value={stats.pdf} label={t('home.pdf_books_stat')} icon={FileText} />
              <CounterStat value={stats.total} label={t('common.loading') === 'Loading...' ? t('resources.total_resources_label') || 'Resources' : 'Resources'} icon={Library} />
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t('home.topics_covered')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/category/${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`}
                className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl border transition-all hover:scale-105 hover:shadow-lg ${CAT_COLORS[cat] || 'bg-white/5 text-white/60 border-white/10'}`}
              >
                <span className="text-2xl">{CATEGORY_ICONS[cat] || '📚'}</span>
                <span className="text-xs font-semibold text-center leading-tight">{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COLLECTIONS ───────────────────────── */}
      {Object.keys(collectionStats).length > 0 && (
        <section className="py-12 px-4 md:px-8 bg-dark-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Featured Collections</h2>
                <p className="text-sm text-white/50">Browse resources by collection</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {COLLECTIONS.filter(c => {
                const stats = collectionStats[c.slug];
                if (!stats) return false;
                const total = (stats.audio || 0) + (stats.video || 0) + (stats.pdf || 0);
                return total > 0;
              }).map(c => {
                const stats = collectionStats[c.slug];
                const total = (stats.audio || 0) + (stats.video || 0) + (stats.pdf || 0);
                return (
                  <Link
                    key={c.slug}
                    to={`/collections/${c.slug}`}
                    className={`flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl border transition-all hover:scale-105 hover:shadow-lg ${COLLECTION_COLORS[c.slug] || 'bg-white/5 text-white/60 border-white/10'}`}
                  >
                    <span className="text-xl">{c.icon}</span>
                    <span className="text-xs font-semibold text-center leading-tight">{c.name}</span>
                    <div className="flex items-center gap-2 text-[10px] mt-1">
                      {stats.audio > 0 && <span className="opacity-70">🎧 {stats.audio}</span>}
                      {stats.video > 0 && <span className="opacity-70">🎬 {stats.video}</span>}
                      {stats.pdf > 0 && <span className="opacity-70">📄 {stats.pdf}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED CONTENT ────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-12 px-4 md:px-8 bg-gradient-to-br from-emerald-950/20 to-dark-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t('resources.most_downloaded').replace('Most Downloaded', 'Featured Content') || 'Featured Content'}</h2>
                  <p className="text-sm text-white/50">Handpicked resources by Sheikh Mohammed Zabuur</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((item, idx) => {
                const isPdf = item.resourceType === 'PDF';
                const isAudio = item.resourceType === 'AUDIO';
                const isVideo = item.resourceType === 'VIDEO';
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card p-4 flex flex-col gap-3 group hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isPdf ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        isAudio ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {isPdf ? <FileText className="w-5 h-5" /> : isAudio ? <Music className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`inline-block mb-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${CAT_COLORS[item.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
                          {item.category}
                        </span>
                        <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-emerald-400 transition-colors">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.views}</span>
                      <Link
                        to={isPdf ? '/pdfs' : isAudio ? '/audio' : '/videos'}
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
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

      {/* ── LATEST AUDIO ───────────────────────────────── */}
      <section className="py-12 px-4 md:px-8 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t('home.latest_audio')}</h2>
                <p className="text-sm text-white/50">{t('home.latest_audio_desc')}</p>
              </div>
            </div>
            <Link to="/audio" className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              {t('common.view_all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? [1,2,3,4,5,6,7,8].slice(0, 8).map(i => <SkeletonCard key={i} />)
              : audios.length === 0
                ? <p className="text-white/40 text-sm col-span-4 py-8 text-center">{t('home.no_audio')}</p>
                : audios.slice(0, 8).map((audio, idx) => (
                  <motion.div
                    key={audio.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="glass-card p-5 flex flex-col gap-4 group hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Music className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className={`inline-block mb-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${CAT_COLORS[audio.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
                          {audio.category}
                        </span>
                        <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-emerald-400 transition-colors leading-snug">
                          {audio.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{audio.views}</span>
                      <Link
                        to="/audio"
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        <Play className="w-3.5 h-3.5" /> {t('home.listen')}
                      </Link>
                    </div>
                  </motion.div>
                ))
            }
          </div>
        </div>
      </section>

      {/* ── LATEST VIDEOS ──────────────────────────────── */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t('home.latest_video')}</h2>
                <p className="text-sm text-white/50">{t('home.latest_video_desc')}</p>
              </div>
            </div>
            <Link to="/videos" className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              {t('common.view_all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? [1,2,3,4,5,6,7,8].slice(0, 8).map(i => <SkeletonCard key={i} />)
              : videos.length === 0
                ? <p className="text-white/40 text-sm col-span-4 py-8 text-center">{t('home.no_video')}</p>
                : videos.slice(0, 8).map((video, idx) => {
                  const ytId = getYoutubeId(video.url);
                  return (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="glass-card overflow-hidden group cursor-pointer hover:border-purple-500/30 transition-all"
                    >
                      <div className="aspect-video bg-dark-950 relative overflow-hidden">
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
                          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 text-white pl-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <span className={`inline-block mb-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${CAT_COLORS[video.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
                          {video.category}
                        </span>
                        <Link to="/videos" className="block text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
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

      {/* ── LATEST PDFs ────────────────────────────────── */}
      <section className="py-12 px-4 md:px-8 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t('home.pdf_books')}</h2>
                <p className="text-sm text-white/50">{t('home.pdf_books_desc')}</p>
              </div>
            </div>
            <Link to="/pdfs" className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              {t('common.view_all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? [1,2,3,4,5,6,7,8].slice(0, 8).map(i => <SkeletonCard key={i} />)
              : pdfs.length === 0
                ? <p className="text-white/40 text-sm col-span-4 py-8 text-center">{t('home.no_pdfs')}</p>
                : pdfs.slice(0, 8).map((pdf, idx) => (
                  <motion.div
                    key={pdf.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="glass-card p-5 flex flex-col gap-4 group hover:border-red-500/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className={`inline-block mb-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${CAT_COLORS[pdf.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
                          {pdf.category}
                        </span>
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

      {/* ── TELEGRAM CHANNELS ──────────────────────────── */}
      <TelegramSection />

      {/* ── ABOUT CTA STRIP ────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-emerald-950/30 to-dark-900">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-2">{t('home.about_shaykh')}</h3>
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
    </div>
  );
}