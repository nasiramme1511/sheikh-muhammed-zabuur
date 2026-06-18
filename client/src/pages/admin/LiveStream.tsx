import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Radio, Save, Plus, Trash2, ExternalLink, AlertCircle, CheckCircle, Clock, Link as LinkIcon
} from 'lucide-react';
import { live as liveApi } from '../../lib/api';
import { COLLECTIONS } from '../../config/collections';

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
}

interface LiveState {
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
}

export default function AdminLiveStream() {
  const [state, setState] = useState<LiveState>({
    url: '',
    isActive: false,
    title: 'Weekly Islamic Lecture',
    chatUrl: '',
    youtubeChannelId: '',
    schedule: [],
    viewers: 0,
    totalViewers: 0,
    totalStreams: 0,
    totalWatchHours: 0,
    activeSubscribers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // New schedule entry state
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [recordingCollection, setRecordingCollection] = useState('');

  useEffect(() => {
    liveApi.get()
      .then(res => setState(res.data))
      .catch(() => setError('Failed to load live stream settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await liveApi.update({ ...state, collection: recordingCollection || undefined });
      setState(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLive = async () => {
    const updated = { ...state, isActive: !state.isActive };
    setState(updated);
    try {
      await liveApi.update({ isActive: !state.isActive, collection: recordingCollection || undefined });
    } catch {
      setState(state); // revert
    }
  };

  const addSchedule = () => {
    if (!newTitle.trim() || !newDate) return;
    const entry: UpcomingStream = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      scheduledFor: newDate,
    };
    setState(prev => ({ ...prev, schedule: [...prev.schedule, entry] }));
    setNewTitle('');
    setNewDate('');
  };

  const removeSchedule = (id: string) => {
    setState(prev => ({ ...prev, schedule: prev.schedule.filter(s => s.id !== id) }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-icc-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Radio className="w-6 h-6 text-icc-500" />
            Live Stream Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Control the live stream status, embed URLs, schedule, and chat integration.
          </p>
        </div>

        {/* Live toggle */}
        <button
          onClick={handleToggleLive}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
            state.isActive
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
              : 'bg-icc-500 text-white hover:bg-icc-600 shadow-icc-500/20'
          }`}
        >
          <span className={`relative flex h-2.5 w-2.5 ${state.isActive ? '' : 'invisible'}`}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          {state.isActive ? 'END LIVE STREAM' : 'GO LIVE NOW'}
        </button>
      </div>

      {/* Status indicator */}
      <div className={`p-4 rounded-xl border flex items-center gap-3 ${
        state.isActive
          ? 'bg-red-500/10 border-red-500/20 text-red-500'
          : 'bg-gray-500/10 border-gray-500/20 text-gray-400 dark:text-gray-500'
      }`}>
        <div className={`relative flex h-3 w-3 ${state.isActive ? 'visible' : 'invisible absolute'}`}>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </div>
        <span className="font-bold text-sm uppercase tracking-wider">
          {state.isActive ? 'LIVE NOW — Visitors can see the stream' : 'OFFLINE — No active stream'}
        </span>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-icc-500/10 border border-icc-500/20 text-icc-500 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Settings saved successfully!
        </div>
      )}

      {/* Main Settings Card */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-icc-500" />
            Stream Configuration
          </h2>
        </div>
        <div className="p-5 space-y-5">
          {/* Stream Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Stream Title
            </label>
            <input
              type="text"
              value={state.title}
              onChange={(e) => setState(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Weekly Tafsir Lesson — Surah Al-Baqarah"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all"
            />
          </div>

          {/* Stream URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              YouTube Live Stream URL
            </label>
            <input
              type="url"
              value={state.url}
              onChange={(e) => setState(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all font-mono"
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              Supports: youtube.com/watch?v=..., youtu.be/..., or direct embed URLs
            </p>
          </div>

          {/* YouTube Channel ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              YouTube Channel ID
            </label>
            <input
              type="text"
              value={state.youtubeChannelId}
              onChange={(e) => setState(prev => ({ ...prev, youtubeChannelId: e.target.value }))}
              placeholder="UC_xxxxxxxxxxxxx"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all font-mono"
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              Used for embedded live stream player. Find it in your YouTube channel URL: youtube.com/channel/<span className="font-mono">UC_...</span>
            </p>
          </div>

          {/* Chat URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              YouTube Live Chat URL (optional)
            </label>
            <input
              type="url"
              value={state.chatUrl}
              onChange={(e) => setState(prev => ({ ...prev, chatUrl: e.target.value }))}
              placeholder="https://www.youtube.com/live_chat?v=..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all font-mono"
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              Shown as a "Join Chat" button on the Live page when active
            </p>
          </div>

          {/* Recording Collection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Recording Collection (auto-save)
            </label>
            <select
              value={recordingCollection}
              onChange={(e) => setRecordingCollection(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all"
            >
              <option value="">None (General)</option>
              {COLLECTIONS.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              When the stream ends, a recording resource will be auto-saved under this collection
            </p>
          </div>

          {/* Preview link */}
          {state.url && (
            <a
              href={state.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-icc-500 hover:text-icc-400 font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open stream URL in new tab
            </a>
          )}
        </div>
      </div>

      {/* Schedule Manager */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-icc-500" />
            Upcoming Schedule
          </h2>
        </div>
        <div className="p-5 space-y-4">
          {/* Existing entries */}
          {state.schedule.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-600">
              No scheduled streams. Add one below.
            </div>
          ) : (
            <div className="space-y-2">
              {state.schedule.map((sch) => (
                <div
                  key={sch.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                >
                  <Radio className="w-4 h-4 text-icc-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{sch.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(sch.scheduledFor).toLocaleString(undefined, {
                        weekday: 'short', month: 'short', day: 'numeric',
                        hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => removeSchedule(sch.id)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-all shrink-0"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new schedule entry */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Add Upcoming Stream</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Session title..."
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all"
              />
              <input
                type="datetime-local"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all"
              />
              <button
                onClick={addSchedule}
                disabled={!newTitle.trim() || !newDate}
                className="px-4 py-2 rounded-xl bg-icc-500 hover:bg-icc-600 disabled:opacity-40 text-white text-sm font-semibold flex items-center gap-1.5 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-icc-500 hover:bg-icc-600 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-lg shadow-icc-500/20"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Live Stream Analytics */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <Radio className="w-4 h-4 text-icc-500" />
            Live Stream Analytics
          </h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-icc-500/5 border border-icc-500/10 text-center">
              <p className="text-2xl font-bold text-icc-400">{state.totalStreams || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Total Sessions</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center">
              <p className="text-2xl font-bold text-blue-400">{state.totalViewers || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Total Viewers</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
              <p className="text-2xl font-bold text-amber-400">{state.totalWatchHours || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Watch Hours</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-center">
              <p className="text-2xl font-bold text-rose-400">{state.activeSubscribers || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Subscribers</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 text-center">
            Analytics are tracked automatically when you toggle the live stream.
          </p>
        </div>
      </div>
    </div>
  );
}
