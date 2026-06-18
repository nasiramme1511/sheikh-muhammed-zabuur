import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiBookOpen, HiUsers, HiPlay, HiClipboardCheck, HiTrendingUp, HiAcademicCap, HiClock, HiStar } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useTranslation, type TranslationKey } from '../../i18n';
import { courses as coursesApi } from '../../lib/api';
import api from '../../lib/api';

interface TeacherAnalytics {
  teacherId: number;
  totalCourses: number;
  totalLessons: number;
  totalStudents: number;
  totalAssignments: number;
  totalSubmissions: number;
  pendingGrading: number;
  avgCompletion: number;
}

interface SubmissionItem {
  id: number;
  studentName: string;
  assignmentTitle: string;
  courseTitle: string;
  submittedAt: string;
  status: string;
}

interface CourseWithStats {
  id: number;
  title: string;
  slug: string;
  status: string;
  language: string;
  teacherId?: number;
  _count?: { lessons: number; enrollments: number };
  description?: string;
  teacher?: { id: number; name: string };
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsRes, coursesRes] = await Promise.all([
          api.get('/analytics/teacher'),
          coursesApi.getAll({ status: 'All' }),
        ]);

        setAnalytics(analyticsRes.data);
        setCourses(coursesRes.data as CourseWithStats[]);

        // Fetch submissions pending grading via assignments
        try {
          const subsRes = await api.get('/assignments/submissions/pending');
          setSubmissions(Array.isArray(subsRes.data) ? subsRes.data : []);
        } catch {
          setSubmissions([]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-icc-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <HiAcademicCap className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-400 text-white text-sm font-semibold transition-all">
            {t('admin.retry')}
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: HiBookOpen,
      label: t('teacher_dashboard.total_courses'),
      value: analytics?.totalCourses ?? 0,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      icon: HiUsers,
      label: t('teacher_dashboard.total_students'),
      value: analytics?.totalStudents ?? 0,
      color: 'text-icc-500',
      bg: 'bg-icc-500/10 border-icc-500/20',
    },
    {
      icon: HiPlay,
      label: t('teacher_dashboard.total_lessons'),
      value: analytics?.totalLessons ?? 0,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      icon: HiClipboardCheck,
      label: t('teacher_dashboard.pending_grading'),
      value: analytics?.pendingGrading ?? 0,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  const myCourses = courses.filter(
    (c) => c.teacherId === analytics?.teacherId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.welcome', { name: user?.name || 'Teacher' })}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {t('teacher_dashboard.subtitle')}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-2xl ${s.bg} border p-5 transition-all duration-200 hover:scale-[1.02]`}>
            <div className="flex items-center gap-3">
              <s.icon className={`w-8 h-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <HiBookOpen className="w-4 h-4 text-icc-500" />
                {t('teacher_dashboard.my_courses')}
              </h2>
              <Link
                to="/teacher/courses"
                className="text-xs font-semibold text-icc-500 hover:text-icc-400 transition-colors"
              >
                {t('dashboard.view_all')}
              </Link>
          </div>
          <div className="p-2">
            {myCourses.length > 0 ? (
              <div className="space-y-0.5">
                {myCourses.slice(0, 5).map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        <Link
                          to={`/teacher/courses/${course.slug}`}
                          className="hover:text-icc-600 dark:hover:text-icc-400 transition-colors"
                        >
                          {course.title}
                        </Link>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {course._count?.lessons ?? 0} lessons &middot; {course._count?.enrollments ?? 0} students
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase shrink-0 ml-3 ${
                      course.status === 'PUBLISHED'
                        ? 'text-icc-500 bg-icc-50 dark:bg-icc-500/10 border-icc-200 dark:border-icc-500/20'
                        : 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-sm text-gray-400">
                {t('teacher_dashboard.no_courses')}
              </div>
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <HiClipboardCheck className="w-4 h-4 text-icc-500" />
                {t('teacher_dashboard.recent_submissions')}
              </h2>
              <span className="text-xs font-semibold text-amber-500">
                {analytics?.pendingGrading ?? 0} {t('teacher_dashboard.pending_grading')}
              </span>
          </div>
          <div className="p-2">
            {submissions.length > 0 ? (
              <div className="space-y-0.5">
                {submissions.slice(0, 8).map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <HiClock className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {sub.assignmentTitle || 'Assignment Submission'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {sub.studentName || 'A student'} &middot; {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 capitalize">{sub.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-sm text-gray-400">
                {analytics?.pendingGrading && analytics.pendingGrading > 0
                  ? t('teacher_dashboard.loading_submissions')
                  : t('teacher_dashboard.no_submissions_pending')}
              </div>
            )}
          </div>
          {submissions.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
              <Link
                to="/teacher/submissions"
                className="text-xs font-semibold text-icc-500 hover:text-icc-400 transition-colors"
              >
                {t('teacher_dashboard.review_all_submissions')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Course Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <HiTrendingUp className="w-4 h-4 text-icc-500" />
                {t('teacher_dashboard.course_analytics')}
              </h2>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-icc-400" />
                  {t('teacher_dashboard.avg_completion')}
                </span>
              </div>
          </div>
          <div className="p-4">
            {myCourses.length > 0 ? (
              <div className="space-y-4">
                {myCourses.slice(0, 4).map((course) => (
                  <div key={course.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{course.title}</span>
                      <span className="text-xs text-gray-500 shrink-0 ml-3">
                        {course._count?.enrollments ?? 0} enrolled
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-icc-500 to-icc-400 rounded-full transition-all duration-500"
                        style={{ width: `${analytics?.avgCompletion ?? 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">{analytics?.avgCompletion ?? 0}% average completion</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-sm text-gray-400">
                {t('teacher_dashboard.no_course_data')}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <HiStar className="w-4 h-4 text-icc-500" />
                {t('teacher_dashboard.quick_actions')}
              </h2>
          </div>
          <div className="p-4 space-y-3">
            <Link
              to="/teacher/courses"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-icc-500/10 border border-icc-500/20 hover:bg-icc-500/20 transition-all text-sm font-medium text-icc-400"
            >
              <HiBookOpen className="w-5 h-5" />
              {t('teacher_dashboard.create_course')}
            </Link>
            <Link
              to="/resources"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-sm font-medium text-blue-400"
            >
              <HiAcademicCap className="w-5 h-5" />
              {t('teacher_dashboard.resource_uploads')}
            </Link>
            <Link
              to="/admin/lessons"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all text-sm font-medium text-purple-400"
            >
              <HiPlay className="w-5 h-5" />
              {t('teacher_dashboard.total_lessons')}
            </Link>
            <Link
              to="/teacher/courses"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-sm font-medium text-amber-400"
            >
              <HiClipboardCheck className="w-5 h-5" />
              {t('teacher_dashboard.grade')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
