import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Headphones, Video, FileText, Bookmark, Clock, ArrowRight, CloudDownload,
  Play, BookOpen, Activity, Calendar, Star, Award, Zap,
  Download, User, ChevronRight, Radio,
  Compass, Send, Flame, Timer, Heart, Library,
  BarChart3, BookMarked, GraduationCap, Users, WifiOff,
} from 'lucide-react';
import { FaTelegramPlane } from 'react-icons/fa';
import { dashboard, live, resources, telegram, telegramAccess } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { getCollectionBySlug } from '../../config/collections';
import { useOffline } from '../../context/OfflineContext';

interface DashboardData {
  stats: any;
  continueLearning: any[];
  recentActivity: any[];
  memberSince: string;
}

interface LiveStreamData {
  isLive: boolean;
  title?: string;
}

const collectionSlugs = [
  'riyadhus-salihin', 'tafsir-al-quran', 'bulugh-al-maram',
  'usul-ath-thalatha', 'tajweed', 'kitab-at-tawheed',
];

const dailyBenefits = [
  {
    type: 'Quran Verse',
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'Indeed, with hardship comes ease.',
    source: 'Surah Ash-Sharh, 94:6',
  },
  {
    type: 'Hadith',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    translation: 'The best among you are those who learn the Quran and teach it.',
    source: 'Sahih al-Bukhari',
  },
  {
    type: 'Dua',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    translation: 'My Lord, increase me in knowledge.',
    source: 'Surah Ta-Ha, 20:114',
  },
  {
    type: 'Reminder',
    arabic: 'وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ',
    translation: 'And remind, for indeed, the reminder benefits the believers.',
    source: 'Surah Adh-Dhariyat, 51:55',
  },
];

function CollectionProgress({ slug }: { slug: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    resources.getAll({ collection: slug, limit: 1 }).then(r => setData(r.data)).catch(() => {});
  }, [slug]);
  const col = getCollectionBySlug(slug);
  return (
    <Link to={`/collections/${slug}`} className="glass-premium p-4 group">
      <div className="flex items-center gap-3">
        <span className="text-2xl shrink-0">{col?.icon || '📖'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{col?.name || slug}</p>
          <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: data?.total ? `${Math.min(100, data.total * 15)}%` : '0%' }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-icc-500 to-icc-400"
            />
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
      </div>
    </Link>
  );
}

export default function DashboardHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { state } = useOffline();
  const [data, setData] = useState<DashboardData | null>(null);
  const [liveData, setLiveData] = useState<LiveStreamData | null>(null);
  const [telegramData, setTelegramData] = useState<any>(null);
  const [dailyIdx, setDailyIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const completed = state.resources.filter((r) => r.status === 'completed');
  const audioCount = completed.filter((r) => r.type === 'AUDIO').length;
  const videoCount = completed.filter((r) => r.type === 'VIDEO').length;
  const pdfCount = completed.filter((r) => r.type === 'PDF').length;
  const usedBytes = completed.reduce((sum, r) => sum + (r.fileSize || 0), 0);
  const usedMB = (usedBytes / 1048576).toFixed(1);

  useEffect(() => {
    setDailyIdx(Math.floor(Math.random() * dailyBenefits.length));
  }, []);

  useEffect(() => {
    Promise.all([
      dashboard.get().catch(() => null),
      live.get().catch(() => null),
      telegram.getStats().catch(() => ({ data: { total: 0 } })),
      telegram.checkAccess().catch(() => ({ data: { allowed: false } })),
    ]).then(([dRes, lRes, tRes, aRes]) => {
      if (dRes?.data) setData(dRes.data);
      if (lRes?.data) setLiveData(lRes.data);
      const total = tRes?.data?.total || 0;
      const subscribed = aRes?.data?.allowed || false;
      let latestName = '';
      if (subscribed) {
        telegramAccess.getAll().then(chRes => {
          const chs = chRes.data ?? [];
          if (chs.length > 0) setTelegramData((prev: any) => ({ ...prev!, latestName: chs[0].name }));
        }).catch(() => {});
      }
      setTelegramData({ total, latestName, subscribed });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="glass-premium p-6">
          <div className="h-8 bg-white/10 rounded w-64 mb-2" />
          <div className="h-4 bg-white/10 rounded w-96 mb-4" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const memberDate = data?.memberSince
    ? new Date(data.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'N/A';
  const totalEngagement = (stats.audioListened || 0) + (stats.videosWatched || 0) + (stats.pdfsDownloaded || 0);

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-premium p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-icc-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
        <p className="text-lg text-icc-400 font-arabic mb-2">السلام عليكم ورحمة الله وبركاته</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Assalamu Alaikum, <span className="text-icc-400">{user?.name || 'Student'}</span>
        </h1>
        <p className="text-white/50 text-sm mt-1 mb-5">
          Welcome to Sheikh Muhammed Zabuur Learning Portal.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
            <Calendar className="w-3.5 h-3.5 text-icc-400" /> Member since {memberDate}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
            <Activity className="w-3.5 h-3.5 text-blue-400" /> {totalEngagement} lectures
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> {stats.streak || 0} day streak
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
            <Timer className="w-3.5 h-3.5 text-purple-400" /> Study: {stats.studyHours || 0}h
          </span>
          {liveData?.isLive && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs text-red-400 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" /> LIVE NOW
            </span>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { icon: Headphones, label: 'Audio Completed', value: stats.audioListened || 0, color: 'from-icc-500 to-icc-600' },
          { icon: Video, label: 'Video Completed', value: stats.videosWatched || 0, color: 'from-blue-500 to-blue-600' },
          { icon: FileText, label: 'PDF Completed', value: stats.pdfsDownloaded || 0, color: 'from-purple-500 to-purple-600' },
          { icon: Download, label: 'Downloads', value: stats.totalDownloads || 0, color: 'from-amber-500 to-amber-600' },
          { icon: Bookmark, label: 'Bookmarks', value: stats.bookmarksSaved || 0, color: 'from-rose-500 to-rose-600' },
          { icon: Timer, label: 'Study Hours', value: `${stats.studyHours || 0}h`, color: 'from-teal-500 to-teal-600' },
          { icon: Flame, label: 'Learning Streak', value: `${stats.streak || 0}d`, color: 'from-orange-500 to-orange-600' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass-premium p-4 text-center group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:scale-110 transition-transform`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-bold text-white">{card.value}</p>
            <p className="text-[10px] text-white/50 leading-tight">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-premium p-5">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Play className="w-4 h-4 text-icc-400" /> Continue Learning
          </h2>
          {(!data?.continueLearning || data.continueLearning.length === 0) ? (
            <p className="text-sm text-white/40 py-4 text-center">No in-progress lessons. Start learning from the library!</p>
          ) : (
            <div className="space-y-2">
              {data.continueLearning.slice(0, 5).map((item: any, i: number) => {
                const lesson = item.lesson || item;
                const hasAudio = !!lesson.audioUrl;
                const hasVideo = !!lesson.videoUrl;
                const Icon = hasAudio ? Headphones : hasVideo ? Video : FileText;
                const color = hasAudio ? 'text-icc-400 bg-icc-500/10' : hasVideo ? 'text-blue-400 bg-blue-500/10' : 'text-purple-400 bg-purple-500/10';
                const progress = item.completed ? 100 : Math.min(95, Math.floor(Math.random() * 60 + 20));
                return (
                  <Link key={i} to={`/lessons/${lesson.slug || lesson.id}`} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon className="w-5 h-5" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{lesson.title}</p>
                      <p className="text-xs text-white/40 mt-0.5">Last opened: {new Date(item.updatedAt || lesson.createdAt).toLocaleDateString()}</p>
                      <div className="mt-1.5 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-icc-500 to-icc-400 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <button className="px-4 py-1.5 rounded-lg bg-icc-500 hover:bg-icc-600 text-white text-xs font-medium transition-all shrink-0">
                      Resume
                    </button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-premium p-5">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-5 text-rose-400" />
              <h3 className="text-sm font-semibold text-white">Daily Islamic Benefit</h3>
            </div>
            <div className="text-center py-3">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-icc-500/10 text-icc-400 border border-icc-500/20">
                {dailyBenefits[dailyIdx].type}
              </span>
              <p className="text-lg font-arabic text-white my-3 leading-relaxed">{dailyBenefits[dailyIdx].arabic}</p>
              <p className="text-sm text-icc-400 font-medium italic">{dailyBenefits[dailyIdx].translation}</p>
              <p className="text-[10px] text-white/40 mt-2">{dailyBenefits[dailyIdx].source}</p>
            </div>
          </div>

          <Link to="/dashboard/downloads" className="glass-premium p-5 block group hover:border-icc-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icc-500 to-icc-600 flex items-center justify-center shrink-0">
                  <CloudDownload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Download Center</p>
                  <p className="text-[10px] text-white/50">{audioCount} Audio · {videoCount} Video · {pdfCount} PDF</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-icc-400">{usedMB} MB</p>
                <p className="text-[10px] text-white/40">used</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-premium p-5">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Library className="w-4 h-4 text-icc-400" /> My Study Circles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {collectionSlugs.slice(0, 8).map(slug => (
              <CollectionProgress key={slug} slug={slug} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-premium p-5">
            <div className="flex items-center gap-2 mb-3">
              <FaTelegramPlane className="w-4 h-5 text-[#0088cc]" />
              <h2 className="text-sm font-semibold text-white/70">Telegram Communities</h2>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-2xl font-bold text-white">{telegramData?.total || 0}</p>
                <p className="text-xs text-white/50">Channels</p>
              </div>
              <a href="/telegram" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 text-[#0088cc] text-xs font-medium hover:bg-[#0088cc]/20 transition-all">
                <Send className="w-3.5 h-3.5" /> Join
              </a>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-white/5">
              <span className={`w-2 h-2 rounded-full ${telegramData?.subscribed ? 'bg-green-400' : 'bg-white/20'}`} />
              <span className="text-xs text-white/50">{telegramData?.subscribed ? 'Subscribed' : 'Not Subscribed'}</span>
            </div>
          </div>

          <div className="glass-premium p-5">
            <Link to="/dashboard/bookmarks" className="flex items-center gap-3 mb-4">
              <BookMarked className="w-4 h-5 text-amber-400" />
              <h2 className="text-sm font-semibold text-white/70">Bookmark Center</h2>
              <span className="ml-auto text-xs text-white/40">{stats.bookmarksSaved || 0} saved</span>
            </Link>
            {(stats.bookmarksSaved || 0) > 0 ? (
              <Link to="/dashboard/bookmarks" className="text-xs text-icc-400 hover:underline">View all bookmarks</Link>
            ) : (
              <p className="text-xs text-white/40">No bookmarks yet. Save lessons for quick access!</p>
            )}
          </div>
        </div>
      </div>

      {liveData?.isLive && (
        <a href="/live" className="glass-premium p-5 flex items-center justify-between group hover:border-red-500/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center animate-pulse">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Live Stream Active</p>
              <p className="text-xs text-white/50">{liveData?.title || 'Join the broadcast'}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Watch Live
          </span>
        </a>
      )}
    </div>
  );
}
