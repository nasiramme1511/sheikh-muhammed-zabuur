import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiUsers, HiPlay, HiBookOpen, HiCollection, HiClock,
  HiTrendingUp, HiLibrary, HiDatabase, HiShieldCheck,
  HiVolumeUp, HiVideoCamera, HiDownload, HiEye, HiChartBar,
} from 'react-icons/hi';
import {
  Upload, Radio, FileText, Image, Headphones, Video, Activity,
  Zap, UserPlus, Settings, BarChart3, Archive, Trash2,
  Bell, Globe, AlertTriangle, X, Send,
} from 'lucide-react';
import { admin, live } from '../../lib/api';
import { useTranslation } from '../../i18n';
import { COLLECTIONS, getCollectionBySlug } from '../../config/collections';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  totalAudio: number;
  totalVideo: number;
  totalPdf: number;
  totalImages: number;
  totalRecordings: number;
  totalTelegramChannels: number;
  totalResources: number;
  totalViews: number;
  totalDownloads: number;
  totalStorage: number;
  storageByType: { audio: number; video: number; pdf: number; image: number };
  recentUsers: any[];
  recentActivity: any[];
  popularAudio: any[];
  popularVideos: any[];
}

function humanSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [liveStatus, setLiveStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      admin.getStats().catch(() => null),
      live.get().catch(() => null),
    ]).then(([sRes, lRes]) => {
      if (sRes?.data) setStats(sRes.data);
      if (lRes?.data) setLiveStatus(lRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96" />
        </div>
      </div>
    );
  }

  const s = stats;
  const totalContent = s ? s.totalAudio + s.totalVideo + s.totalPdf + s.totalImages + s.totalRecordings : 0;

  const handleDeleteAll = async () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    setDeleting(true);
    try {
      const typeToDelete = deleteTarget === 'ALL' || !deleteTarget ? undefined : deleteTarget;
      const res = await admin.resources.deleteAll(typeToDelete);
      toast.success(res.data.message || 'Deleted');
      setDeleteTarget(null);
      setDeleteConfirm('');
      // Refresh stats
      admin.getStats().then(r => setStats(r.data)).catch(() => {});
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const quickActions = [
    { to: '/admin/audio', label: t('admin.upload_audio'), icon: Headphones, color: 'from-emerald-500 to-emerald-600' },
    { to: '/admin/videos', label: t('admin.upload_video'), icon: Video, color: 'from-blue-500 to-blue-600' },
    { to: '/admin/pdfs', label: t('admin.upload_pdf'), icon: FileText, color: 'from-purple-500 to-purple-600' },
    { to: '/admin/gallery', label: t('admin.upload_image'), icon: Image, color: 'from-pink-500 to-pink-600' },
    { to: '/admin/import', label: t('admin.import_zip'), icon: Archive, color: 'from-amber-500 to-amber-600' },
    { to: '/admin/bulk-upload', label: t('admin.bulk_upload'), icon: Upload, color: 'from-cyan-500 to-cyan-600' },
    { to: '/admin/resources', label: t('admin.bulk_delete'), icon: Trash2, color: 'from-red-500 to-red-600' },
  ];

  return (
    <div className="space-y-6 pb-8">

      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{t('admin.welcome_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('admin.welcome_desc')}</p>
        </div>
      </motion.div>

      {/* Main Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { icon: HiUsers, label: t('admin.total_users'), value: s?.totalUsers || 0, color: 'from-emerald-500 to-emerald-600' },
          { icon: Headphones, label: t('admin.total_audio'), value: s?.totalAudio || 0, color: 'from-blue-500 to-blue-600' },
          { icon: HiVideoCamera, label: t('admin.total_video'), value: s?.totalVideo || 0, color: 'from-purple-500 to-purple-600' },
          { icon: FileText, label: t('admin.total_pdfs'), value: s?.totalPdf || 0, color: 'from-red-500 to-red-600' },
          { icon: HiClock, label: t('admin.total_recordings'), value: s?.totalRecordings || 0, color: 'from-amber-500 to-amber-600' },
          { icon: HiDownload, label: t('admin.total_downloads'), value: s?.totalDownloads || 0, color: 'from-teal-500 to-teal-600' },
          { icon: HiDatabase, label: t('admin.total_storage'), value: s?.totalStorage ? humanSize(s.totalStorage) : '0 B', color: 'from-rose-500 to-rose-600' },
          { icon: Radio, label: t('admin.total_live_sessions'), value: liveStatus?.totalSessions || 0, color: 'from-indigo-500 to-indigo-600' },
        ].concat(s?.totalTelegramChannels ? [{ icon: Send, label: 'Telegram', value: s.totalTelegramChannels, color: 'from-sky-500 to-sky-600' }] : []).map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center hover:shadow-md transition-all">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-1.5`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-[10px] text-gray-500 leading-tight">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Content Overview + Live Stream + User Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Content Overview - Recent Uploads */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <HiLibrary className="w-4 h-4 text-emerald-500" /> {t('admin.recent_uploads')}
          </h2>
          {s?.recentActivity && s.recentActivity.length > 0 ? (
            <div className="space-y-1">
              {s.recentActivity.slice(0, 8).map((log: any, i: number) => {
                const actionLabel: Record<string, { icon: any; label: string; color: string }> = {
                  upload: { icon: Upload, label: t('admin.admin_uploaded'), color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
                  delete: { icon: Trash2, label: t('admin.admin_deleted'), color: 'text-red-500 bg-red-50 dark:bg-red-500/10' },
                  download: { icon: HiDownload, label: t('admin.user_downloaded'), color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
                  livestream: { icon: Radio, label: t('admin.user_joined'), color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10' },
                };
                const config = actionLabel[log.action] || { icon: Activity, label: log.action, color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' };
                const Icon = config.icon;
                let meta: any = {};
                try { meta = JSON.parse(log.metadata || '{}'); } catch {}
                return (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}><Icon className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{config.label} {meta.title || ''}</p>
                      <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.color}`}>{log.action}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">{t('admin.no_activity')}</p>
          )}
        </div>

        <div className="space-y-6">
          {/* Live Stream Dashboard */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-4">
              <Radio className="w-4 h-4" /> {t('admin.live_dashboard')}
            </h2>
            <div className={`flex items-center gap-3 mb-4 px-4 py-3 rounded-xl ${liveStatus?.isLive ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
              <span className={`w-3 h-3 rounded-full ${liveStatus?.isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className={`text-sm font-semibold ${liveStatus?.isLive ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>
                {liveStatus?.isLive ? t('dashboard.live_now') : 'OFFLINE'}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-xs text-gray-500">{t('admin.current_stream')}: {liveStatus?.title || '—'}</p>
              <p className="text-xs text-gray-500">{t('admin.total_viewers')}: {liveStatus?.viewers || 0}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/admin/live" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-medium transition-all"><Radio className="w-3.5 h-3.5" /> {t('admin.go_live')}</Link>
              <Link to="/admin/live" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">{t('admin.manage_schedule')}</Link>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-4">
              <HiUsers className="w-4 h-4" /> {t('admin.user_management')}
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{s?.totalUsers || 0}</p>
                <p className="text-[10px] text-gray-500">{t('admin.total_users')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{s?.recentUsers?.length || 0}</p>
                <p className="text-[10px] text-gray-500">{t('admin.active_users')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{s?.recentUsers?.length || 0}</p>
                <p className="text-[10px] text-gray-500">{t('admin.new_registrations')}</p>
              </div>
            </div>
            <Link to="/admin/users" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-medium transition-all"><UserPlus className="w-3.5 h-3.5" /> {t('admin.add_user')}</Link>
          </div>
        </div>
      </div>

      {/* Content Management Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-500" /> {t('admin.content_management')}
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {quickActions.map((action, i) => (
            <Link key={i} to={action.to} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] text-gray-500 text-center leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Collections Management */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <HiCollection className="w-4 h-4 text-emerald-500" /> {t('admin.collections_management')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {COLLECTIONS.slice(0, 9).map(col => (
            <Link key={col.slug} to={`/admin/collections`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all">
              <span>{col.icon}</span> {col.name}
            </Link>
          ))}
          <Link to="/admin/collections" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all">
            {t('common.view_all')}
          </Link>
        </div>
      </div>

      {/* Popular Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-4">
            <HiVolumeUp className="w-4 h-4 text-emerald-500" /> {t('admin.most_played_audio')}
          </h3>
          {s?.popularAudio && s.popularAudio.length > 0 ? (
            <div className="space-y-1">
              {s.popularAudio.slice(0, 5).map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                  <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{a.title}</p>
                    <p className="text-xs text-gray-400">{a.views} {t('admin.total_views')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">{t('admin.no_audio_yet')}</p>}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-4">
            <HiEye className="w-4 h-4 text-blue-500" /> {t('admin.most_viewed_videos')}
          </h3>
          {s?.popularVideos && s.popularVideos.length > 0 ? (
            <div className="space-y-1">
              {s.popularVideos.slice(0, 5).map((v: any, i: number) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                  <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{v.title}</p>
                    <p className="text-xs text-gray-400">{v.views} {t('admin.total_views')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">{t('admin.no_videos_yet')}</p>}
        </div>
      </div>

      {/* System Settings Links */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-emerald-500" /> {t('admin.settings')}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/settings" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"><Settings className="w-3.5 h-3.5" /> {t('admin.settings')}</Link>
          <Link to="/admin/appearance" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"><Globe className="w-3.5 h-3.5" /> {t('admin.appearance')}</Link>
          <Link to="/admin/navigation" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"><Globe className="w-3.5 h-3.5" /> {t('admin.navigation')}</Link>
          <Link to="/admin/footer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"><Globe className="w-3.5 h-3.5" /> {t('admin.footer')}</Link>
          <Link to="/admin/backup" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"><HiDatabase className="w-3.5 h-3.5" /> {t('admin.backup')}</Link>
          <Link to="/admin/activity" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"><Activity className="w-3.5 h-3.5" /> {t('admin.activity_logs')}</Link>
        </div>
      </div>

      {/* Danger Zone — Bulk Delete All */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900/30 p-5">
        <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {t('admin.danger_zone')}
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { type: 'AUDIO', label: t('admin.delete_all_audio') },
            { type: 'VIDEO', label: t('admin.delete_all_video') },
            { type: 'PDF', label: t('admin.delete_all_pdfs') },
            { type: 'IMAGE', label: t('admin.delete_all_images') },
            { type: 'ALL', label: t('admin.delete_entire_library') },
          ].map(btn => (
            <button key={btn.type} onClick={() => setDeleteTarget(btn.type)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 transition-all">
              <Trash2 className="w-3.5 h-3.5" /> {btn.label}
            </button>
          ))}
        </div>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">{t('admin.delete_confirm_warning', { target: deleteTarget })}</p>
              <button onClick={() => { setDeleteTarget(null); setDeleteConfirm(''); }} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mb-2">{t('admin.delete_confirm_instruction')}</p>
            <div className="flex items-center gap-3">
              <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={t('admin.type_delete')} className="w-32 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 text-sm text-red-700 dark:text-red-300 placeholder:text-red-300 focus:outline-none focus:border-red-500" />
              <button onClick={handleDeleteAll} disabled={deleteConfirm !== 'DELETE' || deleting} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-red-300 text-white text-xs font-medium transition-all">
                {deleting ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" /> : <Trash2 className="w-3.5 h-3.5" />}
                {t('admin.confirm_delete_btn')}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
