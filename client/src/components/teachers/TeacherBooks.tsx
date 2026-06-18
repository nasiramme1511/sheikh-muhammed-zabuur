import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaFilePdf } from 'react-icons/fa';
import { Search, Download, BookOpen, Globe } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedTitle, getLocalizedDescription, getLocalizedPdfUrl, getAvailableLanguages, getDownloadUrl } from '../../lib/bookLocalization';
import type { Book } from '../../types';
import type { BookLang } from '../../lib/bookLocalization';

interface Props {
  books: Book[];
}

export default function TeacherBooks({ books }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const lang = language as BookLang;

  const filtered = useMemo(() => {
    if (!search) return books;
    return books.filter((b) => {
      const title = getLocalizedTitle(b, lang);
      return title.toLowerCase().includes(search.toLowerCase());
    });
  }, [books, search, lang]);

  if (books.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FaFilePdf className="w-5 h-5 text-red-400" />
        {t('teacher_detail_page.resources')}
      </h2>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('teacher_detail_page.search_lessons')}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800/50 border border-white/5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/30 transition-colors"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((book, i) => {
          const title = getLocalizedTitle(book, lang);
          const description = getLocalizedDescription(book, lang);
          const pdfUrl = getLocalizedPdfUrl(book, lang);
          const availableLangs = getAvailableLanguages(book);
          return (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl bg-dark-800/50 border border-white/5 p-5 hover:border-red-500/20 hover:bg-dark-800/70 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <FaFilePdf className="w-5 h-5 text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-white line-clamp-1">{title}</h3>
                  {description && (
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{description}</p>
                  )}
                  {availableLangs.length > 1 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Globe className="w-3 h-3 text-white/30" />
                      {availableLangs.map((l) => (
                        <span key={l} className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${l === lang ? 'bg-icc-500/20 text-icc-400' : 'bg-white/5 text-white/30'}`}>
                          {l.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}
                  {pdfUrl && (
                    <div className="flex gap-2 mt-3">
                      <a
                        href={getDownloadUrl(pdfUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all"
                      >
                        <Download className="w-3 h-3" />
                        {t('teacher_detail_page.download_pdf')}
                      </a>
                      <a
                        href={pdfUrl.startsWith('http') ? pdfUrl : `/api/books/download/${encodeURIComponent(pdfUrl.split('/').pop() || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/40 text-xs font-medium hover:bg-white/10 transition-all"
                      >
                        <BookOpen className="w-3 h-3" />
                        {t('teacher_detail_page.read_online')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
