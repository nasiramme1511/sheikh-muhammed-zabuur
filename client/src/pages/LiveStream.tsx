import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Tv, Radio, Clock, MessageSquare, ExternalLink, Calendar, AlertCircle, Sparkles
} from 'lucide-react';
import { live as liveApi } from '../lib/api';
import { useSEO } from '../seo/metadata';

interface UpcomingStream {
  id: string;
  title: string;
  scheduledFor: string;
}

interface LivestreamState {
  url: string;
  isActive: boolean;
  title: string;
  chatUrl: string;
  schedule: UpcomingStream[];
}

export default function LiveStream() {
  useSEO({
    title: 'Live Stream',
    description: 'Join the live Islamic broadcast by Sheikh Mohammed Zabuur. Watch live lectures, Friday reminders, and Q&A sessions in real time.',
  });

  const [state, setState] = useState<LivestreamState>({
    url: '',
    isActive: false,
    title: 'Weekly Islamic Class',
    chatUrl: '',
    schedule: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveState();
    // Poll every 30 seconds to update live status automatically
    const timer = setInterval(fetchLiveState, 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchLiveState = async () => {
    try {
      const res = await liveApi.get();
      setState(res.data);
    } catch (err) {
      console.error('Failed to load live state:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    // If it is already an embed URL, return it
    if (url.includes('youtube.com/embed/')) return url;

    // Convert standard YouTube watch/share URLs to embed URLs
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=0`;
    }
    return url;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col justify-center items-center gap-3 text-white">
        <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-sm text-white/40">Loading stream status...</span>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(state.url);

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16 text-white px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Live Broadcast
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            Join the Live Stream
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-2xl mx-auto text-base"
          >
            Listen and watch live lectures by Sheikh Mohammed Zabuur directly as they happen and interact in real-time.
          </motion.p>
        </div>

        {/* Live Indicator Bar */}
        <div className="flex items-center justify-between mb-8 bg-dark-800/60 p-4 md:p-5 rounded-2xl border border-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {state.isActive ? (
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
            ) : (
              <div className="h-3 w-3 rounded-full bg-white/20" />
            )}
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${state.isActive ? 'text-red-500' : 'text-white/40'}`}>
                {state.isActive ? 'LIVE NOW' : 'OFFLINE'}
              </span>
              <h2 className="text-sm md:text-base font-bold text-white leading-tight mt-0.5">
                {state.isActive ? state.title : 'No stream is currently active'}
              </h2>
            </div>
          </div>
          {state.isActive && state.chatUrl && (
            <a
              href={state.chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Join Chat
            </a>
          )}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stream Player Panel */}
          <div className="lg:col-span-2 space-y-6">
            {state.isActive && embedUrl ? (
              <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={state.title}
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-dark-800 to-dark-950 border border-white/5 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 relative z-10">
                  <Tv className="w-8 h-8 text-white/30" />
                </div>
                <h3 className="text-xl font-bold mb-2 relative z-10">Broadcast is Offline</h3>
                <p className="text-sm text-white/50 max-w-sm mb-6 relative z-10">
                  Sheikh Mohammed Zabuur is not live streaming right now. See the scheduled streams list to see when he will be live next.
                </p>
              </div>
            )}

            {/* Description box if active */}
            {state.isActive && (
              <div className="p-6 bg-dark-800/40 rounded-2xl border border-white/5 backdrop-blur-sm">
                <h3 className="text-lg font-bold mb-2">About this Live Class</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  You are tuning into the live program with Sheikh Mohammed Zabuur. In this session, the Sheikh discusses core aspects of Islamic knowledge. Questions can be submitted via the live chat.
                </p>
              </div>
            )}
          </div>

          {/* Schedule Sidebar */}
          <div className="space-y-6">
            <div className="bg-dark-800/50 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Upcoming Classes</h3>
              </div>

              {state.schedule.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-xs text-white/40">No classes scheduled currently.</p>
                  <p className="text-[10px] text-white/30 mt-1">Please check back later or subscribe to notifications.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.schedule.map((sch, index) => (
                    <div
                      key={sch.id || index}
                      className="p-4 rounded-xl bg-dark-900 border border-white/5 flex gap-3 hover:border-emerald-500/20 transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate leading-snug">{sch.title}</h4>
                        <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 shrink-0" />
                          {formatDate(sch.scheduledFor)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Support box */}
            <div className="bg-gradient-to-br from-emerald-950/20 to-dark-850 p-6 rounded-2xl border border-emerald-500/10 flex flex-col justify-between h-48">
              <div>
                <h4 className="text-sm font-bold text-white mb-2">Telegram Channel</h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  Join the Sheikh's official announcement channel to receive direct alerts, download links, and instant stream reminders.
                </p>
              </div>
              <a
                href="https://t.me/Sheikh_Mohammed_Zabuur"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                Join Telegram <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
