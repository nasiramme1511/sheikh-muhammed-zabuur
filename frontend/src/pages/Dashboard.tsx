import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiBookmark, HiPlay, HiCheck, HiChartBar, HiCollection, HiTrendingUp } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useTranslation, type TranslationKey } from '../i18n';
import { users as usersApi, progress as progressApi } from '../lib/api';
import type { UserProgress } from '../types';
import LessonCard from '../components/LessonCard';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    Promise.all([
      usersApi.getStats(),
      progressApi.getAll(),
    ])
      .then(([statsRes, progRes]) => {
        setStats(statsRes.data);
        setProgress(progRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">{t('dashboard.sign_in_to_view')}</p>
        <Link to="/login" className="btn-icc inline-block mt-4">{t('auth.sign_in')}</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-icc-600 border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    { icon: HiBookmark, labelKey: 'dashboard.bookmarks', value: stats?.bookmarkCount || 0, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: HiPlay, labelKey: 'dashboard.in_progress', value: stats?.inProgressCount || 0, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: HiCheck, labelKey: 'dashboard.completed', value: stats?.completedCount || 0, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { icon: HiChartBar, labelKey: 'dashboard.total_activity', value: stats?.recentActivity?.length || 0, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { icon: HiCollection, labelKey: 'dashboard.enrollments', value: stats?.enrollments ?? 0, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
    { icon: HiTrendingUp, labelKey: 'dashboard.streak', value: stats?.streak ?? 0, color: 'text-icc-600', bg: 'bg-icc-100 dark:bg-icc-900/30' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">{t('dashboard.welcome', { name: user.name || user.email })}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.track_journey')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statCards.map((s) => (
          <div key={s.labelKey} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight">{s.value}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{t(s.labelKey as TranslationKey)}</p>
            </div>
          </div>
        ))}
      </div>

      {progress.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('dashboard.continue_learning')}</h2>
            <Link to="/lessons" className="text-sm text-icc-600 hover:underline">{t('dashboard.view_all')}</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {progress.filter((p) => p.lesson).slice(0, 8).map((p) => (
              p.lesson && <LessonCard key={p.id} lesson={p.lesson} />
            ))}
          </div>
        </section>
      )}

      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('dashboard.recent_activity')}</h2>
            <span className="text-xs text-gray-500">{t('dashboard.entries_count', { count: stats.recentActivity.length })}</span>
          </div>
          <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-2">
              {stats.recentActivity.slice(0, 10).map((log: any) => (
                <div key={log.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <HiPlay className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400 truncate">{log.action}</span>
                  <span className="text-xs text-gray-400 ml-auto shrink-0">{new Date(log.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
