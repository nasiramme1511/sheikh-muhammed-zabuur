import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Music, Video, FileText, Tv, Play, Download,
  Eye, BookOpen, Users, Clock, ChevronLeft, ChevronRight,
  Volume2, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { resourceCategories } from '../lib/api';
import type { Resource } from '../types';
import { useSEO } from '../seo/metadata';

interface CategoryInfo {
  name: string;
  slug: string;
}

interface Stats {
  audio: number;
  video: number;
  pdfs: number;
  recordings: number;
  images: number;
  total: number;
}

interface CategoryResponse {
  category: CategoryInfo;
  stats: Stats;
  items: Resource[];
  total: number;
  page: number;
  totalPages: number;
}

const TYPE_TABS = [
  { key: 'all', label: 'All', icon: Sparkles },
  { key: 'audio', label: 'Audio', icon: Music },
  { key: 'video', label: 'Video', icon: Video },
  { key: 'pdf', label: 'PDF', icon: FileText },
  { key: 'image', label: 'Images', icon: ImageIcon },
  { key: 'recordings', label: 'Recordings', icon: Tv },
];

const STAT_CARDS = [
  { key: 'audio', label: 'Audio Lectures', icon: Music, color: 'icc' },
  { key: 'video', label: 'Video Lectures', icon: Video, color: 'purple' },
  { key: 'pdfs', label: 'PDF Books', icon: FileText, color: 'red' },
  { key: 'images', label: 'Images', icon: ImageIcon, color: 'icc' },
  { key: 'recordings', label: 'Recordings', icon: Tv, color: 'amber' },
];

const CAT_COLORS: Record<string, string> = {
  'Aqeedah': 'bg-icc-500/10 text-icc-400 border-icc-500/20',
  'Hadith': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Tafsir': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Fiqh': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Seerah': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Arabic Language': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Tajweed': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Questions & Answers': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Ramadan Series': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Khutbah': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'General Lectures': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white/5 border border-white/5 p-5 h-32">
      <div className="flex gap-3 h-full">
        <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
          <div className="h-3 bg-white/10 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

function getYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function ResourceCategory() {
  const { slug } = useParams<{ slug: string }>();

  useSEO({
    title: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Category',
    description: `Browse Islamic educational resources in the ${slug || 'selected'} category.`,
  });
  const [data, setData] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    setTypeFilter('all');
    setSearchQuery('');
    setLoading(true);
  }, [slug]);

  useEffect(() => {
    fetchCategory();
  }, [slug, typeFilter, page]);

  const fetchCategory = async () => {
    setLoading(true);
    try {
      const res = await resourceCategories.getBySlug(slug!, {
        type: typeFilter === 'all' ? undefined : typeFilter,
        search: searchQuery || undefined,
        page,
        limit: 20,
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching category:', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCategory();
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    setPage(1);
  };

  const totalPages = data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16 text-white px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
          <Link to="/" className="hover:text-icc-400 transition-colors">Home</Link>
          <span>/</span>
          {data ? (
            <span className="text-white/70 font-medium">{data.category.name}</span>
          ) : (
            <span className="text-white/50 capitalize">{slug?.replace(/-/g, ' ')}</span>
          )}
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold capitalize">
              {data?.category.name || slug?.replace(/-/g, ' ') || 'Category'}
            </h1>
            {data && (
              <p className="text-white/50 text-sm mt-1">
                {data.stats.total} resource{data.stats.total !== 1 ? 's' : ''} in this category
              </p>
            )}
          </div>
          <form onSubmit={handleSearch} className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search within category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-icc-500/40 transition-colors"
            />
          </form>
        </div>

        {/* Stats Cards */}
        {data && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {STAT_CARDS.map((stat) => {
              const count = data.stats[stat.key as keyof Stats] as number;
              const Icon = stat.icon;
              return (
                <div
                  key={stat.key}
                  className={`rounded-2xl bg-${stat.color}-500/5 border border-${stat.color}-500/10 p-4 flex items-center gap-3`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 border border-${stat.color}-500/20 flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-[11px] text-white/50">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TYPE_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => handleTypeChange(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  typeFilter === tab.key
                    ? 'bg-icc-500/10 text-icc-400 border-icc-500/20'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-dark-800/30 border border-white/5">
            <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-lg text-white/60 font-medium">No resources found</p>
            <p className="text-sm text-white/40 mt-1">
              {searchQuery ? 'Try a different search term' : 'No content available in this category yet'}
            </p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setPage(1); }}
                className="mt-4 px-4 py-2 rounded-xl bg-icc-500/10 text-icc-400 border border-icc-500/20 text-sm font-semibold hover:bg-icc-500/20 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.items.map((resource, idx) => (
                <ResourceCard key={resource.id} resource={resource} index={idx} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-semibold border transition-all ${
                        page === pageNum
                          ? 'bg-icc-500/10 text-icc-400 border-icc-500/20'
                          : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ resource, index }: { resource: Resource; index: number }) {
  const ytId = getYoutubeId(resource.url);
  const isVideo = resource.resourceType === 'VIDEO' && resource.fileType !== 'recording';
  const isAudio = resource.resourceType === 'AUDIO';
  const isPdf = resource.resourceType === 'PDF';
  const isImage = resource.resourceType === 'IMAGE';
  const isRecording = resource.resourceType === 'VIDEO' && resource.fileType === 'recording';

  if (isRecording || (isVideo && !ytId)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="glass-card overflow-hidden group hover:border-amber-500/30 transition-all"
      >
        <div className="aspect-video bg-dark-950 relative flex items-center justify-center bg-gradient-to-br from-amber-950/40 to-dark-950">
          <Tv className="w-8 h-8 text-amber-400/40" />
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] bg-red-500/20 text-red-400 border border-red-500/20 font-semibold uppercase">Replay</span>
        </div>
        <div className="p-4">
          <span className={`inline-block mb-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${CAT_COLORS[resource.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
            {resource.category}
          </span>
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">{resource.title}</h3>
          <div className="flex items-center justify-between mt-3 text-xs text-white/40">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{resource.views}</span>
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold">
              <Play className="w-3.5 h-3.5" /> Watch
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  if (isVideo && ytId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="glass-card overflow-hidden group hover:border-purple-500/30 transition-all"
      >
        <a href={resource.url} target="_blank" rel="noopener noreferrer">
          <div className="aspect-video bg-dark-950 relative overflow-hidden">
            <img
              src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
              alt={resource.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => (e.target as HTMLImageElement).src = '/video-placeholder.jpg'}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-icc-500 flex items-center justify-center shadow-lg">
                <Play className="w-4 h-4 text-white pl-0.5" />
              </div>
            </div>
          </div>
        </a>
        <div className="p-4">
          <span className={`inline-block mb-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${CAT_COLORS[resource.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
            {resource.category}
          </span>
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block text-sm font-bold text-white group-hover:text-icc-400 transition-colors line-clamp-2 leading-snug">
            {resource.title}
          </a>
        </div>
      </motion.div>
    );
  }

  if (isAudio) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="glass-card p-5 flex flex-col gap-4 group hover:border-icc-500/30 transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-icc-500/10 text-icc-400 border border-icc-500/20 flex items-center justify-center shrink-0">
            <Music className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className={`inline-block mb-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${CAT_COLORS[resource.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
              {resource.category}
            </span>
            <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-icc-400 transition-colors leading-snug">
              {resource.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 text-xs text-white/40">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{resource.views}</span>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-icc-400 hover:text-icc-300 font-semibold"
          >
            <Play className="w-3.5 h-3.5" /> Listen
          </a>
        </div>
      </motion.div>
    );
  }

  if (isPdf) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="glass-card p-5 flex flex-col gap-4 group hover:border-red-500/30 transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className={`inline-block mb-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${CAT_COLORS[resource.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
              {resource.category}
            </span>
            <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors leading-snug">
              {resource.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 text-xs text-white/40">
          <span>{resource.sizeHuman || '—'}</span>
          <a
            href={resource.url}
            download
            className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </a>
        </div>
      </motion.div>
    );
  }

  if (isImage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="glass-card overflow-hidden group hover:border-icc-500/30 transition-all"
      >
        <a href={resource.url} target="_blank" rel="noopener noreferrer">
          <div className="aspect-video bg-dark-950 relative overflow-hidden">
            <img
              src={resource.url}
              alt={resource.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </a>
        <div className="p-4">
          <span className={`inline-block mb-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${CAT_COLORS[resource.category] || 'bg-white/5 text-white/50 border-white/10'}`}>
            {resource.category}
          </span>
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block text-sm font-bold text-white group-hover:text-icc-400 transition-colors line-clamp-2 leading-snug">
            {resource.title}
          </a>
        </div>
      </motion.div>
    );
  }

  return null;
}
