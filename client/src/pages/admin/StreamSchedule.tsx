import { useState, useEffect } from 'react';
import {
  Calendar, Save, RefreshCw, AlertCircle, CheckCircle, Plus, Trash2,
  Edit3, Radio, Clock, Play, ExternalLink, X, Video as VideoIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { live } from '../../lib/api';
import { useTranslation } from '../../i18n';

interface ScheduleEntry {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  startDate: string;
  duration: number;
  status: 'upcoming' | 'live' | 'ended';
  category: string;
}

const CATEGORIES = ['Tafsir', 'Hadith', 'Seerah', 'Fiqh', 'Aqeedah', 'Q&A', 'Ramadan Series', 'General'];

const STATUS_STYLES: Record<string, string> = {
  upcoming: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  live: 'bg-red-500/10 text-red-400 border-red-500/20',
  ended: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function StreamSchedule() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ScheduleEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleEntry | null>(null);

  const [newEntry, setNewEntry] = useState<ScheduleEntry>({
    id: '', title: '', description: '', youtubeUrl: '',
    startDate: '', duration: 60, status: 'upcoming', category: 'General',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    live.get()
      .then(res => {
        const d = res.data;
        if (d?.schedule && Array.isArray(d.schedule)) {
          setSchedule(d.schedule);
        }
      })
      .catch(() => setError('Failed to load schedule'))
      .finally(() => setLoading(false));
  };

  const openAddModal = () => {
    const now = new Date();
    const defaultDate = new Date(now.getTime() + 86400000);
    setNewEntry({
      id: '', title: '', description: '', youtubeUrl: '',
      startDate: defaultDate.toISOString().slice(0, 16),
      duration: 60, status: 'upcoming', category: 'General',
    });
    setShowAddModal(true);
  };

  const openEdit = (entry: ScheduleEntry) => {
    setEditTarget({ ...entry });
  };

  const handleAdd = async () => {
    if (!newEntry.title.trim() || !newEntry.startDate) return;
    const updated = [...schedule, { ...newEntry, id: String(Date.now()) }];
    setSchedule(updated);
    setShowAddModal(false);
    await saveSchedule(updated);
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    const updated = schedule.map(s => s.id === editTarget.id ? editTarget : s);
    setSchedule(updated);
    setEditTarget(null);
    await saveSchedule(updated);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const updated = schedule.filter(s => s.id !== deleteTarget.id);
    setSchedule(updated);
    setDeleteTarget(null);
    await saveSchedule(updated);
  };

  const handleGoLive = async (entry: ScheduleEntry) => {
    const updated = schedule.map(s => s.id === entry.id ? { ...s, status: 'live' as const } : s);
    setSchedule(updated);
    await saveSchedule(updated);
  };

  const saveSchedule = async (scheduleData: ScheduleEntry[]) => {
    setSaving(true);
    try {
      const res = await live.update({ schedule: scheduleData });
      if (res.data?.schedule) setSchedule(res.data.schedule);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save schedule');
    } finally { setSaving(false); }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'live': return 'LIVE';
      case 'ended': return 'Ended';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric',
      });
    } catch { return dateStr; }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return ''; }
  };

  const groupedByDate = schedule.reduce<Record<string, ScheduleEntry[]>>((acc, entry) => {
    const dateKey = formatDate(entry.startDate);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    const dateA = new Date(groupedByDate[a][0].startDate).getTime();
    const dateB = new Date(groupedByDate[b][0].startDate).getTime();
    return dateA - dateB;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-icc-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Calendar className="w-6 h-6 text-icc-500" />
            Stream Schedule
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Plan, manage, and launch your live streams
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-icc-500 hover:border-icc-500 transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 text-white text-sm font-semibold transition-all">
            <Plus className="w-4 h-4" /> Add Stream
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-icc-500/10 border border-icc-500/20 text-icc-500 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" /> Schedule saved!
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{schedule.filter(s => s.status === 'upcoming').length}</p>
          <p className="text-xs text-gray-400 mt-1">Upcoming</p>
        </div>
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{schedule.filter(s => s.status === 'live').length}</p>
          <p className="text-xs text-gray-400 mt-1">Live Now</p>
        </div>
        <div className="rounded-xl bg-gray-500/10 border border-gray-500/20 p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">{schedule.filter(s => s.status === 'ended').length}</p>
          <p className="text-xs text-gray-400 mt-1">Ended</p>
        </div>
      </div>

      {/* Schedule List - Grouped by Date */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-icc-500" />
            Scheduled Streams
          </h2>
        </div>

        {schedule.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{t('admin.no_streams_scheduled')}</p>
            <p className="text-xs mt-1">Click "Add Stream" to create your first scheduled stream</p>
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {sortedDates.map((dateKey) => (
              <div key={dateKey}>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-icc-500" />
                  {dateKey}
                </h3>
                <div className="space-y-2">
                  {groupedByDate[dateKey].map((entry) => (
                    <div key={entry.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-icc-500/30 transition-all group">
                      <div className={`px-2 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider shrink-0 ${STATUS_STYLES[entry.status] || STATUS_STYLES.upcoming}`}>
                        {entry.status === 'live' && (
                          <span className="relative flex h-2 w-2 mr-1 inline-block">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                          </span>
                        )}
                        {getStatusLabel(entry.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{entry.title}</span>
                          {entry.category && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-icc-500/10 text-icc-400 border border-icc-500/20">{entry.category}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(entry.startDate)}
                          </span>
                          <span>{entry.duration} min</span>
                          {entry.description && <span className="truncate max-w-[200px]">{entry.description}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                        {entry.youtubeUrl && (
                          <a href={entry.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-gray-400 hover:text-icc-500 hover:bg-icc-50 dark:hover:bg-icc-500/10 transition-all" title={t('admin.open_youtube')}>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {entry.status !== 'live' && (
                          <button onClick={() => handleGoLive(entry)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" title="Go Live Now">
                            <Radio className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => openEdit(entry)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(entry)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" title={t('admin.delete')}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <StreamFormModal
            title="Schedule New Stream"
            data={newEntry}
            onChange={setNewEntry}
            onClose={() => setShowAddModal(false)}
            onSave={handleAdd}
            saveLabel="Add Stream"
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editTarget && (
          <StreamFormModal
            title="Edit Stream Schedule"
            data={editTarget}
            onChange={setEditTarget}
            onClose={() => setEditTarget(null)}
            onSave={handleEditSave}
            saveLabel="Save Changes"
          />
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/10">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Delete Stream</h3>
              </div>
              <p className="text-sm text-gray-500 mb-2">Remove this scheduled stream?</p>
              <p className="text-sm font-semibold bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg text-gray-900 dark:text-white mb-6">{deleteTarget.title}</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StreamFormModal({
  title, data, onChange, onClose, onSave, saveLabel,
}: {
  title: string; data: ScheduleEntry; onChange: (d: ScheduleEntry) => void; onClose: () => void; onSave: () => void; saveLabel: string;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
            <input type="text" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} placeholder="e.g. Weekly Tafsir Lesson" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={data.description} onChange={(e) => onChange({ ...data, description: e.target.value })} placeholder="Stream description..." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">YouTube URL</label>
            <input type="url" value={data.youtubeUrl} onChange={(e) => onChange({ ...data, youtubeUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Date & Time</label>
              <input type="datetime-local" value={data.startDate} onChange={(e) => onChange({ ...data, startDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration (minutes)</label>
              <input type="number" min={5} max={480} value={data.duration} onChange={(e) => onChange({ ...data, duration: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
            <select value={data.category} onChange={(e) => onChange({ ...data, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all">
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
            <select value={data.status} onChange={(e) => onChange({ ...data, status: e.target.value as ScheduleEntry['status'] })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all">
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
          <button onClick={onSave} disabled={!data.title.trim() || !data.startDate} className="px-4 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 disabled:opacity-40 text-white text-sm font-semibold transition-all flex items-center gap-2">
            <Save className="w-4 h-4" /> {saveLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
