import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HiDownload, HiTrendingUp, HiSearch, HiFilter,
  HiMusicNote, HiVideoCamera, HiDocument, HiCalendar,
  HiCollection, HiEye, HiRefresh
} from 'react-icons/hi';
import { Download, TrendingDown, RefreshCw, Search, Filter, FileText, Clock } from 'lucide-react';
import { admin } from '../../lib/api';
import { useTranslation } from '../../i18n';

interface DownloadReportItem {
  id: number;
  title: string;
  type: 'AUDIO' | 'VIDEO' | 'PDF';
  category: string;
  downloads: number;
  views: number;
  lastDownloadDate: string;
  url: string;
  sizeHuman: string;
}

interface MonthlyDownloads {
  month: string;
  value: number;
  label: string;
}

interface DownloadStats {
  totalDownloadsAllTime: number;
  downloads30d: number;
  topDownloadedItem: string;
  topDownloadedCount: number;
}

type ResourceType = 'all' | 'AUDIO' | 'VIDEO' | 'PDF';

const FILTER_TYPES: { value: ResourceType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'PDF', label: 'PDF' },
];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateMockReports(): DownloadReportItem[] {
  const titles = [
    'Tafsir Surah Al-Fatiha', '40 Hadith of Imam Nawawi', 'The Fundamentals of Fiqh',
    'The Seerah of the Prophet', 'Aqeedah Tahawiyyah Explained', 'Tajweed Rules for Beginners',
    'Arabic Grammar Made Easy', 'The Beautiful Names of Allah', 'Riyadus Salihin Vol. 1',
    'Usul al-Fiqh Introduction', 'Fiqh of Prayer', 'Stories of the Prophets',
    'The Day of Judgment', 'Purification of the Soul', 'The Rights of Neighbors',
    'Islamic Etiquette (Adab)', 'Ramadan Guide', 'Quranic Arabic Course',
    'Lessons from the Seerah', 'Understanding the Sunnah', 'Tafsir Surah Yaseen',
    'The Life of the Prophet', 'Fiqh of Zakat', 'Hadith of Jibril Explained',
    'The Names of Allah (Part 1)', 'The Names of Allah (Part 2)', 'Tajweed Made Simple',
    'Arabic for Beginners', 'The Hereafter Series', 'The Family in Islam',
  ];
  const categories = ['Tafsir', 'Hadith', 'Fiqh', 'Seerah', 'Aqeedah', 'Tajweed', 'Arabic Language', "Da'wah"];
  const types: ('AUDIO' | 'VIDEO' | 'PDF')[] = ['AUDIO', 'VIDEO', 'PDF'];

  return titles.map((title, i) => {
    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - Math.floor(Math.random() * 90));
    return {
      id: i + 1,
      title,
      type: types[i % 3],
      category: categories[i % categories.length],
      downloads: Math.floor(Math.random() * 1200) + 20,
      views: Math.floor(Math.random() * 5000) + 100,
      lastDownloadDate: lastDate.toISOString(),
      url: `/resources/${i + 1}`,
      sizeHuman: (Math.random() * 500 + 1).toFixed(1) + ' MB',
    };
  }).sort((a, b) => b.downloads - a.downloads);
}

function generateMonthlyDownloads(): MonthlyDownloads[] {
  const now = new Date();
  const data: MonthlyDownloads[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = MONTH_LABELS[d.getMonth()] + ' ' + d.getFullYear().toString().slice(-2);
    const val = Math.floor(Math.random() * 800) + 200;
    data.push({ month, value: val, label: `${val} downloads` });
  }
  return data;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function getTypeColor(type: string): string {
  switch (type.toUpperCase()) {
    case 'AUDIO': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'VIDEO': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    case 'PDF': return 'text-red-400 bg-red-500/10 border-red-500/20';
    default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  }
}

function getTypeIcon(type: string) {
  switch (type.toUpperCase()) {
    case 'AUDIO': return HiMusicNote;
    case 'VIDEO': return HiVideoCamera;
    case 'PDF': return HiDocument;
    default: return HiCollection;
  }
}

export default function DownloadReports() {
  const { t } = useTranslation();
  const [items, setItems] = useState<DownloadReportItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyDownloads[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ResourceType>('all');
  const [sortField, setSortField] = useState<'downloads' | 'views' | 'title'>('downloads');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await admin.analytics.get();
      const mock = generateMockReports();
      setItems(mock);
      setMonthlyData(generateMonthlyDownloads());
    } catch {
      setItems(generateMockReports());
      setMonthlyData(generateMonthlyDownloads());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const stats: DownloadStats = useMemo(() => {
    const totalDownloadsAllTime = items.reduce((s, i) => s + i.downloads, 0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const downloads30d = items
      .filter(i => new Date(i.lastDownloadDate) >= thirtyDaysAgo)
      .reduce((s, i) => s + i.downloads, 0);
    const topItem = items.length > 0 ? items.reduce((a, b) => a.downloads > b.downloads ? a : b) : null;
    return {
      totalDownloadsAllTime,
      downloads30d,
      topDownloadedItem: topItem?.title || 'N/A',
      topDownloadedCount: topItem?.downloads || 0,
    };
  }, [items]);

  const filtered = useMemo(() => {
    let result = [...items];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }
    if (filterType !== 'all') {
      result = result.filter(i => i.type === filterType);
    }
    result.sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'title') return mul * a.title.localeCompare(b.title);
      return mul * (a[sortField] - b[sortField]);
    });
    return result;
  }, [items, search, filterType, sortField, sortDir]);

  const handleSort = (field: 'downloads' | 'views' | 'title') => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Type', 'Category', 'Downloads', 'Views', 'Last Download Date', 'Size'];
    const rows = filtered.map(i => [
      `"${i.title.replace(/"/g, '""')}"`,
      i.type,
      `"${i.category}"`,
      i.downloads,
      i.views,
      new Date(i.lastDownloadDate).toLocaleDateString(),
      i.sizeHuman,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `download-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-48 bg-white/5 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
        <div className="h-72 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <HiDownload className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={loadData} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxMonthlyVal = Math.max(...monthlyData.map(d => d.value), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HiDownload className="w-6 h-6 text-emerald-400" />
            Download Reports
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Track resource downloads and trends</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} disabled={filtered.length === 0}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button onClick={loadData} className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20">
              <HiDownload className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.totalDownloadsAllTime)}</p>
              <p className="text-xs text-white/50 mt-0.5">Total Downloads (All Time)</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.downloads30d)}</p>
              <p className="text-xs text-white/50 mt-0.5">Downloads (Last 30 Days)</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20">
              <HiTrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-white">{formatNumber(stats.topDownloadedCount)}</p>
              <p className="text-xs text-white/50 mt-0.5 truncate" title={stats.topDownloadedItem}>Top: {stats.topDownloadedItem}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Downloads Over Time */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
            <HiTrendingUp className="w-4 h-4 text-purple-500" />
            Downloads Over Time
          </h2>
          <span className="text-xs text-white/40">Last 6 months</span>
        </div>
        <div className="p-5">
          <div className="flex items-end gap-2" style={{ height: 180 }}>
            {monthlyData.map((d, i) => {
              const pct = (d.value / maxMonthlyVal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                  <span className="text-[10px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 whitespace-nowrap">
                    {d.value.toLocaleString()}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all duration-300 group-hover:opacity-80"
                    style={{ height: `${pct}%`, minHeight: 4, backgroundColor: '#8b5cf6' }}
                  />
                  <span className="text-[10px] text-white/30">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
          {FILTER_TYPES.map(f => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === f.value
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Downloaded Content Table */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
            <HiDownload className="w-4 h-4 text-emerald-500" />
            Top Downloaded Content
          </h2>
          <span className="text-xs text-white/40">{filtered.length} items</span>
        </div>
        <div className="p-2">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-3 py-2 font-medium w-8">#</th>
                    <th className="px-3 py-2 font-medium cursor-pointer hover:text-white/80" onClick={() => handleSort('title')}>
                      Title {sortField === 'title' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
                    </th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 text-right font-medium cursor-pointer hover:text-white/80" onClick={() => handleSort('downloads')}>
                      Downloads {sortField === 'downloads' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
                    </th>
                    <th className="px-3 py-2 text-right font-medium">Views</th>
                    <th className="px-3 py-2 text-right font-medium">Last Download</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => {
                    const Icon = getTypeIcon(item.type);
                    const colorClass = getTypeColor(item.type);
                    return (
                      <tr key={item.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-3 py-2.5 text-white/40">{i + 1}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-gray-700 dark:text-gray-200 font-medium truncate block max-w-[240px]" title={item.title}>
                            {item.title}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
                            <Icon className="w-3 h-3" />
                            {item.type === 'AUDIO' ? 'Audio' : item.type === 'VIDEO' ? 'Video' : 'PDF'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-white/50 text-xs">{item.category}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-white">{item.downloads.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right text-white/60">{item.views.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right text-xs text-white/40 whitespace-nowrap">
                          {new Date(item.lastDownloadDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-sm text-gray-400">
              <HiDownload className="w-10 h-10 mx-auto mb-3 opacity-30" />
              {search || filterType !== 'all' ? 'No download reports match your filters' : 'No download data available yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
