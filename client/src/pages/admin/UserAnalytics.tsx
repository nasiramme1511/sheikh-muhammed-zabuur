import { useState, useEffect } from 'react';
import {
  Users, UserPlus, UserCheck, ShieldCheck, GraduationCap,
  BarChart3, Download, RefreshCw, AlertCircle, Activity,
  Calendar, TrendingUp, Bookmark, Play
} from 'lucide-react';
import api, { admin } from '../../lib/api';
import { useTranslation } from '../../i18n';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers30d: number;
  totalAdmins: number;
  totalStudents: number;
}

interface MonthlySignup {
  month: string;
  count: number;
}

interface RoleDistribution {
  role: string;
  count: number;
  percentage: number;
  color: string;
}

interface ActiveUser {
  id: number;
  name: string;
  email: string;
  _count: { bookmarks: number; progress: number };
  lastActive: string;
  createdAt?: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#8b5cf6',
  USER: '#0EA5E9',
  STUDENT: '#3b82f6',
  TEACHER: '#f59e0b',
  MODERATOR: '#06b6d4',
};

const MONTH_COLORS = [
  '#0EA5E9', '#38BDF8', '#7DD3FC', '#a7f3d0',
  '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe',
  '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe',
];

export default function UserAnalytics() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0, activeUsers: 0, newUsers30d: 0, totalAdmins: 0, totalStudents: 0,
  });
  const [monthlySignups, setMonthlySignups] = useState<MonthlySignup[]>([]);
  const [roleDist, setRoleDist] = useState<RoleDistribution[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      admin.getStats(),
      admin.analytics.get(),
      admin.users.getAll({ limit: 100 }),
      admin.activity.getAll({ limit: 50 }),
      api.get('/users/stats'),
    ])
      .then(([statsRes, analyticsRes, usersRes, activityRes, userStatsRes]) => {
        const s = { ...statsRes.data, ...analyticsRes.data, ...userStatsRes.data };
        setStats({
          totalUsers: s.totalUsers ?? s.total_users ?? 0,
          activeUsers: s.activeUsers ?? s.active_users ?? 0,
          newUsers30d: s.newUsers30d ?? s.new_users_30d ?? s.newUsers ?? 0,
          totalAdmins: s.totalAdmins ?? s.total_admins ?? 0,
          totalStudents: s.totalStudents ?? s.total_students ?? 0,
        });

        const userList = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.items ?? [];
        const activityList = Array.isArray(activityRes.data) ? activityRes.data : activityRes.data?.items ?? [];

        // Monthly signups from user creation dates
        const byMonth: Record<string, number> = {};
        userList.forEach((u: any) => {
          if (u.createdAt) {
            const key = new Date(u.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
            byMonth[key] = (byMonth[key] || 0) + 1;
          }
        });
        setMonthlySignups(
          Object.entries(byMonth)
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => {
              const dateA = new Date(a.month + ' 2000');
              const dateB = new Date(b.month + ' 2000');
              return dateA.getTime() - dateB.getTime();
            })
            .slice(-12)
        );

        // Role distribution
        const byRole: Record<string, number> = {};
        userList.forEach((u: any) => {
          const role = u.role || 'USER';
          byRole[role] = (byRole[role] || 0) + 1;
        });
        const totalUsersInRole = Object.values(byRole).reduce((a, b) => a + b, 0);
        setRoleDist(
          Object.entries(byRole).map(([role, count]) => ({
            role,
            count,
            percentage: totalUsersInRole > 0 ? (count / totalUsersInRole) * 100 : 0,
            color: ROLE_COLORS[role] || '#6b7280',
          }))
        );

        // Active users - sort by bookmark+progress count
        const scored = userList
          .map((u: ActiveUser) => ({
            ...u,
            _count: u._count || { bookmarks: 0, progress: 0 },
            lastActive: u.lastActive || u.createdAt,
            score: (u._count?.bookmarks || 0) + (u._count?.progress || 0),
          }))
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 20);
        setActiveUsers(scored);
      })
      .catch(() => setError('Failed to load analytics data'))
      .finally(() => setLoading(false));
  };

  const maxSignup = Math.max(...monthlySignups.map(m => m.count), 1);

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
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={loadData} className="px-5 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-400 text-white text-sm font-semibold transition-all">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-icc-500" />
            User Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Insights into user growth, roles, and activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-icc-500 hover:border-icc-500 transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => alert('Export feature coming soon!')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers.toLocaleString()} color="text-icc-500" bg="bg-icc-500/10 border-icc-500/20" />
        <StatCard icon={UserCheck} label="Active Users" value={stats.activeUsers.toLocaleString()} color="text-blue-500" bg="bg-blue-500/10 border-blue-500/20" />
        <StatCard icon={UserPlus} label="New Users (30d)" value={stats.newUsers30d.toLocaleString()} color="text-cyan-500" bg="bg-cyan-500/10 border-cyan-500/20" />
        <StatCard icon={ShieldCheck} label="Total Admins" value={stats.totalAdmins.toLocaleString()} color="text-purple-500" bg="bg-purple-500/10 border-purple-500/20" />
        <StatCard icon={GraduationCap} label="Total Students" value={stats.totalStudents.toLocaleString()} color="text-amber-500" bg="bg-amber-500/10 border-amber-500/20" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Bar Chart */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-icc-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">User Growth (Monthly Signups)</h2>
          </div>
          <div className="p-5">
            {monthlySignups.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">No signup data available</div>
            ) : (
              <div className="space-y-2">
                {monthlySignups.map((item, i) => (
                  <div key={item.month} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16 shrink-0">{item.month}</span>
                    <div className="flex-1 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                      <div
                        className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                        style={{
                          width: `${Math.max((item.count / maxSignup) * 100, 4)}%`,
                          backgroundColor: MONTH_COLORS[i % MONTH_COLORS.length],
                        }}
                      >
                        {item.count > 0 && item.count / maxSignup > 0.15 && (
                          <span className="text-[10px] font-bold text-white">{item.count}</span>
                        )}
                      </div>
                    </div>
                    {item.count / maxSignup <= 0.15 && (
                      <span className="text-xs text-gray-400 w-6 text-right">{item.count}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Role Distribution Pie Chart */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-icc-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Users by Role</h2>
          </div>
          <div className="p-5 flex items-center gap-6">
            {roleDist.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400 w-full">No role data available</div>
            ) : (
              <>
                {/* Pie chart using conic-gradient */}
                <div className="shrink-0">
                  <div
                    className="w-36 h-36 rounded-full"
                    style={{
                      background: `conic-gradient(${roleDist
                        .map((r, i) => {
                          const start = roleDist.slice(0, i).reduce((a, b) => a + b.percentage, 0);
                          return `${r.color} ${start}% ${start + r.percentage}%`;
                        })
                        .join(', ')})`,
                    }}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  {roleDist.map((role) => (
                    <div key={role.role} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 capitalize">{role.role.toLowerCase()}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{role.count}</span>
                      <span className="text-xs text-gray-400 w-10 text-right">{role.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active Users Table */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-icc-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Most Active Users</h2>
          </div>
          <span className="text-xs text-gray-400">{activeUsers.length} users</span>
        </div>
        {activeUsers.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No user activity data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Email</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Bookmarks</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Progress</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {activeUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-icc-400 to-icc-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{user.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-icc-500">
                        <Bookmark className="w-3 h-3" /> {user._count?.bookmarks ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-500">
                        <Play className="w-3 h-3" /> {user._count?.progress ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400 whitespace-nowrap">
                      {user.lastActive ? (
                        <span className="flex items-center justify-end gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.lastActive).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: any; label: string; value: string; color: string; bg: string;
}) {
  return (
    <div className={`rounded-2xl ${bg} border p-5 transition-all duration-200 hover:scale-[1.02]`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-8 h-8 ${color}`} />
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-white/50 mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  );
}
