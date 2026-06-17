import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, FileText, Download, Eye, X, Sparkles, Maximize2, Filter, BookOpen,
  Grid3X3, List, ChevronLeft, ChevronRight, Book, Star, Clock
} from 'lucide-react';
import { resources as resourcesApi, collections as collectionsApi } from '../lib/api';
import { COLLECTIONS, getCollectionBySlug, COLLECTION_COLORS } from '../config/collections';
import type { Resource } from '../types';
import { useSEO } from '../seo/metadata';

const CATEGORIES = [
  'All PDFs',
  'Aqeedah', 'Hadith', 'Tafsir', 'Fiqh', 'Seerah', 'Tajweed',
  'Arabic', 'Usul', 'Manhaj', 'Adab', 'Khutbah', 'Ramadan',
  'Questions & Answers', 'General',
];

export default function PdfLibrary() {
  useSEO({
    title: 'PDF Library',
    description: 'Browse and download authentic Islamic books and PDFs on Aqeedah, Tafsir, Hadith, Fiqh, Seerah and more by Sheikh Mohammed Zabuur. Free Islamic PDF library.',
    canonical: '/pdfs',
    keywords: 'Islamic PDF books, download Islamic books, Aqeedah PDF, Tafsir PDF, Hadith books, Fiqh PDF, Islamic library, Sheikh Mohammed Zabuur PDF, free Islamic ebooks',
  });

  const [pdfs, setPdfs] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All PDFs');
  const [sortBy, setSortBy] = useState<'latest' | 'downloads' | 'views'>('latest');
  const [previewPdf, setPreviewPdf] = useState<Resource | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [collectionStats, setCollectionStats] = useState<Record<string, number>>({});
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPdfs();
    fetchCollectionStats();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionPdfs(selectedCollection);
    }
  }, [selectedCollection]);

  const fetchPdfs = async () => {
    setLoading(true);
    try {
      const res = await resourcesApi.getAll({ type: 'PDF' });
      setPdfs(res.data);
    } catch (err) {
      console.error('Error fetching PDFs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionPdfs = async (slug: string) => {
    setLoading(true);
    try {
      const res = await collectionsApi.getBySlug(slug, { type: 'PDF' });
      const data = Array.isArray(res.data) ? res.data : [];
      setPdfs(data);
    } catch (err) {
      console.error('Error fetching collection PDFs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionStats = async () => {
    try {
      const res = await collectionsApi.getStats();
      setCollectionStats(res.data || {});
    } catch (err) {
      console.error('Error fetching collection stats:', err);
    }
  };

  const handleClearCollection = () => {
    setSelectedCollection(null);
    fetchPdfs();
  };

  const handlePreview = (pdf: Resource) => {
    setPreviewPdf(pdf);
    resourcesApi.view(pdf.id);
  };

  const handleDownload = async (id: number) => {
    try {
      await resourcesApi.download(id);
      setPdfs(prev => prev.map(p => p.id === id ? { ...p, downloads: p.downloads + 1 } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPdfs = pdfs
    .filter((pdf) => {
      const matchesSearch =
        pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pdf.description && pdf.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All PDFs' ||
        pdf.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const scrollCategories = (dir: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      'Aqeedah': 'from-emerald-500/20 to-emerald-600/10',
      'Hadith': 'from-amber-500/20 to-amber-600/10',
      'Tafsir': 'from-blue-500/20 to-blue-600/10',
      'Fiqh': 'from-purple-500/20 to-purple-600/10',
      'Seerah': 'from-rose-500/20 to-rose-600/10',
      'Tajweed': 'from-cyan-500/20 to-cyan-600/10',
    };
    return colors[cat] || 'from-emerald-500/20 to-emerald-600/10';
  };

  return (
    <div className="min-h-screen bg-surface-900 pt-24 pb-16 text-white px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" />
            PDF Library
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-3 tracking-tight"
          >
            Browse Books & PDFs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-2xl mx-auto text-base"
          >
            Download and preview books, articles, summaries, and classroom notes authored or recommended by Sheikh Mohammed Zabuur.
          </motion.p>
        </div>

        {/* Browse By Collection */}
        {Object.keys(collectionStats).length > 0 && (
          <div className="mb-5">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Browse By Collection
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              {COLLECTIONS.filter(c => (collectionStats[c.slug] || 0) > 0).map(c => (
                <button
                  key={c.slug}
                  onClick={() => setSelectedCollection(c.slug)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm shrink-0 transition-all border ${
                    selectedCollection === c.slug
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : `${COLLECTION_COLORS[c.slug] || 'bg-white/5 text-white/60 border-white/10'} hover:brightness-125`
                  }`}
                >
                  <span>{c.icon}</span>
                  <span className="font-medium whitespace-nowrap">{c.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedCollection === c.slug ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {collectionStats[c.slug]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedCollection && (
          <div className="mb-4 flex items-center gap-2 text-sm bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-white/60">Showing only:</span>
            <span className="font-semibold text-emerald-400">
              {getCollectionBySlug(selectedCollection)?.icon} {getCollectionBySlug(selectedCollection)?.name || selectedCollection}
            </span>
            <button
              onClick={handleClearCollection}
              className="ml-auto px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all"
            >
              Clear Collection Filter
            </button>
          </div>
        )}

        {/* Sticky Filter Bar */}
        <div className="sticky top-20 z-30 flex flex-col md:flex-row gap-4 justify-between items-center mb-6 bg-surface-900/90 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-lg shadow-black/20">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/40" />
            <input
              type="text"
              placeholder="Search PDF books and notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex gap-1 bg-white/5 border border-white/5 rounded-xl p-0.5">
              {(['latest', 'downloads', 'views'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sortBy === s ? 'bg-emerald-500 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {s === 'latest' ? 'Latest' : s === 'downloads' ? 'Top Downloads' : 'Most Viewed'}
                </button>
              ))}
            </div>

            <div className="flex gap-1 bg-white/5 border border-white/5 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-white/60 hover:text-white'}`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-white/60 hover:text-white'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="relative mb-6">
          <button
            onClick={() => scrollCategories('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface-900/90 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-all backdrop-blur-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div
            ref={categoryScrollRef}
            className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-10"
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium shrink-0 transition-all whitespace-nowrap ${
                    active
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => scrollCategories('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface-900/90 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-all backdrop-blur-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="animate-pulse bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
                <div className="flex gap-3 mt-4">
                  <div className="h-9 bg-white/5 rounded flex-1" />
                  <div className="h-9 bg-white/5 rounded flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPdfs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/10 flex items-center justify-center"
              >
                <motion.div animate={{ rotateY: [0, 180, 360] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} style={{ transformStyle: 'preserve-3d' }}>
                  <FileText className="w-12 h-12 text-emerald-400/60" />
                </motion.div>
              </motion.div>
              <h3 className="text-2xl font-bold text-white/80 mb-3">
                {searchQuery || selectedCategory !== 'All PDFs' ? 'No Books Found' : 'PDF Library Coming Soon'}
              </h3>
              <p className="text-sm text-white/40 max-w-md mx-auto mb-8 leading-relaxed">
                {searchQuery || selectedCategory !== 'All PDFs'
                  ? 'No books match your current search. Try different keywords or browse another category to find Islamic PDFs and books.'
                  : 'Islamic books and PDFs by Sheikh Mohammed Zabuur are being added. Check back soon for new releases covering various Islamic sciences.'}
              </p>
              {(searchQuery || selectedCategory !== 'All PDFs') && (
                <motion.div>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All PDFs'); }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium flex items-center gap-2 mx-auto"
                  >
                    <Filter className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : viewMode === 'grid' ? (
          /* Grid View - Book Style */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPdfs.map((pdf, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={pdf.id}
                className="glass-premium p-6 flex flex-col justify-between h-full group relative overflow-hidden"
              >
                {/* Decorative top bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getCategoryColor(pdf.category)} opacity-80`} />

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 text-emerald-400 border border-emerald-500/20">
                      <Book className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-white/60">
                      {pdf.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                    {pdf.title}
                  </h3>
                  <p className="text-sm text-white/50 mb-4 line-clamp-2">
                    {pdf.description || 'No summary or notes description is attached to this book.'}
                  </p>
                </div>

                <div>
                  <div className="text-xs text-white/40 space-y-1 mb-5">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Uploaded:
                      </span>
                      <span className="text-white/60">
                        {new Date(pdf.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        Downloads:
                      </span>
                      <span className="text-white/60">{pdf.downloads}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(pdf)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/90 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Eye className="w-4 h-4" /> Preview
                    </button>
                    <a
                      href={pdf.url}
                      download
                      onClick={() => handleDownload(pdf.id)}
                      className="flex-1 btn-icc py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-none"
                    >
                      <Download className="w-4 h-4" /> Download
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredPdfs.map((pdf, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                key={pdf.id}
                className="glass-premium p-4 flex items-center gap-4 group"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Book className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                      {pdf.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/5 border border-white/10 text-white/50 shrink-0">
                      {pdf.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span>{new Date(pdf.createdAt).toLocaleDateString()}</span>
                    <span>{pdf.downloads} downloads</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handlePreview(pdf)}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 flex items-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <a
                    href={pdf.url}
                    download
                    onClick={() => handleDownload(pdf.id)}
                    className="px-3 py-2 rounded-lg btn-icc text-xs font-semibold flex items-center gap-1.5 transition-all shadow-none"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {previewPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={() => setPreviewPdf(null)}
          >
            <div className="absolute inset-0 bg-dark-950/95 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative flex flex-col bg-surface-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden ${
                fullscreen ? 'w-full h-full' : 'w-full max-w-5xl h-[85vh]'
              }`}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-surface-800 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                  <span className="text-sm font-semibold text-white truncate max-w-md">{previewPdf.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewPdf.url}
                    download
                    onClick={() => handleDownload(previewPdf.id)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/5 flex items-center justify-center transition-all"
                    title="Download Book"
                  >
                    <Download className="w-4 h-4 text-white/70" />
                  </a>
                  <button
                    onClick={() => setFullscreen(!fullscreen)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-all"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4 text-white/70" />
                  </button>
                  <button
                    onClick={() => setPreviewPdf(null)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/5 flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4 text-white/60 hover:text-red-400" />
                  </button>
                </div>
              </div>
              <div className="flex-grow bg-dark-950 relative">
                <iframe
                  src={`${previewPdf.url}#toolbar=1&navpanes=1`}
                  className="w-full h-full border-none"
                  title={previewPdf.title}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
