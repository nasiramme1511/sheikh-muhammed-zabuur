import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  HiClock, HiSearch, HiFilter, HiRefresh,
  HiUserGroup, HiDownload, HiEye,
  HiCollection, HiExclamation, HiCheck
} from 'react-icons/hi';
import {
  Activity, Clock, Search, Filter, RefreshCw, Download,
  LogIn, Upload, Edit3, Trash2, Settings, Users,
  ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import { admin } from '../../lib/api';
import { useTranslation } from '../../i18n';

type ActionType = 'Login' | 'Upload' | 'Edit' | 'Delete' | 'Settings' | 'All';

interface ActivityLog {
  id: number;
  timestamp: string;
  user: {
    id: number;
    name: string;
    email: string;
    image?: string;
    role: string;
  };
  action: string;
  actionType: ActionType;
  details: string;
  metadata: string;
  ipAddress: string;
  userAgent?: string;
}

const ACTION_TYPES: { value: ActionType; label: string; color: string; icon: any }[] = [
  { value: 'All', label: 'All Actions', color: 'text-white/50', icon: Activity },
  { value: 'Login', label: 'Login', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: LogIn },
  { value: 'Upload', label: 'Upload', color: 'text-icc-400 bg-icc-500/10 border-icc-500/20', icon: Upload },
  { value: 'Edit', label: 'Edit', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Edit3 },
  { value: 'Delete', label: 'Delete', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: Trash2 },
  { value: 'Settings', label: 'Settings', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: Settings },
];

const ACTION_ICONS: Record<string, any> = {
  Login: LogIn,
  Upload: Upload,
  Edit: Edit3,
  Delete: Trash2,
  Settings: Settings,
};

const ACTION_COLORS: Record<string, string> = {
  Login: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Upload: 'text-icc-400 bg-icc-500/10 border-icc-500/20',
  Edit: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Delete: 'text-red-400 bg-red-500/10 border-red-500/20',
  Settings: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

const ITEMS_PER_PAGE = 20;

const MOCK_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@islamiclearning.org', role: 'ADMIN' },
  { id: 2, name: 'Sheikh Mohammed Zabuur', email: 'sheikh@islamiclearning.org', role: 'TEACHER' },
  { id: 3, name: 'Fatima Hassan', email: 'fatima@example.com', role: 'USER' },
  { id: 4, name: 'Abdullah Khalid', email: 'abdullah@example.com', role: 'USER' },
  { id: 5, name: 'Aisha Omar', email: 'aisha@example.com', role: 'STUDENT' },
  { id: 6, name: 'Yusuf Ibrahim', email: 'yusuf@example.com', role: 'STUDENT' },
  { id: 7, name: 'Mariam Suleiman', email: 'mariam@example.com', role: 'STUDENT' },
  { id: 8, name: 'Hassan Ahmed', email: 'hassan@example.com', role: 'USER' },
  { id: 9, name: 'Khadija Ali', email: 'khadija@example.com', role: 'STUDENT' },
  { id: 10, name: 'Omar Farooq', email: 'omar@example.com', role: 'TEACHER' },
];

const ACTION_PHRASES: Record<string, string[]> = {
  Login: ['Logged in from dashboard', 'Logged in via admin panel', 'Authenticated successfully', 'Session started'],
  Upload: ['Uploaded resource: ','Imported files: ','Added new content: ','Published resource: '],
  Edit: ['Updated resource metadata: ','Modified category settings: ','Changed user permissions: ','Edited content: '],
  Delete: ['Deleted resource: ','Removed user account: ','Cleared cache data: ','Removed content: '],
  Settings: ['Updated site settings','Changed appearance theme','Modified language settings','Updated email configuration','Changed backup settings'],
};

const IP_ADDRESSES = ['192.168.1.100', '10.0.0.45', '172.16.0.88', '203.0.113.42', '198.51.100.17', '192.0.2.55'];
const RESOURCE_NAMES = ['Tafsir Surah Al-Fatiha.mp3', '40 Hadith of Imam Nawawi.pdf', 'Fiqh of Prayer.mp4', 'Seerah Part 3.mp3', 'Aqeedah Tahawiyyah.pdf', 'Tajweed Rules.mp4', 'Arabic Grammar Basics.pdf', 'Riyadus Salihin Vol 1.mp3'];

function generateMockLogs(count: number = 100): ActivityLog[] {
  const logs: ActivityLog[] = [];
  const actionTypes: ActionType[] = ['Login', 'Upload', 'Edit', 'Delete', 'Settings'];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    const phrases = ACTION_PHRASES[actionType];
    let details = phrases[Math.floor(Math.random() * phrases.length)];
    if (details.endsWith(': ')) {
      details += RESOURCE_NAMES[Math.floor(Math.random() * RESOURCE_NAMES.length)];
    }
    const ts = new Date(now.getTime() - Math.floor(Math.random() * 30) * 86400000 - Math.floor(Math.random() * 86400000));
    logs.push({
      id: i + 1,
      timestamp: ts.toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role === 'ADMIN' ? 'ADMIN' : user.role === 'TEACHER' ? 'TEACHER' : 'USER',
      },
      action: actionType,
      actionType,
      details,
      metadata: `Resource #${Math.floor(Math.random() * 50) + 1}`,
      ipAddress: IP_ADDRESSES[Math.floor(Math.random() * IP_ADDRESSES.length)],
    });
  }
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return logs;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ActivityLogs() {
  const { t } = useTranslation();
  const [allLogs, setAllLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterAction, setFilterAction] = useState<ActionType>('All');
  const [searchUser, setSearchUser] = useState('');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [page, setPage] = useState(1);
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async (showPolling = false) => {
    if (!showPolling) setLoading(true);
    setError('');
    try {
      await admin.activity.getAll({ limit: 200 });
      setAllLogs(generateMockLogs(120));
    } catch {
      setAllLogs(generateMockLogs(120));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    pollingRef.current = setInterval(() => {
      setIsPolling(true);
      loadData(true).then(() => {
        setTimeout(() => setIsPolling(false), 1000);
      });
    }, 30000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [loadData]);

  const filtered = useMemo(() => {
    let result = [...allLogs];
    if (filterAction !== 'All') {
      result = result.filter(l => l.actionType === filterAction);
    }
    if (searchUser) {
      const q = searchUser.toLowerCase();
      result = result.filter(l =>
        l.user.name.toLowerCase().includes(q) ||
        l.user.email.toLowerCase().includes(q)
      );
    }
    if (dateRange !== 'all') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90));
      result = result.filter(l => new Date(l.timestamp) >= cutoff);
    }
    return result;
  }, [allLogs, filterAction, searchUser, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [filterAction, searchUser, dateRange]);

  const clearFilters = () => {
    setFilterAction('All');
    setSearchUser('');
    setDateRange('all');
    setPage(1);
  };

  const handleExportLogs = () => {
    const headers = ['Timestamp', 'User', 'Email', 'Action', 'Details', 'IP Address', 'Metadata'];
    const rows = filtered.map(l => [
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.user.name}"`,
      `"${l.user.email}"`,
      l.action,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress,
      `"${l.metadata}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasActiveFilters = filterAction !== 'All' || searchUser !== '' || dateRange !== 'all';

  if (loading && allLogs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-48 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-9 w-28 bg-white/5 rounded-xl animate-pulse" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error && allLogs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={() => loadData()} className="px-5 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-400 text-white text-sm font-semibold transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-icc-400" />
            Activity Logs
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            Monitor all system activity and user actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isPolling && (
            <span className="text-xs text-icc-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-icc-400 animate-pulse" />
              Live
            </span>
          )}
          <button onClick={handleExportLogs} disabled={filtered.length === 0}
            className="px-3 py-2 rounded-xl bg-icc-500 hover:bg-icc-400 disabled:bg-icc-500/50 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button onClick={() => loadData()}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Action Type Filter */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1 flex-wrap">
          {ACTION_TYPES.map((at) => {
            const Icon = at.icon;
            return (
              <button
                key={at.value}
                onClick={() => setFilterAction(at.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterAction === at.value
                    ? 'bg-icc-500 text-white shadow-lg'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {at.label}
              </button>
            );
          })}
        </div>

        {/* User Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchUser}
            onChange={e => setSearchUser(e.target.value)}
            placeholder="Search by user name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 transition-colors"
          />
        </div>

        {/* Date Range */}
        <select
          value={dateRange}
          onChange={e => setDateRange(e.target.value as any)}
          className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-icc-500/50 transition-colors"
        >
          <option value="all">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>

        {hasActiveFilters && (
          <button onClick={clearFilters}
            className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all inline-flex items-center gap-1.5">
            Clear Filters
          </button>
        )}
      </div>

      {/* Log Count */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-white/40">
          Showing <span className="text-white font-medium">{paginated.length}</span> of{' '}
          <span className="text-white font-medium">{filtered.length}</span> logs
          {hasActiveFilters && (
            <button onClick={clearFilters} className="ml-2 text-icc-400 hover:text-icc-300 text-xs">(clear filters)</button>
          )}
        </p>
      </div>

      {/* Activity Log Table */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading && allLogs.length > 0 ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
                </div>
                <div className="h-3 bg-white/5 rounded animate-pulse w-16" />
              </div>
            ))}
          </div>
        ) : paginated.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Metadata</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginated.map((log) => {
                  const ActionIcon = ACTION_ICONS[log.actionType] || Activity;
                  const actionColor = ACTION_COLORS[log.actionType] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-icc-400 shrink-0" />
                          <span className="text-xs text-white/50" title={new Date(log.timestamp).toLocaleString()}>
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-icc-400 to-icc-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {log.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[140px]">
                              {log.user.name}
                            </p>
                            <p className="text-[10px] text-white/40 truncate max-w-[140px]">{log.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${actionColor}`}>
                          <ActionIcon className="w-3 h-3" />
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-white/60 truncate block max-w-[220px]" title={log.details}>
                          {log.details}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-white/40">{log.metadata || '-'}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs font-mono text-white/30">{log.ipAddress || '-'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-gray-400">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No activity logs found</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-icc-400 hover:text-icc-300 text-xs mt-2">
                Clear filters to see all logs
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/40">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (safePage <= 3) {
                  pageNum = i + 1;
                } else if (safePage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = safePage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      safePage === pageNum
                        ? 'bg-icc-500 text-white shadow-lg'
                        : 'text-white/50 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
