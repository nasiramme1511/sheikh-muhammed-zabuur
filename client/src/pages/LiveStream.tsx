import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tv, Radio, Clock, MessageSquare, ExternalLink, Calendar, AlertCircle, Sparkles,
  Users, Eye, Download, Bell, BellOff, Mail, ThumbsUp, Monitor, PictureInPicture2,
  ChevronDown, ChevronUp, Share2, BookmarkPlus, Play, Heart, Send,
  Globe, BookOpen, LogIn, UserPlus, Hash, Star, ChevronRight,
  Layers, Headphones, Film, Volume2, Maximize2, Minimize2, List,
  Volume1, VolumeX, RotateCcw, CheckCircle, X, Loader2, Sun, Moon,
  Cloud, CloudSun, CloudRain, CloudLightning, CloudSnow, CloudDrizzle, Trash2,
} from 'lucide-react';
import { live as liveApi, resources as resourcesApi, telegram as telegramApi, newsletter as newsletterApi } from '../lib/api';
import { useSEO } from '../seo/metadata';
import { useAuth } from '../context/AuthContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import LoginWallModal from '../components/LoginWallModal';
import { useAIChat } from '../context/AIChatContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n';
import toast from 'react-hot-toast';

const CATEGORIES = ['Tafsir', 'Riyadhus Salihin', 'Bulugh Al-Maram', 'Tajreed', 'Usul', 'Aqeedah', 'Fiqh', 'Seerah'] as const;

const TELEGRAM_COLLECTIONS = [
  { name: 'Riyadh', slug: 'riyadhus-salihin' },
  { name: 'Tafsir', slug: 'tafsir' },
  { name: 'Bulugh', slug: 'bulugh-al-maram' },
  { name: 'Tajreed', slug: 'tajreed' },
  { name: 'Usul', slug: 'usul' },
  { name: 'Bayquniyyah', slug: 'bayquniyyah' },
  { name: 'Tawheed', slug: 'aqeedah' },
];

const DAILY_HADITH = 'The Prophet (ﷺ) said: "Whoever travels a path in search of knowledge, Allah makes easy for them a path to Paradise." (Muslim)';

const QURAN_VERSE = '"And whoever does righteous deeds, whether male or female, while being a believer — those will enter Paradise and will not be wronged, even as much as the speck on a date seed." (An-Nisa 4:124)';

interface UpcomingStream {
  id: string;
  title: string;
  description?: string;
  youtubeUrl?: string;
  scheduledFor: string;
  startDate?: string;
  duration?: number;
  status?: 'upcoming' | 'live' | 'ended';
  category?: string;
  collection?: string;
}

interface LivestreamState {
  url: string;
  isActive: boolean;
  title: string;
  chatUrl: string;
  youtubeChannelId: string;
  schedule: UpcomingStream[];
  viewers: number;
  totalViewers: number;
  totalStreams: number;
  totalWatchHours: number;
  activeSubscribers: number;
  recordingCollection?: string;
}

interface ResourceItem {
  id: number;
  title: string;
  type: string;
  url: string;
  thumbnail?: string;
  duration?: string;
  views?: number;
  createdAt?: string;
  collection?: string;
  category?: string;
}

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  return `${Math.floor(diff / 60000)}m ago`;
}

export default function LiveStream() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { openChat } = useAIChat();
  const { dir } = useLanguage();

  const { guardAction, showWall, closeWall } = useAuthGuard();

  const [state, setState] = useState<LivestreamState>({
    url: '', isActive: false, title: 'Weekly Islamic Class', chatUrl: '', youtubeChannelId: '', schedule: [],
    viewers: 0, totalViewers: 0, totalStreams: 0, totalWatchHours: 0, activeSubscribers: 0,
  });

  useSEO({
    title: 'Live Broadcast',
    description: 'Join the live Islamic broadcast by Sheikh Mohammed Zabuur. Watch live lectures, interact in real-time, and access recordings.',
    ogType: 'video.other',
    keywords: 'live stream, islamic lecture, sheikh mohammed zabuur, online learning, quran, sunnah',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: state.title || 'Sheikh Mohammed Zabuur Live Stream',
      description: 'Live Islamic broadcast by Sheikh Mohammed Zabuur',
      thumbnailUrl: '/uploads/images/roomaa-xiqqoo-masjid.jpg',
    },
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'guest' | 'registered' | 'subscribed'>('guest');
  const [recordings, setRecordings] = useState<ResourceItem[]>([]);
  const [recordingsLoading, setRecordingsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifLiveReminder, setNotifLiveReminder] = useState(true);
  const [notifUploads, setNotifUploads] = useState(true);
  const [notifTelegram, setNotifTelegram] = useState(true);
  const [theatreMode, setTheatreMode] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  interface ChatMessage {
    user: string;
    message: string;
    timestamp: Date;
    role?: 'admin' | 'student';
    pinned?: boolean;
  }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [statsAnimated, setStatsAnimated] = useState(false);

  useEffect(() => {
    if (user) setUserRole('registered');
    else setUserRole('guest');
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') setUserRole('subscribed');
  }, [user]);

  useEffect(() => {
    fetchLiveState();
    fetchRecordings();
    const liveTimer = setInterval(fetchLiveState, 30000);
    return () => { clearInterval(liveTimer); };
  }, []);

  const fetchLiveState = async () => {
    try {
      const res = await liveApi.get();
      setState((prev) => ({ ...prev, ...res.data }));
      if (!statsAnimated && res.data.totalStreams) {
        setStatsAnimated(true);
      }
    } catch (err) {
      console.error('Failed to load live state:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordings = async () => {
    setRecordingsLoading(true);
    try {
      const res = await resourcesApi.getRecent();
      const items = (Array.isArray(res.data) ? res.data : res.data?.data || res.data?.resources || [])
        .filter((r: ResourceItem) => r.type === 'VIDEO')
        .slice(0, 12);
      setRecordings(items);
    } catch {
      setRecordings([]);
    } finally {
      setRecordingsLoading(false);
    }
  };

  const isChannelUrl = (url: string) => /youtube\.com\/@|youtube\.com\/channel\//i.test(url);

  const getEmbedUrl = (url: string, channelId?: string) => {
    if (!url) {
      if (channelId) {
        return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=0&modestbranding=1&rel=0`;
      }
      return '';
    }
    if (isChannelUrl(url)) {
      if (channelId) {
        return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=0&modestbranding=1&rel=0`;
      }
      return '';
    }
    if (url.includes('youtube.com/embed/')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=0&modestbranding=1&rel=0`;
    }
    return url;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch { return dateStr; }
  };

  const handleSubscribe = async () => {
    if (!subEmail) { toast.error('Please enter your email'); return; }
    try {
      await newsletterApi.subscribe(subEmail);
      toast.success('Subscribed successfully!');
      setSubEmail('');
    } catch { toast.error('Subscription failed'); }
  };

  const handleAddReminder = (stream: UpcomingStream) => {
    const date = new Date(stream.scheduledFor || stream.startDate || '');
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(stream.title)}&dates=${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(date.getTime() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
    window.open(googleUrl, '_blank');
  };

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    const role = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? 'admin' : 'student';
    setChatMessages((prev) => [...prev, { user: user?.name || 'You', message: chatMessage.trim(), timestamp: new Date(), role }]);
    setChatMessage('');
  };

  const streamingUrl = state.url;
  const embedUrl = getEmbedUrl(streamingUrl, state.youtubeChannelId);
  const isChannel = isChannelUrl(streamingUrl);

  const [countdown, setCountdown] = useState<string>('');
  useEffect(() => {
    const nextStream = state.schedule
      .filter(s => s.status === 'upcoming' || !s.status)
      .sort((a, b) => new Date(a.scheduledFor || a.startDate || '').getTime() - new Date(b.scheduledFor || b.startDate || '').getTime())[0];
    if (!nextStream) { setCountdown(''); return; }
    const target = new Date(nextStream.scheduledFor || nextStream.startDate || '').getTime();
    if (!target) { setCountdown(''); return; }
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setCountdown('Starting soon'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [state.schedule]);

  // Simulate viewer count when live
  useEffect(() => {
    if (!state.isActive) return;
    const base = state.viewers || 0;
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 5) - 2;
      setState(prev => ({
        ...prev,
        viewers: Math.max(0, (prev.viewers || base) + delta),
        totalViewers: (prev.totalViewers || 0) + (delta > 0 ? delta : 0),
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, [state.isActive]);
  const filteredRecordings = activeCategory === 'All' ? recordings : recordings.filter((r) =>
    r.collection?.toLowerCase().includes(activeCategory.toLowerCase()) || r.category?.toLowerCase().includes(activeCategory.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900"
        style={{ background: 'linear-gradient(135deg, #041824 0%, #0a1f2e 50%, #041824 100%)' }}>
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
          </div>
          <p className="text-white/60 text-sm">Loading broadcast platform...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Streams', value: state.totalStreams || 0, icon: Radio, color: 'from-emerald-500/20 to-emerald-600/10' },
    { label: 'Total Viewers', value: state.totalViewers || 0, icon: Users, color: 'from-blue-500/20 to-blue-600/10' },
    { label: 'Watch Hours', value: state.totalWatchHours || 0, icon: Clock, color: 'from-amber-500/20 to-amber-600/10' },
    { label: 'Subscribers', value: state.activeSubscribers || 0, icon: Heart, color: 'from-rose-500/20 to-rose-600/10' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 text-white px-4 md:px-6 lg:px-8 bg-surface-900"
      style={{ background: 'linear-gradient(135deg, #041824 0%, #0a1f2e 50%, #041824 100%)' }}>
      <div className="max-w-[1440px] mx-auto">
        {/* ── PROFESSIONAL LIVE HERO ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 overflow-hidden rounded-3xl min-h-[320px] flex items-center">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/uploads/images/roomaa-xiqqoo-masjid.jpg')" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950/95 via-dark-950/80 to-dark-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/50 via-transparent to-emerald-900/20" />
          <div className="relative z-10 w-full px-8 py-12 md:py-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  state.isActive
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : countdown
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                }`}>
                  {state.isActive && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                  {state.isActive ? 'LIVE NOW' : countdown ? 'STARTING SOON' : 'OFFLINE'}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {state.title || 'Weekly Islamic Lecture'}
                </h1>
                <p className="text-lg text-amber-400/80 font-medium">Hosted by Sheikh Mohammed Zabuur</p>
                {countdown && !state.isActive && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-mono font-bold text-amber-400">{countdown}</span>
                    <span className="text-xs text-amber-400/60">until next stream</span>
                  </div>
                )}
                <p className="text-sm text-white/60 max-w-lg leading-relaxed">
                  Join thousands of learners benefiting from authentic Islamic knowledge.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {state.isActive && (
                    <button
                      onClick={() => guardAction(() => {
                        if (embedUrl) {
                          document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          window.open(streamingUrl, '_blank');
                        }
                      })}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/30">
                      <Play className="w-4 h-4" /> Watch Live
                    </button>
                  )}
                  <button
                    onClick={() => guardAction(() => window.open('https://t.me/sheikhmohammedzabuur', '_blank'))}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 rounded-xl text-sm font-medium transition-all">
                    <MessageSquare className="w-4 h-4" /> Join Telegram
                  </button>
                  <button onClick={() => { if (user) openChat(); else toast.error('Please login to ask a question'); }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all">
                    <Sparkles className="w-4 h-4" /> Ask Question
                  </button>
                </div>
              </div>
              <div className="hidden md:flex flex-col items-end gap-3">
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{formatCount(state.totalViewers || 0)}</p>
                  <p className="text-xs text-white/40">Total Viewers</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{formatCount(state.totalStreams || 0)}</p>
                  <p className="text-xs text-white/40">Total Broadcasts</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── STREAM INFORMATION CARDS ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Duration', value: '—', icon: Clock },
            { label: 'Category', value: 'Tafsir', icon: BookOpen },
            { label: 'Language', value: 'Afaan Oromoo', icon: Globe },
            { label: 'Teacher', value: 'Sheikh Mohammed Zabuur', icon: Users },
            { label: 'Collection', value: 'Riyadhus Salihin', icon: Layers },
          ].map((info) => (
            <div key={info.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-2">
                <info.icon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-white/40 uppercase tracking-wider">{info.label}</span>
              </div>
              <p className="text-sm font-bold truncate">{info.value}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Player Section ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8" id="player-section">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Player Column */}
            <div className={`flex-1 min-w-0 ${theatreMode ? 'max-w-full' : ''}`}>
              {/* Admin Stream Controls */}
              {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/[0.02] border border-emerald-500/20 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-400">Stream Controls</span>
                    </div>
                    <span className="text-[10px] text-white/40">
                      {state.viewers || 0} viewers &middot; Peak: {state.totalViewers || 0}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={async () => { try { await liveApi.update({ isActive: !state.isActive }); setState(prev => ({ ...prev, isActive: !prev.isActive })); toast.success(state.isActive ? 'Stream stopped' : 'Stream started'); } catch { toast.error('Failed to toggle stream'); } }}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${state.isActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}>
                      {state.isActive ? <X className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {state.isActive ? 'Stop Stream' : 'Start Stream'}
                    </button>
                    <button onClick={() => setShowScheduleForm(!showScheduleForm)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition-all">
                      <Calendar className="w-3.5 h-3.5" /> Schedule
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition-all">
                      <ExternalLink className="w-3.5 h-3.5" /> Edit Stream
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-medium text-red-400 transition-all">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                  {showScheduleForm && (
                    <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input value={scheduleTitle} onChange={(e) => setScheduleTitle(e.target.value)} placeholder="Stream title"
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-500/50" />
                      <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 [color-scheme:dark]" />
                      <button onClick={() => { if (scheduleTitle && scheduleDate) { toast.success('Stream scheduled!'); setShowScheduleForm(false); } else toast.error('Fill all fields'); }}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-semibold transition-all">Schedule Stream</button>
                    </div>
                  )}
                </div>
              )}

              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  state.isActive
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse'
                    : state.schedule.length > 0
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                }`}>
                  {state.isActive && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                  {state.isActive ? 'LIVE NOW' : state.schedule.length > 0 ? 'STARTING SOON' : 'OFFLINE'}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                  <Radio className="w-3 h-3" />
                  Broadcast
                </div>
                {state.isActive && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium">
                    <Eye className="w-3 h-3" />
                    {state.viewers && state.viewers > 0 ? `${formatCount(state.viewers)} watching` : 'No viewers yet'}
                  </div>
                )}
              </div>

              {/* Player */}
              <div className={`relative w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group ${theatreMode ? 'rounded-b-none' : ''}`}>
                <div className="aspect-video w-full relative">
                  {state.isActive && embedUrl ? (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      title={state.title}
                    />
                  ) : state.isActive ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-950 p-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                        <Play className="w-8 h-8 text-red-400" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">Live on YouTube</h3>
                      <p className="text-sm text-white/50 mb-5 max-w-md">The stream is active. Watch live on YouTube.</p>
                      <a href={streamingUrl || `https://youtube.com/@sheikhmahammadzabuur-b7f`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-600/30">
                        <Tv className="w-4 h-4" /> Watch on YouTube
                      </a>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-950 p-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <Tv className="w-8 h-8 text-white/30" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">Broadcast is Offline</h3>
                      <p className="text-sm text-white/50 max-w-md">Sheikh Mohammed Zabuur is not live right now. Check the schedule for upcoming classes.</p>
                    </div>
                  )}
                </div>

                {/* Player controls bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-black/80 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {state.isActive && (
                      <span className="flex items-center gap-1.5 text-xs text-red-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        LIVE
                      </span>
                    )}
                    <span className="text-xs text-white/40">{state.title || 'Sheikh Mohammed Zabuur'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setTheatreMode(!theatreMode)}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-all"
                      title={theatreMode ? 'Default view' : 'Theatre mode'}>
                      {theatreMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                    </button>
                    <a href={streamingUrl} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-all"
                      title="Open in YouTube">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Stream info */}
              {state.isActive && (
                <div className="mt-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xl">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <img src="/uploads/images/sheikh-zabuur.jpg" alt="Sheikh Zabuur" className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold mb-1">{state.title}</h2>
                      <p className="text-sm text-white/50 leading-relaxed">
                        Join Sheikh Mohammed Zabuur for this live session covering essential Islamic knowledge.
                        Stay engaged and ask questions via the live chat.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {state.chatUrl && (
                        <a href={state.chatUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-emerald-500/20">
                          <MessageSquare className="w-3.5 h-3.5" /> Join Chat
                        </a>
                      )}
                      <button onClick={() => { if (streamingUrl) window.open(streamingUrl, '_blank'); }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold transition-all">
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sheikh Profile Card */}
              <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/5 via-amber-500/[0.02] to-transparent border border-amber-500/10 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center overflow-hidden shrink-0">
                    <img src="/uploads/images/sheikh-zabuur.jpg" alt="Sheikh Mohammed Zabuur" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-amber-400">Sheikh Mohammed Zabuur</h3>
                    <p className="text-xs text-white/40">Scholar &amp; Islamic Educator</p>
                  </div>
                  <div className="hidden sm:flex flex-wrap gap-1.5">
                    {['Tafsir', 'Aqeedah', 'Fiqh'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400/80 border border-amber-500/20 text-[10px] font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Live Chat Sidebar ── */}
            {showChat && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col">
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xl flex flex-col h-[500px] lg:h-[calc(100vh-250px)]">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold">Live Chat</span>
                    </div>
                    <button onClick={() => setShowChat(false)} className="p-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {!user ? (
                      <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                          <MessageSquare className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="text-sm font-medium mb-1">Join the Discussion</p>
                        <p className="text-xs text-white/40 mb-4">Please log in to participate in the live chat.</p>
                        <a href="/login" className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-semibold transition-all">
                          <LogIn className="w-3.5 h-3.5" /> Login to Chat
                        </a>
                      </div>
                    ) : (
                      <>
                        {chatMessages.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-xs text-white/40">No messages yet. Be the first to send a message!</p>
                          </div>
                        )}
                        {chatMessages.filter(m => m.pinned).slice(0, 1).map((msg, i) => (
                          <div key={`pin-${i}`} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <div className="flex items-center gap-1.5 mb-1">
                              <AlertCircle className="w-3 h-3 text-amber-400" />
                              <span className="text-[9px] font-bold text-amber-400">PINNED</span>
                            </div>
                            <p className="text-[10px] font-bold text-amber-300 mb-0.5">{msg.user}</p>
                            <p className="text-xs text-amber-200/80">{msg.message}</p>
                          </div>
                        ))}
                        {chatMessages.map((msg, i) => (
                          <div key={i} className="flex gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                              msg.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'
                            }`}>
                              {msg.user.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                <span className={`text-[10px] font-bold ${
                                  msg.role === 'admin' ? 'text-emerald-400' : 'text-white/70'
                                }`}>{msg.user}</span>
                                {msg.role === 'admin' && <span className="px-1 py-[1px] rounded text-[7px] font-bold bg-emerald-500/20 text-emerald-400 uppercase leading-none">Admin</span>}
                                {msg.role === 'student' && <span className="px-1 py-[1px] rounded text-[7px] font-bold bg-white/10 text-white/40 uppercase leading-none">Student</span>}
                                <span className="text-[8px] text-white/30 ml-auto">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                              </div>
                              <p className="text-xs text-white/80 leading-relaxed">{msg.message}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Chat input */}
                  {user && (
                    <div className="p-3 border-t border-white/5">
                      <div className="flex gap-2">
                        <input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                          placeholder="Ask a question..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-500/50 transition-all" />
                        <button onClick={handleSendChat} disabled={!chatMessage.trim()}
                          className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pinned Announcements */}
                  <div className="px-4 py-2.5 border-t border-white/5 bg-amber-500/5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-400/80 leading-relaxed">Welcome! Please keep messages respectful and relevant to the topic.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Theatre mode toggle indicator */}
        {theatreMode && (
          <div className="flex justify-center -mt-1 mb-8">
            <button onClick={() => setTheatreMode(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-b-xl text-[10px] text-white/40 hover:text-white/70 transition-all">
              <ChevronUp className="w-3 h-3" /> Exit Theatre Mode
            </button>
          </div>
        )}

        {/* ── Show chat toggle button when hidden ── */}
        {!showChat && (
          <div className="fixed bottom-24 right-4 z-40">
            <button onClick={() => setShowChat(true)}
              className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-all">
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ── TWO-COLUMN LAYOUT: Left Main Content / Right Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mt-8">
          {/* ── LEFT COLUMN ── */}
          <div className="space-y-10">

            {/* ── Live Statistics ── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-2 mb-5">
                <Star className="w-4 h-4 text-emerald-400" />
                <h2 className="text-lg font-bold">Broadcast Analytics</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                  <div key={stat.label}
                    className="relative p-4 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 backdrop-blur-xl overflow-hidden group hover:border-white/10 transition-all">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-20`} />
                    <div className="relative z-10">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                        <stat.icon className="w-4 h-4 text-white/60" />
                      </div>
                      <p className="text-2xl font-bold">{formatCount(stat.value)}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* ── Upcoming Streams ── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-lg font-bold">Upcoming Classes</h2>
                </div>
                {state.schedule.length > 0 && (
                  <span className="text-[10px] text-white/40">{state.schedule.length} scheduled</span>
                )}
              </div>
              {state.schedule.length === 0 ? (
                <div className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-amber-400" />
                  </div>
                  <p className="text-base font-bold mb-1">📅 No Upcoming Classes Scheduled</p>
                  <p className="text-xs text-white/40 mb-5">Future classes will appear here when announced.</p>
                  <button onClick={() => { if (user) handleSubscribe(); else toast.error('Please login to subscribe'); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-emerald-500/20">
                    <Bell className="w-3.5 h-3.5" /> Subscribe For Notifications
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {state.schedule
                    .filter(s => s.status !== 'ended')
                    .sort((a, b) => new Date(a.scheduledFor || a.startDate || '').getTime() - new Date(b.scheduledFor || b.startDate || '').getTime())
                    .map((stream, idx) => (
                    <div key={stream.id || idx}
                      className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 backdrop-blur-xl hover:border-emerald-500/20 transition-all group">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <Radio className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold truncate">{stream.title}</h3>
                            {stream.category && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{stream.category}</span>
                            )}
                          </div>
                          {stream.description && (
                            <p className="text-[10px] text-white/50 mt-1 line-clamp-1">{stream.description}</p>
                          )}
                          <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {formatDate(stream.scheduledFor || stream.startDate || '')}
                          </p>
                          {stream.duration && (
                            <p className="text-[10px] text-white/40 mt-1">{stream.duration} min</p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => handleAddReminder(stream)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-semibold transition-all">
                              <Bell className="w-3 h-3" /> Remind Me
                            </button>
                            <button onClick={() => handleAddReminder(stream)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-medium transition-all">
                              <Calendar className="w-3 h-3" /> Calendar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>

            {/* ── Previous Recordings ── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-lg font-bold">Previous Recordings</h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['All', ...CATEGORIES].map((cat) => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        activeCategory === cat
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {recordingsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((s) => (
                    <div key={s} className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden animate-pulse">
                      <div className="aspect-video bg-white/5" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-white/5 rounded w-3/4" />
                        <div className="h-2 bg-white/5 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredRecordings.length === 0 ? (
                <div className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Film className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-base font-bold mb-1">🎥 No Recordings Available Yet</p>
                  <p className="text-xs text-white/40">Completed broadcasts will automatically appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredRecordings.map((rec) => (
                    <div key={rec.id}
                      className="group rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl overflow-hidden hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
                      <div className="aspect-video bg-black/50 relative overflow-hidden">
                        {rec.thumbnail ? (
                          <img src={rec.thumbnail} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/90 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          </div>
                        </div>
                        {rec.duration && (
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-[10px] font-medium">{rec.duration}</span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-xs font-bold truncate leading-snug">{rec.title}</h3>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-white/40">{rec.views ? `${formatCount(rec.views)} views` : timeAgo(rec.createdAt)}</span>
                          <a href={rec.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium">Watch</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-6">

            {/* Daily Hadith */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/[0.04] to-amber-500/[0.01] border border-amber-500/10 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-amber-400">Daily Hadith</h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed italic">{DAILY_HADITH}</p>
            </div>

            {/* Quran Verse */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/[0.04] to-emerald-500/[0.01] border border-emerald-500/10 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-emerald-400">Quran Verse</h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed italic">{QURAN_VERSE}</p>
            </div>

            {/* Social Media */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold">Official Links</h3>
              </div>
              <div className="space-y-2.5">
                <a href="https://youtube.com/@sheikhmahammadzabuur-b7f" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-red-500/[0.04] border border-red-500/10 hover:bg-red-500/[0.08] hover:border-red-500/30 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <Tv className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">YouTube</p>
                    <p className="text-[10px] text-white/40">@sheikhmahammadzabuur</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-red-400 transition-all shrink-0" />
                </a>
                <a href="https://www.tiktok.com/@sheikh.mahammad.z" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/20 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Play className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">TikTok</p>
                    <p className="text-[10px] text-white/40">@sheikh.mahammad.z</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white transition-all shrink-0" />
                </a>
                <a href="https://t.me/sheikhmohammedzabuur" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/[0.04] border border-sky-500/10 hover:bg-sky-500/[0.08] hover:border-sky-500/30 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Telegram</p>
                    <p className="text-[10px] text-white/40">@sheikhmohammedzabuur</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-sky-400 transition-all shrink-0" />
                </a>
              </div>
            </div>

            {/* Telegram Channels with Access Control */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold">Telegram Learning Communities</h3>
              </div>
              {userRole === 'guest' || !user ? (
                <div className="text-center py-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                    <LogIn className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-xs font-medium text-amber-400 mb-1">🔒 Login Required</p>
                  <p className="text-[10px] text-white/40 mb-3">Sign in to access Telegram learning communities.</p>
                  <a href="/login" className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-semibold transition-all">
                    <LogIn className="w-3 h-3" /> Sign In
                  </a>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {TELEGRAM_COLLECTIONS.map((ch) => (
                    <a key={ch.slug}
                      href={`https://t.me/sheikhmohammedzabuur`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-sky-500/20 transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-sky-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{ch.name}</p>
                        <p className="text-[10px] text-white/40">{userRole === 'subscribed' ? 'Full Access' : 'Join Telegram'}</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-sky-400 transition-all shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Center */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">Notifications</h3>
              </div>
              <div className="space-y-3 mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={notifEmail} onChange={() => setNotifEmail(!notifEmail)}
                    className="w-4 h-4 rounded bg-white/5 border border-white/20 accent-emerald-500" />
                  <span className="text-xs text-white/70">Email notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={notifLiveReminder} onChange={() => setNotifLiveReminder(!notifLiveReminder)}
                    className="w-4 h-4 rounded bg-white/5 border border-white/20 accent-emerald-500" />
                  <span className="text-xs text-white/70">Live reminders</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={notifUploads} onChange={() => setNotifUploads(!notifUploads)}
                    className="w-4 h-4 rounded bg-white/5 border border-white/20 accent-emerald-500" />
                  <span className="text-xs text-white/70">New uploads</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={notifTelegram} onChange={() => setNotifTelegram(!notifTelegram)}
                    className="w-4 h-4 rounded bg-white/5 border border-white/20 accent-emerald-500" />
                  <span className="text-xs text-white/70">Telegram announcements</span>
                </label>
              </div>
              {user ? (
                <div className="flex gap-2">
                  <input value={subEmail} onChange={(e) => setSubEmail(e.target.value)} placeholder="Your email"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-500/50" />
                  <button onClick={handleSubscribe} disabled={!subEmail}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 rounded-xl text-xs font-semibold transition-all whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
              ) : (
                <a href="/login" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition-all w-full justify-center">
                  <LogIn className="w-3.5 h-3.5" /> Login to Subscribe
                </a>
              )}
            </div>

            {/* AI Scholar */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/[0.06] to-emerald-500/[0.02] border border-emerald-500/10 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-emerald-400">Iman Chercher AI Scholar</h3>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed mb-4">
                Your Islamic learning companion powered by the content library of Sheikh Mohammed Zabuur.
              </p>
              <div className="mb-4 grid grid-cols-2 gap-1.5">
                {['Study Plans', 'Tafsir Guidance', 'Riyadh Recommendations', 'Usul Roadmaps', 'Tajreed Lessons', 'Arabic Learning'].map((feature) => (
                  <span key={feature} className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20 text-center">{feature}</span>
                ))}
              </div>
              <button onClick={() => { if (user) { openChat(); } else { toast.error('Please login to use AI Scholar'); } }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Ask AI Scholar
              </button>
            </div>
          </div>
        </div>
      </div>

      <LoginWallModal isOpen={showWall} onClose={closeWall} />
    </div>
  );
}
