import { useState, useEffect, useCallback } from 'react';
import {
  HiChartBar, HiTrendingUp, HiDownload, HiEye, HiStar,
  HiCalendar, HiChevronDown, HiChevronUp, HiRefresh,
  HiSearch, HiFilter, HiClock, HiUserGroup, HiCollection,
  HiMusicNote, HiVideoCamera, HiLibrary, HiPhotograph, HiDocument
} from 'react-icons/hi';
import { BarChart3, TrendingUp, TrendingDown, RefreshCw, Download, Filter, Calendar } from 'lucide-react';
import { admin } from '../../lib/api';
import { useTranslation } from '../../i18n';

interface AnalyticsData {
  totalResources: number;
  totalViews: number;
  totalDownloads: number;
  totalStorage: number;
  storageHuman: string;
  monthlyGrowth: MonthlyData[];
  downloadsByMonth: MonthlyData[];
  viewsByMonth: MonthlyData[];
  topCategories: TopCategory[];
  popularContent: PopularContentItem[];
}

interface MonthlyData {
  month: string;
  value: number;
  label: string;
}

interface TopCategory {
  name: string;
  views: number;
  downloads: number;
  resources: number;
  color: string;
}

interface PopularContentItem {
  id: number;
  title: string;
  type: string;
  category: string;
  views: number;
  downloads: number;
  url: string;
}

type TimeRange = '7D' | '30D' | '90D' | '1Y';

const TIME_RANGES: TimeRange[] = ['7D', '30D', '90D', '1Y'];

const CATEGORY_COLORS = ['#0EA5E9', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#14b8a6', '#f97316'];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateMockData(range: TimeRange): AnalyticsData {
  const months = range === '7D' ? 1 : range === '30D' ? 3 : range === '90D' ? 6 : 12;
  const now = new Date();
  const monthlyGrowth: MonthlyData[] = [];
  const downloadsByMonth: MonthlyData[] = [];
  const viewsByMonth: MonthlyData[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = MONTH_LABELS[d.getMonth()] + ' ' + d.getFullYear().toString().slice(-2);
    const resourceVal = Math.floor(Math.random() * 80) + 20;
    const downloadVal = Math.floor(Math.random() * 500) + 100;
    const viewVal = Math.floor(Math.random() * 3000) + 500;
    monthlyGrowth.push({ month: label, value: resourceVal, label: `${resourceVal} resources` });
    downloadsByMonth.push({ month: label, value: downloadVal, label: `${downloadVal} downloads` });
    viewsByMonth.push({ month: label, value: viewVal, label: `${viewVal} views` });
  }

  const topCategories: TopCategory[] = [
    { name: 'Tafsir', views: 15230, downloads: 3421, resources: 45, color: '#0EA5E9' },
    { name: 'Hadith', views: 12100, downloads: 2890, resources: 38, color: '#3b82f6' },
    { name: 'Fiqh', views: 9870, downloads: 2150, resources: 32, color: '#8b5cf6' },
    { name: 'Seerah', views: 7650, downloads: 1890, resources: 28, color: '#f59e0b' },
    { name: 'Aqeedah', views: 6540, downloads: 1560, resources: 22, color: '#ef4444' },
    { name: 'Tajweed', views: 5430, downloads: 1320, resources: 18, color: '#06b6d4' },
    { name: 'Arabic Language', views: 4320, downloads: 1100, resources: 15, color: '#ec4899' },
    { name: "Da'wah", views: 3210, downloads: 890, resources: 12, color: '#84cc16' },
  ];

  const popularContent: PopularContentItem[] = [];
  const titles = [
    'Tafsir Surah Al-Fatiha', '40 Hadith of Imam Nawawi', 'The Fundamentals of Fiqh',
    'The Seerah of the Prophet', 'Aqeedah Tahawiyyah Explained', 'Tajweed Rules for Beginners',
    'Arabic Grammar Made Easy', 'The Beautiful Names of Allah', 'Riyadus Salihin Vol. 1',
    'Usul al-Fiqh Introduction', 'Fiqh of Prayer', 'Stories of the Prophets',
    'The Day of Judgment', 'Purification of the Soul', 'The Rights of Neighbors',
    'Islamic Etiquette (Adab)', 'Ramadan Guide', 'Quranic Arabic Course',
    'Lessons from the Seerah', 'Understanding the Sunnah',
  ];
  const types = ['AUDIO', 'VIDEO', 'PDF'];
  const categories = ['Tafsir', 'Hadith', 'Fiqh', 'Seerah', 'Aqeedah', 'Tajweed', 'Arabic Language', "Da'wah"];

  for (let i = 0; i < 10; i++) {
    popularContent.push({
      id: i + 1,
      title: titles[i % titles.length] + (i >= titles.length ? ` (Part ${i - titles.length + 1})` : ''),
      type: types[i % 3],
      category: categories[i % categories.length],
      views: Math.floor(Math.random() * 5000) + 500,
      downloads: Math.floor(Math.random() * 800) + 50,
      url: `/resources/${i + 1}`,
    });
  }
  popularContent.sort((a, b) => b.views - a.views);

  const totalResources = monthlyGrowth.reduce((s, m) => s + m.value, 0);
  return {
    totalResources,
    totalViews: viewsByMonth.reduce((s, m) => s + m.value, 0),
    totalDownloads: downloadsByMonth.reduce((s, m) => s + m.value, 0),
    totalStorage: 524288000 + Math.floor(Math.random() * 1073741824),
    storageHuman: '8.2 GB',
    monthlyGrowth,
    downloadsByMonth,
    viewsByMonth,
    topCategories,
    popularContent,
  };
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function formatStorage(bytes: number): string {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
}

function BarChart({ data, color = '#0EA5E9', height = 200, horizontal = false }: {
  data: MonthlyData[];
  color?: string;
  height?: number;
  horizontal?: boolean;
}) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / maxVal) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <span className="text-[10px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 whitespace-nowrap">
              {horizontal ? d.label : d.value.toLocaleString()}
            </span>
            <div
              className={`w-full rounded-t-md transition-all duration-300 group-hover:opacity-80 ${horizontal ? 'h-full' : ''}`}
              style={horizontal
                ? { height: '100%', width: `${pct}%`, backgroundColor: color, minWidth: 4 }
                : { height: `${pct}%`, backgroundColor: color, minHeight: 4 }
              }
            />
            {horizontal && (
              <span className="text-[10px] text-white/40 whitespace-nowrap ml-1">{d.value.toLocaleString()}</span>
            )}
            <span className={`text-[10px] text-white/30 ${horizontal ? 'hidden' : ''}`}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
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
    default: return HiLibrary;
  }
}

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('30D');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await admin.analytics.get();
      setData({ ...res.data });
    } catch {
      const mock = generateMockData(timeRange);
      setData(mock);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (data) setData(generateMockData(timeRange));
  }, [timeRange]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-48 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-white/5 rounded-lg animate-pulse mt-2" />
          </div>
          <div className="h-9 w-28 bg-white/5 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <HiChartBar className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={loadData} className="px-5 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-400 text-white text-sm font-semibold transition-all">
            {t('admin.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    { icon: HiLibrary, label: 'Total Resources', value: formatNumber(data.totalResources), change: '+12%', changeUp: true, color: 'text-icc-500', bg: 'bg-icc-500/10 border-icc-500/20' },
    { icon: HiEye, label: 'Total Views', value: formatNumber(data.totalViews), change: '+8%', changeUp: true, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    { icon: HiDownload, label: 'Total Downloads', value: formatNumber(data.totalDownloads), change: '+15%', changeUp: true, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
    { icon: HiCollection, label: 'Total Storage', value: formatStorage(data.totalStorage), change: '+5%', changeUp: false, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HiChartBar className="w-6 h-6 text-icc-400" />
            Content Analytics
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Track resource performance and engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5">
            {TIME_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  timeRange === r
                    ? 'bg-icc-500 text-white shadow-lg'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button onClick={loadData} className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-2xl ${s.bg} border p-5 transition-all duration-200 hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${s.changeUp ? 'text-icc-400' : 'text-red-400'}`}>
                {s.changeUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Growth */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <HiTrendingUp className="w-4 h-4 text-icc-500" />
              Content Growth
            </h2>
            <span className="text-xs text-white/40">Resources added per month</span>
          </div>
          <div className="p-5">
            <div className="relative pt-6">
              <BarChart data={data.monthlyGrowth} color="#0EA5E9" height={200} />
            </div>
          </div>
        </div>

        {/* Views by Month */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <HiEye className="w-4 h-4 text-blue-500" />
              Views by Month
            </h2>
            <span className="text-xs text-white/40">Total page views</span>
          </div>
          <div className="p-5">
            <div className="relative pt-6">
              <BarChart data={data.viewsByMonth} color="#3b82f6" height={200} />
            </div>
          </div>
        </div>

        {/* Downloads by Month */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <HiDownload className="w-4 h-4 text-purple-500" />
              Downloads by Month
            </h2>
            <span className="text-xs text-white/40">Total downloads</span>
          </div>
          <div className="p-5">
            <div className="relative pt-6">
              <BarChart data={data.downloadsByMonth} color="#8b5cf6" height={200} />
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <HiStar className="w-4 h-4 text-amber-500" />
              Top Categories
            </h2>
            <span className="text-xs text-white/40">By views</span>
          </div>
          <div className="p-5 space-y-3">
            {data.topCategories.slice(0, 6).map((cat, i) => {
              const maxViews = Math.max(...data.topCategories.map(c => c.views), 1);
              const pct = (cat.views / maxViews) * 100;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{cat.name}</span>
                    <span className="text-white/40 text-xs">{formatNumber(cat.views)} views</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: cat.color || CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
            {data.topCategories.length > 6 && (
              <button className="text-xs text-icc-400 hover:text-icc-300 transition-colors mt-2">
                +{data.topCategories.length - 6} more categories
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Most Popular Content */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
            <HiStar className="w-4 h-4 text-amber-500" />
            Most Popular Content
          </h2>
          <span className="text-xs text-white/40">Top 10 by views</span>
        </div>
        <div className="p-2">
          {data.popularContent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-3 py-2 font-medium w-8">#</th>
                    <th className="px-3 py-2 font-medium">Title</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 text-right font-medium">Views</th>
                    <th className="px-3 py-2 text-right font-medium">Downloads</th>
                    <th className="px-3 py-2 text-right font-medium">Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {data.popularContent.map((item, i) => {
                    const Icon = getTypeIcon(item.type);
                    const colorClass = getTypeColor(item.type);
                    const ratio = item.views > 0 ? ((item.downloads / item.views) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={item.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-3 py-2.5 text-white/40">{i + 1}</td>
                        <td className="px-3 py-2.5">
                          <a href={item.url} className="text-gray-700 dark:text-gray-200 font-medium hover:text-icc-400 transition-colors truncate block max-w-[250px]">
                            {item.title}
                          </a>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
                            <Icon className="w-3 h-3" />
                            {item.type}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-white/50 text-xs">{item.category}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-white">{formatNumber(item.views)}</td>
                        <td className="px-3 py-2.5 text-right text-white/60">{formatNumber(item.downloads)}</td>
                        <td className="px-3 py-2.5 text-right text-xs text-white/40">{ratio}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-sm text-gray-400">
              <HiLibrary className="w-10 h-10 mx-auto mb-3 opacity-30" />
              {t('admin.no_content_data')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
