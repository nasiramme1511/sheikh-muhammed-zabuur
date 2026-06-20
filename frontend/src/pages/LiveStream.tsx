import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Tv, Radio, Clock, ExternalLink, Calendar, Play, MessageSquare, Send,
  Globe, BookOpen, ChevronDown, ChevronUp, Monitor, Minimize2, X, Loader2, Trash2,
} from 'lucide-react';
import { live as liveApi, resources as resourcesApi } from '../lib/api';
import { useSEO } from '../seo/metadata';
import { useAuth } from '../context/AuthContext';
import ResponsiveScholarImage from '../components/ResponsiveScholarImage';
import toast from 'react-hot-toast';

const RECORDING_FILTERS = [
  'All', 'Tafsir', 'Riyadus Salihin', 'Bulugh al-Maram', 'Usul ath-Thalathah',
  'Kitab at-Tawheed', 'Tajreed', 'Al-Bayquniyyah', "Al-Arba'in an-Nawawiyyah",
  'Sahih al-Bukhari', 'Umdat al-Ahkam', 'General Lectures',
];

const WEEKLY_SCHEDULE = [
  { day: 'Saturday', lessons: [
    { time: '05:00 AM', title: 'Tafsir Al-Qur\'an' },
    { time: '06:30 AM', title: 'Riyadus Salihin' },
    { time: '08:00 AM', title: 'Bulugh al-Maram' },
    { time: '09:30 AM', title: 'Usul ath-Thalathah' },
    { time: '10:30 AM', title: 'Kitab at-Tawheed' },
  ]},
  { day: 'Sunday', lessons: [
    { time: '05:00 AM', title: 'Tafsir Al-Qur\'an' },
    { time: '06:30 AM', title: 'Riyadus Salihin' },
    { time: '08:00 AM', title: 'Bulugh al-Maram' },
    { time: '09:30 AM', title: 'Usul ath-Thalathah' },
    { time: '10:30 AM', title: 'Kitab at-Tawheed' },
  ]},
  { day: 'Monday', lessons: [
    { time: '05:00 AM', title: 'Tafsir Al-Qur\'an' },
    { time: '06:30 AM', title: 'Riyadus Salihin' },
    { time: '08:00 AM', title: 'Bulugh al-Maram' },
    { time: '09:30 AM', title: 'Usul ath-Thalathah' },
    { time: '10:30 AM', title: 'Kitab at-Tawheed' },
  ]},
  { day: 'Tuesday', lessons: [
    { time: '05:00 AM', title: 'Tafsir Al-Qur\'an' },
    { time: '06:30 AM', title: 'Riyadus Salihin' },
    { time: '08:00 AM', title: 'Bulugh al-Maram' },
    { time: '09:30 AM', title: 'Usul ath-Thalathah' },
    { time: '10:30 AM', title: 'Kitab at-Tawheed' },
  ]},
  { day: 'Wednesday', lessons: [
    { time: '05:00 AM', title: 'Tafsir Al-Qur\'an' },
    { time: '06:30 AM', title: 'Riyadus Salihin' },
    { time: '08:00 AM', title: 'Bulugh al-Maram' },
    { time: '09:30 AM', title: 'Usul ath-Thalathah' },
    { time: '10:30 AM', title: 'Kitab at-Tawheed' },
  ]},
  { day: 'Thursday', lessons: [
    { time: '05:00 AM', title: 'Tafsir Al-Qur\'an' },
    { time: '06:30 AM', title: 'Riyadus Salihin' },
    { time: '08:00 AM', title: 'Bulugh al-Maram' },
    { time: '09:30 AM', title: 'Usul ath-Thalathah' },
    { time: '10:30 AM', title: 'Kitab at-Tawheed' },
  ]},
  { day: 'Friday', lessons: [], isRest: true },
];

const TELEGRAM_CHANNELS = [
  { name: 'Darsii Tafsiiraa', link: 'https://t.me/Sheehk1Z' },
  { name: 'Darsii RIYAADAA', link: 'https://t.me/sheek1Z' },
  { name: 'Darsii BULUUKAA', link: 'https://t.me/sheikhzabuur00' },
  { name: 'Darsii Tajriidaa', link: 'https://t.me/Sheikzabuur1234' },
  { name: 'Darsii Beeyquunaa', link: 'https://t.me/Shekzabuur12' },
  { name: 'Darsii Tawheed', link: 'https://t.me/Sheikzabuur12' },
  { name: 'Darsii Usuula Salaasaa', link: 'https://t.me/sheikzabuur' },
];

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

interface LiveState {
  url: string;
  isActive: boolean;
  title: string;
  chatUrl: string;
  youtubeChannelId: string;
  schedule: UpcomingStream[];
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  return `${Math.floor(diff / 60000)}m ago`;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function LiveStream() {
  const { user } = useAuth();

  const [state, setState] = useState<LiveState>({
    url: '', isActive: false, title: '', chatUrl: '', youtubeChannelId: '', schedule: [],
  });

  useSEO({
    title: 'Live Dars Center — Sheikh Mohammed Zabuur',
    description: 'Official Live Broadcasts of Sheikh Mohammed Zabuur. Watch live lessons, listen to audio broadcasts, and access recorded dars sessions.',
    ogType: 'video.other',
    keywords: 'live stream, islamic lecture, sheikh mohammed zabuur, dars, tafsir, quran, sunnah',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: state.title || 'Sheikh Mohammed Zabuur Live Dars Center',
      description: 'Official Live Broadcasts of Sheikh Mohammed Zabuur',
      thumbnailUrl: '/uploads/images/roomaa-xiqqoo-masjid.jpg',
    },
  });

  const [loading, setLoading] = useState(true);
  const [recordings, setRecordings] = useState<ResourceItem[]>([]);
  const [recordingsLoading, setRecordingsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [theatreMode, setTheatreMode] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');

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
    } catch {
      // silent
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

  const getEmbedUrl = (url: string, channelId?: string) => {
    if (!url) {
      if (channelId) return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=0&modestbranding=1&rel=0`;
      return '';
    }
    if (/youtube\.com\/@|youtube\.com\/channel\//i.test(url)) {
      if (channelId) return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=0&modestbranding=1&rel=0`;
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

  const streamingUrl = state.url;
  const embedUrl = getEmbedUrl(streamingUrl, state.youtubeChannelId);
  const isLive = state.isActive;

  const isToday = (dayName: string) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return today === dayName;
  };

  const filteredRecordings = activeFilter === 'All'
    ? recordings
    : recordings.filter((r) =>
        r.collection?.toLowerCase().includes(activeFilter.toLowerCase()) ||
        r.category?.toLowerCase().includes(activeFilter.toLowerCase())
      );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0a1a0f 0%, #0d2818 50%, #0a1a0f 100%)' }}>
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
          </div>
          <p className="text-white/60 text-sm">Loading Live Dars Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 text-white px-4 md:px-6 lg:px-8"
      style={{ background: 'linear-gradient(135deg, #0a1a0f 0%, #0d2818 50%, #0a1a0f 100%)' }}>
      <div className="max-w-[1440px] mx-auto">

        {/* ── HERO ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 overflow-hidden rounded-3xl min-h-[320px] flex items-center">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/uploads/images/roomaa-xiqqoo-masjid.jpg')" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a0f]/95 via-[#0d2818]/80 to-[#0a1a0f]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a0f]/50 via-transparent to-amber-900/20" />
          <div className="relative z-10 w-full px-8 py-12 md:py-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isLive
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  {isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                  {isLive ? 'LIVE' : 'OFFLINE'}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  LIVE DARS CENTER
                </h1>
                <p className="text-lg text-amber-400/80 font-medium">
                  Official Live Broadcasts of Sheikh Mohammed Zabuur
                </p>
                <p className="text-sm text-white/60 max-w-lg leading-relaxed">
                  Watch live lessons, listen to live audio broadcasts, and access recorded dars sessions from Sheikh Mohammed Zabuur.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {isLive && (
                    <button
                      onClick={() => document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-500/30">
                      <Play className="w-4 h-4" /> Watch Live
                    </button>
                  )}
                  <button
                    onClick={() => document.getElementById('schedule-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all">
                    <Calendar className="w-4 h-4" /> View Schedule
                  </button>
                  <a href="https://t.me/sheikhmohammedzabuur" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 rounded-xl text-sm font-medium transition-all">
                    <Send className="w-4 h-4" /> Join Telegram
                  </a>
                  <a href="/scholar"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all">
                    <BookOpen className="w-4 h-4" /> About Sheikh
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── STREAM INFO CARDS ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Current Status', value: isLive ? 'LIVE' : 'OFFLINE', icon: Radio, live: isLive },
            { label: 'Teacher', value: 'Sheikh Mohammed Zabuur', icon: BookOpen },
            { label: 'Language', value: 'Afaan Oromoo', icon: Globe },
            { label: 'Category', value: 'Tafsir', icon: Clock },
          ].map((info) => (
            <div key={info.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <info.icon className={`w-3.5 h-3.5 ${info.live ? 'text-red-400' : 'text-amber-400'}`} />
                <span className="text-[10px] text-white/40 uppercase tracking-wider">{info.label}</span>
              </div>
              <p className={`text-sm font-bold truncate ${info.live ? 'text-red-400' : ''}`}>{info.value}</p>
            </div>
          ))}
        </motion.div>

        {/* ── PLAYER SECTION ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8" id="player-section">
          <div className="flex flex-col gap-6">
            <div className={`flex-1 min-w-0 ${theatreMode ? 'max-w-full' : ''}`}>

              {/* Admin Controls — only visible to admins */}
              {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-500/[0.02] border border-amber-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-bold text-amber-400">Stream Controls</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={async () => { try { await liveApi.update({ isActive: !state.isActive }); setState(prev => ({ ...prev, isActive: !prev.isActive })); toast.success(state.isActive ? 'Stream stopped' : 'Stream started'); } catch { toast.error('Failed to toggle stream'); } }}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${state.isActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-amber-500 hover:bg-amber-600 text-black'}`}>
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
                      <input value={scheduleTitle} onChange={(e) => setScheduleTitle(e.target.value)} placeholder="Schedule title"
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-amber-500/50" />
                      <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 [color-scheme:dark]" />
                      <button onClick={() => { if (scheduleTitle && scheduleDate) { toast.success('Stream scheduled!'); setShowScheduleForm(false); } else toast.error('Fill all fields'); }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-semibold transition-all">Schedule Stream</button>
                    </div>
                  )}
                </div>
              )}

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isLive
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  {isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                  {isLive ? 'LIVE' : 'OFFLINE'}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
                  <Radio className="w-3 h-3" />
                  Broadcast
                </div>
              </div>

              {/* Player */}
              <div className={`relative w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl ${theatreMode ? 'rounded-b-none' : ''}`}>
                <div className="aspect-video w-full relative">
                  {isLive && embedUrl ? (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      title={state.title}
                    />
                  ) : isLive ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1a0f] via-[#0d2818] to-[#0a1a0f] p-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                        <Play className="w-8 h-8 text-red-400" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">Live on YouTube</h3>
                      <p className="text-sm text-white/50 mb-5 max-w-md">The live broadcast is active. Watch directly on YouTube.</p>
                      <a href={streamingUrl || 'https://youtube.com/@sheikhmahammadzabuur-b7f'} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-600/30">
                        <Tv className="w-4 h-4" /> Watch on YouTube
                      </a>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1a0f] via-[#0d2818] to-[#0a1a0f] p-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <Tv className="w-8 h-8 text-white/30" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">Broadcast Offline</h3>
                      <p className="text-sm text-white/50 max-w-md">No live broadcast at this time. Check the schedule for upcoming dars sessions or browse recorded lessons.</p>
                    </div>
                  )}
                </div>

                {/* Player Controls */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-black/80 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {isLive && (
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
                      title={theatreMode ? 'Default View' : 'Theatre Mode'}>
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

              {/* Sheikh Profile Card */}
              <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/5 via-amber-500/[0.02] to-transparent border border-amber-500/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center overflow-hidden shrink-0">
                    <ResponsiveScholarImage src="/uploads/images/sheikh-zabuur.jpg" alt="Sheikh Mohammed Zabuur" className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-amber-400">Sheikh Mohammed Zabuur</h3>
                    <p className="text-xs text-white/40">Scholar &amp; Teacher of Islamic Sciences</p>
                  </div>
                  <div className="hidden sm:flex flex-wrap gap-1.5">
                    {['Tafsir', 'Aqeedah', 'Fiqh'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400/80 border border-amber-500/20 text-[10px] font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Theatre mode toggle ── */}
        {theatreMode && (
          <div className="flex justify-center -mt-1 mb-8">
            <button onClick={() => setTheatreMode(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-b-xl text-[10px] text-white/40 hover:text-white/70 transition-all">
              <ChevronDown className="w-3 h-3" /> Exit Theatre Mode
            </button>
          </div>
        )}

        {/* ── TWO COLUMN LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mt-8">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-10">

            {/* ── WEEKLY DARS SCHEDULE ── */}
            <motion.section id="schedule-section" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h2 className="text-lg font-bold">Weekly Dars Schedule</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
                {WEEKLY_SCHEDULE.map((day) => (
                  <div key={day.day}
                    className={`p-4 rounded-2xl border transition-all ${
                      isToday(day.day)
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-white/[0.03] border-white/5'
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`text-sm font-bold ${isToday(day.day) ? 'text-amber-400' : 'text-white/80'}`}>{day.day}</h3>
                      {isToday(day.day) && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Today</span>
                      )}
                    </div>
                    {day.isRest ? (
                      <p className="text-xs text-white/40 italic">No Classes</p>
                    ) : (
                      <div className="space-y-2">
                        {day.lessons.map((lesson, i) => (
                          <div key={i} className="text-[11px]">
                            <span className="text-amber-400/80 font-mono">{lesson.time}</span>
                            <p className="text-white/70 truncate">{lesson.title}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>

            {/* ── RECORDED DARS SESSIONS ── */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <h2 className="text-lg font-bold">Recorded Dars Sessions</h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RECORDING_FILTERS.map((cat) => (
                    <button key={cat} onClick={() => setActiveFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        activeFilter === cat
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
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
                <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <Radio className="w-6 h-6 text-amber-400" />
                  </div>
                  <p className="text-base font-bold mb-1">No Recordings Yet</p>
                  <p className="text-xs text-white/40">Recorded dars sessions will appear here once available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredRecordings.map((rec) => (
                    <div key={rec.id}
                      className="group rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
                      <div className="aspect-video bg-black/50 relative overflow-hidden">
                        {rec.thumbnail ? (
                          <img src={rec.thumbnail} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-amber-500/90 flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <Play className="w-4 h-4 text-black ml-0.5" />
                          </div>
                        </div>
                        {rec.duration && (
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-[10px] font-medium">{rec.duration}</span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-xs font-bold truncate leading-snug">{rec.title}</h3>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-white/40">{timeAgo(rec.createdAt)}</span>
                          <a href={rec.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-amber-400 hover:text-amber-300 font-medium">Watch</a>
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
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/[0.04] to-amber-500/[0.01] border border-amber-500/10">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-amber-400">Daily Hadith</h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed italic">
                The Prophet (ﷺ) said: "Whoever travels a path in search of knowledge, Allah makes easy for them a path to Paradise." (Muslim)
              </p>
            </div>

            {/* Quran Verse */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/[0.04] to-amber-500/[0.01] border border-amber-500/10">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-amber-400">Quran Verse</h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed italic">
                "And whoever does righteous deeds, whether male or female, while being a believer — those will enter Paradise and will not be wronged, even as much as the speck on a date seed." (An-Nisa 4:124)
              </p>
            </div>

            {/* Official Links */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
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
                <a href="https://t.me/sheikhmohammedzabuur" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/[0.04] border border-sky-500/10 hover:bg-sky-500/[0.08] hover:border-sky-500/30 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Telegram</p>
                    <p className="text-[10px] text-white/40">@sheikhmohammedzabuur</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-sky-400 transition-all shrink-0" />
                </a>
              </div>
            </div>

            {/* Official Telegram Channels */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold">Official Telegram Channels</h3>
              </div>
              <div className="space-y-2.5">
                {TELEGRAM_CHANNELS.map((ch) => (
                  <a key={ch.name}
                    href={ch.link}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-sky-500/20 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{ch.name}</p>
                      <p className="text-[10px] text-white/40">Join Channel</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-sky-400 transition-all shrink-0" />
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
