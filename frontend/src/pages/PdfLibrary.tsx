import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, FileText, Download, Eye, X, Sparkles, Filter, BookOpen, Maximize2,
  Grid3X3, List, ChevronLeft, ChevronRight, Book, Clock,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { resources as resourcesApi } from '../lib/api';
import type { Resource } from '../types';
import { useSEO } from '../seo/metadata';
import { useAuthGuard } from '../hooks/useAuthGuard';
import LoginWallModal from '../components/LoginWallModal';
import DownloadButton from '../components/DownloadButton';
import { useResourceLibrary } from '../hooks/useResourceLibrary';
import LibraryHeader from '../components/library/LibraryHeader';
import CollectionBrowser from '../components/library/CollectionBrowser';
import FilterBar from '../components/library/FilterBar';
import CategoryNav from '../components/library/CategoryNav';
import EmptyState from '../components/library/EmptyState';
import LoadingSkeleton from '../components/library/LoadingSkeleton';

const ALL_PDFS = 'All PDFs';

const CATEGORIES = [
  ALL_PDFS,
  'Aqeedah', 'Hadith', 'Tafsir', 'Fiqh', 'Seerah', 'Tajweed',
  'Arabic', 'Usul', 'Manhaj', 'Adab', 'Khutbah', 'Ramadan',
  'Questions & Answers', 'General',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Aqeedah': 'from-icc-500/20 to-icc-600/10',
  'Hadith': 'from-amber-500/20 to-amber-600/10',
  'Tafsir': 'from-blue-500/20 to-blue-600/10',
  'Fiqh': 'from-purple-500/20 to-purple-600/10',
  'Seerah': 'from-rose-500/20 to-rose-600/10',
  'Tajweed': 'from-cyan-500/20 to-cyan-600/10',
};

const getCategoryColor = (cat: string) => CATEGORY_COLORS[cat] || 'from-icc-500/20 to-icc-600/10';

export default function PdfLibrary() {
  const { t } = useTranslation();
  const {
    loading, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    sortBy, setSortBy, collectionStats, selectedCollection, setSelectedCollection,
    viewMode, setViewMode, handleClearCollection, filteredItems, setItems,
  } = useResourceLibrary({ type: 'PDF', allLabel: ALL_PDFS });

  useSEO({
    title: t('pdf_library.title'), description: t('pdf_library.subtitle'), canonical: '/pdfs',
    keywords: 'Islamic PDF books, download Islamic books, Aqeedah PDF, Tafsir PDF, Hadith books, Fiqh PDF, Islamic library, Sheikh Mohammed Zabuur PDF, free Islamic ebooks',
  });

  const [previewPdf, setPreviewPdf] = useState<Resource | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const { guardAction, showWall, closeWall } = useAuthGuard();

  const handlePreview = (pdf: Resource) => {
    guardAction(() => { setPreviewPdf(pdf); resourcesApi.view(pdf.id); });
  };

  const handleDownload = async (id: number, url: string) => {
    try {
      await resourcesApi.download(id);
      setItems(prev => prev.map(p => p.id === id ? { ...p, downloads: (p.downloads || 0) + 1 } : p));
      window.open(url, '_blank');
    } catch (err) { console.error(err); }
  };

  const handleDownloadGuarded = (id: number, url: string) => guardAction(() => handleDownload(id, url));

  const active = !!searchQuery || selectedCategory !== ALL_PDFS;
  const emptyTitle = active ? t('pdf_library.no_books_found') : t('pdf_library.empty_coming_soon');
  const emptyDesc = active ? t('pdf_library.empty_search_desc') : t('pdf_library.empty_coming_soon_desc');

  return (
    <div className="min-h-screen bg-surface-900 pt-24 pb-16 text-white px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <LibraryHeader badge={t('pdf_library.badge')} heading={t('pdf_library.browse_title')} description={t('pdf_library.subtitle')} />

        <CollectionBrowser
          collectionStats={collectionStats}
          selectedCollection={selectedCollection}
          onSelect={setSelectedCollection}
          onClear={handleClearCollection}
          browseLabel={t('pdf_library.browse_collections')}
          showingLabel={t('pdf_library.showing_only')}
          clearLabel={t('pdf_library.clear_collection')}
        />

        <FilterBar
          searchQuery={searchQuery} onSearchChange={setSearchQuery}
          searchPlaceholder={t('pdf_library.search_placeholder')}
          sortBy={sortBy} onSortChange={setSortBy}
          sortLatest={t('pdf_library.sort_latest')} sortDownloads={t('pdf_library.sort_top_downloads')} sortViews={t('pdf_library.sort_most_viewed')}
          viewMode={viewMode} onViewModeChange={setViewMode}
          gridTitle={t('pdf_library.grid_view')} listTitle={t('pdf_library.list_view')}
        />

        <CategoryNav categories={CATEGORIES} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />

        {loading ? (
          <LoadingSkeleton viewMode={viewMode} type="pdf" />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12 text-icc-400/60" />}
            animation="spin3d"
            title={emptyTitle}
            description={emptyDesc}
            showClear={active}
            clearLabel={t('pdf_library.clear_filters')}
            onClear={() => { setSearchQuery(''); setSelectedCategory(ALL_PDFS); }}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((pdf, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }} key={pdf.id}
                className="glass-premium p-6 flex flex-col justify-between h-full group relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getCategoryColor(pdf.category)} opacity-80`} />

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-icc-500/10 to-icc-600/10 text-icc-400 border border-icc-500/20">
                      <Book className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-white/60">{pdf.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-icc-400 transition-colors">{pdf.title}</h3>
                  <p className="text-sm text-white/50 mb-4 line-clamp-2">{pdf.description || t('pdf_library.no_description')}</p>
                </div>

                <div>
                  <div className="text-xs text-white/40 space-y-1 mb-5">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t('pdf_library.uploaded')}</span>
                      <span className="text-white/60">{new Date(pdf.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Download className="w-3 h-3" />{t('pdf_library.downloads_label')}</span>
                      <span className="text-white/60">{pdf.downloads}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handlePreview(pdf)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/90 flex items-center justify-center gap-1.5 transition-all">
                      <Eye className="w-4 h-4" />{t('pdf_library.preview')}
                    </button>
                    <DownloadButton resourceId={pdf.id} type="PDF" title={pdf.title} url={pdf.url} fileSize={pdf.size} sizeHuman={pdf.sizeHuman} description={pdf.description} category={pdf.category} />
                    <button onClick={() => handleDownloadGuarded(pdf.id, pdf.url)}
                      className="flex-1 btn-icc py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-none">
                      <Download className="w-4 h-4" />{t('pdf_library.download')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((pdf, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }} key={pdf.id}
                className="glass-premium p-4 flex items-center gap-4 group"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-icc-500/10 to-icc-600/10 text-icc-400 border border-icc-500/20 shrink-0">
                  <Book className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-icc-400 transition-colors">{pdf.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/5 border border-white/10 text-white/50 shrink-0">{pdf.category}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span>{new Date(pdf.createdAt).toLocaleDateString()}</span>
                    <span>{pdf.downloads} {t('pdf_library.downloads_suffix')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handlePreview(pdf)}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 flex items-center gap-1.5 transition-all">
                    <Eye className="w-3.5 h-3.5" />{t('pdf_library.preview')}
                  </button>
                  <button onClick={() => handleDownloadGuarded(pdf.id, pdf.url)}
                    className="px-3 py-2 rounded-lg btn-icc text-xs font-semibold flex items-center gap-1.5 transition-all shadow-none">
                    <Download className="w-3.5 h-3.5" />{t('pdf_library.download')}
                  </button>
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={() => setPreviewPdf(null)}
          >
            <div className="absolute inset-0 bg-dark-950/95 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative flex flex-col bg-surface-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden ${fullscreen ? 'w-full h-full' : 'w-full max-w-5xl h-[85vh]'}`}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-surface-800 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4.5 h-4.5 text-icc-400 shrink-0" />
                  <span className="text-sm font-semibold text-white truncate max-w-md">{previewPdf.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDownloadGuarded(previewPdf.id, previewPdf.url)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-icc-500/20 border border-white/5 flex items-center justify-center transition-all"
                    title={t('pdf_library.download_book')}>
                    <Download className="w-4 h-4 text-white/70" />
                  </button>
                  <button onClick={() => setFullscreen(!fullscreen)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-all"
                    title={t('pdf_library.fullscreen')}>
                    <Maximize2 className="w-4 h-4 text-white/70" />
                  </button>
                  <button onClick={() => setPreviewPdf(null)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/5 flex items-center justify-center transition-all">
                    <X className="w-4 h-4 text-white/60 hover:text-red-400" />
                  </button>
                </div>
              </div>
              <div className="flex-grow bg-dark-950 relative">
                <iframe src={`${previewPdf.url}#toolbar=1&navpanes=1`} className="w-full h-full border-none" title={previewPdf.title} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginWallModal isOpen={showWall} onClose={closeWall} />
    </div>
  );
}