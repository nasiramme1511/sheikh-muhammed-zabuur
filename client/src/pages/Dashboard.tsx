import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiBookmark, HiPlay, HiCheck, HiChartBar, HiAcademicCap, HiClipboardList, HiBadgeCheck, HiCalendar, HiCollection, HiTrendingUp } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useTranslation, type TranslationKey } from '../i18n';
import { users as usersApi, progress as progressApi, courses as coursesApi, tasks as tasksApi, assignments as assignmentsApi, certificates as certificatesApi } from '../lib/api';
import api from '../lib/api';
import type { UserProgress, Enrollment, Task, Submission, Certificate } from '../types';
import LessonCard from '../components/LessonCard';
import AIDashboardWidget from '../components/ai/AIDashboardWidget';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    Promise.all([
      usersApi.getStats(),
      progressApi.getAll(),
      coursesApi.getMyEnrollments(),
      tasksApi.getAll(),
      assignmentsApi.getMySubmissions(),
      certificatesApi.getMyCertificates(),
      api.get('/analytics/student'),
    ])
      .then(([statsRes, progRes, enrollRes, tasksRes, submissionsRes, certsRes, analyticsRes]) => {
        setStats(statsRes.data);
        setProgress(progRes.data);
        setEnrollments(enrollRes.data);
        setTasks(tasksRes.data);
        setSubmissions(submissionsRes.data);
        setCertificates(certsRes.data);
        setAnalytics(analyticsRes.data);
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

  const pendingTasks = tasks.filter((t) => t.status === 'PENDING');
  const upcomingSubmissions = submissions.filter(
    (s) => s.assignment?.dueDate && new Date(s.assignment.dueDate) > new Date() && s.status === 'PENDING'
  ).slice(0, 5);

  const statCards = [
    { icon: HiBookmark, labelKey: 'dashboard.bookmarks', value: stats?.bookmarkCount || 0, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: HiPlay, labelKey: 'dashboard.in_progress', value: stats?.inProgressCount || 0, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: HiCheck, labelKey: 'dashboard.completed', value: stats?.completedCount || 0, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { icon: HiChartBar, labelKey: 'dashboard.total_activity', value: stats?.recentActivity?.length || 0, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { icon: HiCollection, labelKey: 'dashboard.enrollments', value: stats?.enrollments ?? enrollments.length, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
    { icon: HiClipboardList, labelKey: 'dashboard.pending_tasks', value: stats?.pendingTasks ?? pendingTasks.length, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' },
    { icon: HiBadgeCheck, labelKey: 'dashboard.certificates', value: stats?.certificates ?? certificates.length, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { icon: HiTrendingUp, labelKey: 'dashboard.streak', value: stats?.streak ?? 0, color: 'text-icc-600', bg: 'bg-icc-100 dark:bg-icc-900/30' },
  ];

  function getPriorityColor(p: string) {
    switch (p) {
      case 'HIGH': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      default: return 'text-green-500 bg-green-100 dark:bg-green-900/30';
    }
  }

  function getStatusColor(s: string) {
    switch (s) {
      case 'PASSED': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'FAILED': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'REVIEWED': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'REVISION': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      default: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">{t('dashboard.welcome', { name: user.name || user.email })}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.track_journey')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
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

      <div className="mb-8">
        <AIDashboardWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {enrollments.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t('dashboard.my_courses')}</h2>
                <Link to="/courses" className="text-sm text-icc-600 hover:underline">{t('dashboard.view_all')}</Link>
              </div>
              <div className="space-y-3">
                {enrollments.slice(0, 4).map((enr) => (
                  <Link
                    key={enr.id}
                    to={`/courses/${enr.course?.slug}`}
                    className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                  >
                    {enr.course?.thumbnail ? (
                      <img src={enr.course.thumbnail} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-icc-100 to-icc-200 dark:from-icc-900/30 dark:to-icc-800/30 flex items-center justify-center shrink-0">
                        <HiAcademicCap className="w-6 h-6 text-icc-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{enr.course?.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-icc-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(enr.progress ?? 0, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{Math.round(enr.progress ?? 0)}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {pendingTasks.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t('dashboard.my_tasks')}</h2>
                <span className="text-xs text-gray-500">{pendingTasks.length} {t('dashboard.pending_tasks')}</span>
              </div>
              <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                {pendingTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="p-3 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'HIGH' ? 'bg-red-500' : task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                      {t('dashboard.priority_' + task.priority.toLowerCase() as TranslationKey)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {upcomingSubmissions.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t('dashboard.upcoming_deadlines')}</h2>
              </div>
              <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                {upcomingSubmissions.map((sub) => (
                  <div key={sub.id} className="p-3 flex items-center gap-3">
                    <HiCalendar className="w-4 h-4 text-red-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{sub.assignment?.title}</p>
                      <p className="text-xs text-gray-400">
                        {t('dashboard.due_prefix')}{sub.assignment?.dueDate ? new Date(sub.assignment.dueDate).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {analytics && (
            <section>
              <h2 className="text-lg font-semibold mb-4">{t('dashboard.learning_analytics')}</h2>
              <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">{t('dashboard.completion_rate')}</span>
                    <span className="font-semibold">{analytics.completionRate ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(analytics.completionRate ?? 0, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t('dashboard.quiz_average')}</span>
                  <span className="font-semibold">{analytics.quizAverage ?? 0}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t('dashboard.lessons_started')}</span>
                  <span className="font-semibold">{analytics.lessonsStarted ?? progress.length}</span>
                </div>
              </div>
            </section>
          )}

          {certificates.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">{t('dashboard.certificates')}</h2>
              <div className="space-y-2">
                {certificates.slice(0, 3).map((cert) => (
                  <Link
                    key={cert.id}
                    to={`/certificates/verify/${cert.verificationCode}`}
                    className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3 hover:shadow-md transition-shadow"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                      <HiBadgeCheck className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{cert.courseName}</p>
                      <p className="text-xs text-gray-400">{new Date(cert.issueDate).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
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
