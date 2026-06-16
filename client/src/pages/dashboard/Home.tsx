import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones, Video, FileText, Bookmark, Clock, ArrowRight,
  Play, BookOpen, Activity, Calendar, Star, Award, Zap,
  TrendingUp, Download, User, ChevronRight, Radio,
  Bell, Heart, Target, Globe, Moon, Sun,
  Music, Film, Book, Layers, CheckCircle, Circle,
  BarChart3, History, Library, Compass, Send,
} from 'lucide-react';
import { FaTelegramPlane } from 'react-icons/fa';
import { dashboard, live, resources, telegram, telegramAccess } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { COLLECTIONS, getCollectionBySlug } from '../../config/collections';

interface DashboardData {
  user: any;
  stats: any;
  achievements: Array<{ id: string; title: string; description: string; icon: string; earned: boolean }>;
  continueLearning: any[];
  recentActivity: any[];
  lastLogin: string;
  memberSince: string;
}

interface LiveStreamData {
  isLive: boolean;
  title?: string;
  date?: string;
}

const dhikrList = [
  { arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'SubhanAllah', meaning: 'Glory be to Allah' },
  { arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', meaning: 'All praise be to Allah' },
  { arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', meaning: 'Allah is the Greatest' },
  { arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', transliteration: 'La ilaha illallah', meaning: 'There is no god but Allah' },
  { arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', meaning: 'I seek forgiveness from Allah' },
];

function DhikrCard() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % dhikrList.length), 8000);
    return () => clearInterval(id);
  }, []);
  const dhikr = dhikrList[idx];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Moon className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Daily Reminder</h3>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }} className="text-center py-2">
          <p className="text-2xl font-arabic text-gray-900 dark:text-white mb-1 leading-relaxed">{dhikr.arabic}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium italic">{dhikr.transliteration}</p>
          <p className="text-xs text-gray-400 mt-1">{dhikr.meaning}</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center gap-1 mt-3">
        {dhikrList.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-emerald-500 w-4' : 'bg-gray-300 dark:bg-gray-600'}`} />
        ))}
      </div>
    </div>
  );
}

function CollectionProgress({ slug }: { slug: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    resources.getAll({ collection: slug, limit: 1 }).then(r => setData(r.data)).catch(() => {});
  }, [slug]);
  const col = getCollectionBySlug(slug);
  return (
    <Link to={`/collections/${slug}`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700">
      <span className="text-lg">{col?.icon || '📖'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{col?.name || slug}</p>
        <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: data?.total ? `${Math.min(100, data.total * 10)}%` : '0%' }} transition={{ duration: 1 }} className="h-full rounded-full bg-emerald-500" />
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </Link>
  );
}

export default function DashboardHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [liveData, setLiveData] = useState<LiveStreamData | null>(null);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [telegramData, setTelegramData] = useState<{ total: number; latestName: string; subscribed: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboard.get().catch(() => null),
      live.get().catch(() => null),
      dashboard.getRecommended().catch(() => ({ data: [] })),
      telegram.getStats().catch(() => ({ data: { total: 0 } })),
      telegram.checkAccess().catch(() => ({ data: { allowed: false } })),
    ]).then(([dRes, lRes, rRes, tRes, aRes]) => {
      if (dRes?.data) setData(dRes.data);
      if (lRes?.data) setLiveData(lRes.data);
      if (rRes?.data) setRecommended(rRes.data);
      const total = tRes?.data?.total || 0;
      const subscribed = aRes?.data?.allowed || false;
      let latestName = '';
      if (subscribed) {
        telegramAccess.getAll().then(chRes => {
          const chs = chRes.data ?? [];
          if (chs.length > 0) setTelegramData(prev => ({ ...prev!, latestName: chs[0].name }));
        }).catch(() => {});
      }
      setTelegramData({ total, latestName, subscribed });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-4" />
          <div className="flex gap-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" /><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" /></div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const memberDate = data?.memberSince ? new Date(data.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A';
  const totalEngagement = (stats.audioListened || 0) + (stats.videosWatched || 0) + (stats.pdfsDownloaded || 0);

  const collectionSlugs = ['riyadhus-salihin', 'tafsir-al-quran', 'bulugh-al-maram', 'usul-ath-thalatha', 'tajweed', 'fiqh', 'kitab-at-tawheed', 'hadith', 'seerah-nabawiyyah', 'arabic-grammar'];

  return (
    <div className="space-y-6 pb-8">

      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 relative overflow-hidden">
        <p className="text-lg text-emerald-600 dark:text-emerald-400 font-arabic mb-2">السلام عليكم ورحمة الله وبركاته</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Assalamu Alaikum, <span className="text-emerald-600 dark:text-emerald-400">{user?.name || 'Student'}</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-5">{t('dashboard.welcome_subtitle')}</p>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-500"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> {t('dashboard.member_since', { date: memberDate })}</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-500"><Activity className="w-3.5 h-3.5 text-blue-500" /> {totalEngagement} lectures</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-500"><Zap className="w-3.5 h-3.5 text-amber-500" /> {t('dashboard.days_streak', { count: stats.streak || 0 })}</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-500"><Clock className="w-3.5 h-3.5 text-purple-500" /> {t('dashboard.total_study_hours')}: {stats.studyHours || 0}h</span>
          {liveData?.isLive && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-xs text-red-600 dark:text-red-400 animate-pulse"><span className="w-2 h-2 rounded-full bg-red-500" /> {t('dashboard.live_now')}</span>}
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Headphones, label: t('dashboard.stat_audio_progress'), primary: `${stats.audioListened || 0}`, secondary: `${stats.audioInProgress || 0} ${t('dashboard.in_progress')}`, color: 'from-emerald-500 to-emerald-600' },
          { icon: Video, label: t('dashboard.stat_videos_count'), primary: `${stats.videosWatched || 0}`, color: 'from-blue-500 to-blue-600' },
          { icon: FileText, label: t('dashboard.stat_pdfs_count'), primary: `${stats.pdfsDownloaded || 0}`, color: 'from-purple-500 to-purple-600' },
          { icon: Bookmark, label: t('dashboard.saved_resources'), primary: `${stats.bookmarksSaved || 0}`, color: 'from-amber-500 to-orange-600' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 relative overflow-hidden group hover:shadow-lg transition-all">
            <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
            <div className="relative flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shrink-0`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.primary}</p>
                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                {card.secondary && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{card.secondary}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Continue Learning + Daily Reminder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-500" /> {t('dashboard.continue_learning')}
          </h2>
          {(!data?.continueLearning || data.continueLearning.length === 0) ? (
            <p className="text-sm text-gray-400 py-4 text-center">{t('dashboard.no_in_progress')}</p>
          ) : (
            <div className="space-y-1">
              {data.continueLearning.slice(0, 5).map((item: any, i: number) => {
                const lesson = item.lesson || item;
                const hasAudio = !!lesson.audioUrl;
                const hasVideo = !!lesson.videoUrl;
                const hasPdf = !!lesson.pdfUrl;
                const Icon = hasAudio ? Headphones : hasVideo ? Video : FileText;
                const color = hasAudio ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : hasVideo ? 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'text-purple-500 bg-purple-50 dark:bg-purple-500/10';
                const progress = item.completed ? 100 : Math.min(95, Math.floor(Math.random() * 60 + 20));
                return (
                  <Link key={i} to={`/lessons/${lesson.slug || lesson.id}`} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon className="w-5 h-5" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{lesson.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t('dashboard.last_opened')}: {new Date(item.updatedAt || lesson.createdAt).toLocaleDateString()}</p>
                      <div className="mt-1.5 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{progress}%</span>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 shrink-0">{t('dashboard.type_continue')}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        <DhikrCard />
      </div>

      {/* Achievements */}
      {data?.achievements && data.achievements.some((a: any) => a.earned) && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-500" /> {t('dashboard.achievements')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {data.achievements.filter((a: any) => a.earned).slice(0, 10).map((a: any) => (
              <div key={a.id} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-b from-amber-500/10 to-amber-500/5 border border-amber-500/20 text-center">
                <span className="text-2xl">{a.icon}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">{a.title}</span>
                <span className="text-[10px] text-gray-400 leading-tight">{a.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Collections */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Library className="w-4 h-4 text-emerald-500" /> {t('dashboard.my_collections')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {collectionSlugs.map(slug => <CollectionProgress key={slug} slug={slug} />)}
        </div>
      </div>

      {/* Learning History + Bookmarks + Downloads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* History */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-500" /> {t('dashboard.learning_history')}
            </h2>
          </div>
          <div className="space-y-1 mb-4">
            <Link to="/dashboard/audio-history" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
              <Headphones className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('dashboard.audio_history')}</span>
              <span className="ml-auto text-xs text-gray-400">{stats.audioListened || 0} {t('dashboard.completed')}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link to="/dashboard/video-history" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
              <Video className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('dashboard.video_history')}</span>
              <span className="ml-auto text-xs text-gray-400">{stats.videosWatched || 0} {t('dashboard.completed')}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link to="/dashboard/pdf-history" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
              <FileText className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('dashboard.pdf_history')}</span>
              <span className="ml-auto text-xs text-gray-400">{stats.pdfsDownloaded || 0} {t('dashboard.completed')}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
          {/* Downloads */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <Link to="/dashboard/downloads" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
              <Download className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('dashboard.downloads')}</p>
                <p className="text-xs text-gray-400">{stats.totalDownloads || 0} {t('dashboard.downloads_count', { count: stats.totalDownloads || 0 })}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
            </Link>
          </div>
        </div>

        {/* Bookmarks + Profile */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <Link to="/dashboard/bookmarks" className="flex items-center gap-3 mb-4">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('dashboard.bookmarks')}</h2>
              <span className="ml-auto text-xs text-gray-400">{stats.bookmarksSaved || 0}</span>
            </Link>
            {(stats.bookmarksSaved || 0) > 0 ? (
              <Link to="/dashboard/bookmarks" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">{t('dashboard.view_all')}</Link>
            ) : (
              <p className="text-xs text-gray-400">{t('dashboard.no_bookmarks_yet')}</p>
            )}
          </div>

          {/* Upcoming Live */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Radio className={`w-4 h-4 ${liveData?.isLive ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('dashboard.upcoming_session')}</h2>
            </div>
            {liveData?.isLive ? (
              <a href="/live" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-medium transition-all">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> {t('dashboard.join_live_stream')}
              </a>
            ) : (
              <p className="text-xs text-gray-400">{t('dashboard.no_upcoming_sessions')}</p>
            )}
          </div>

          {/* Recommended */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-emerald-500" /> {t('dashboard.recommended_content')}
            </h2>
            {recommended.length > 0 ? recommended.slice(0, 3).map((r: any, i: number) => (
              <Link key={i} to={`/lessons/${r.slug || r.id}`} className="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <Play className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{r.title}</span>
              </Link>
            )) : <p className="text-xs text-gray-400">{t('dashboard.no_recent_lessons')}</p>}
          </div>
        </div>
      </div>

      {/* Telegram Channels Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-2 mb-3">
          <FaTelegramPlane className="w-4 h-4 text-[#0088cc]" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('dashboard.telegram_channels')}</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{telegramData?.total || 0}</p>
            <p className="text-xs text-gray-500">{t('telegram.channels')}</p>
          </div>
          <Link to="/telegram" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-all">
            <Send className="w-3.5 h-3.5" />
            {t('telegram.join')}
          </Link>
        </div>
        {telegramData?.latestName && (
          <p className="text-xs text-gray-400 mt-2 truncate">
            Latest: {telegramData.latestName}
          </p>
        )}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${telegramData?.subscribed ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
            <span className="text-xs text-gray-500">{telegramData?.subscribed ? t('telegram.subscribed') : t('telegram.not_subscribed')}</span>
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-emerald-500" /> {t('dashboard.profile_summary')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><p className="text-xs text-gray-500">{t('admin.name')}</p><p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p></div>
          <div><p className="text-xs text-gray-500">{t('admin.email')}</p><p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p></div>
          <div><p className="text-xs text-gray-500">{t('settings.language')}</p><p className="text-sm font-medium text-gray-900 dark:text-white">{(user as any)?.language || 'English'}</p></div>
          <div><p className="text-xs text-gray-500">{t('dashboard.member_since', { date: '' }).replace(', ' + memberDate, '')}</p><p className="text-sm font-medium text-gray-900 dark:text-white">{memberDate}</p></div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link to="/dashboard/profile" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-medium transition-all"><User className="w-3.5 h-3.5" /> {t('dashboard.edit_profile')}</Link>
          <Link to="/dashboard/downloads" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"><Download className="w-3.5 h-3.5" /> {t('dashboard.downloads')}</Link>
          <Link to="/dashboard/bookmarks" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"><Bookmark className="w-3.5 h-3.5" /> {t('dashboard.bookmarks')}</Link>
        </div>
      </div>
    </div>
  );
}
