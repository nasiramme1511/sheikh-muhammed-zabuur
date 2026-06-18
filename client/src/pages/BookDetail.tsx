import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiUser, HiBookOpen, HiDownload, HiEye } from 'react-icons/hi';
import { books as booksApi } from '../lib/api';
import { Book } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedField } from '../lib/language';
import { getLocalizedTitle, getLocalizedDescription, getLocalizedPdfUrl, getLocalizedCoverImage, getAvailableLanguages, getDownloadUrl } from '../lib/bookLocalization';
import type { BookLang } from '../lib/bookLocalization';
import { useTranslation } from '../i18n';
import LessonCard from '../components/LessonCard';
import ShareButtons from '../components/ShareButtons';

export default function BookDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    booksApi.getBySlug(slug)
      .then((res) => setBook(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-icc-500 border-t-transparent" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">{t('book_detail.not_found')}</p>
        <Link to="/categories" className="text-icc-500 hover:underline mt-4 inline-block">{t('book_detail.browse')}</Link>
      </div>
    );
  }

  const lang = language as BookLang;
  const title = getLocalizedTitle(book, lang);
  const description = getLocalizedDescription(book, lang);
  const pdfUrl = getLocalizedPdfUrl(book, lang);
  const coverImage = getLocalizedCoverImage(book, lang);
  const availableLangs = getAvailableLanguages(book);
  const showEnglishFallback = language !== 'en' && book.title && title !== book.title;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/categories" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-icc-500 mb-6">
        <HiArrowLeft className="w-4 h-4" /> {t('book_detail.back')}
      </Link>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {coverImage && (
          <div className="shrink-0">
            <img src={coverImage} alt={title} className="w-40 h-56 object-cover rounded-2xl shadow-lg" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4">
            <div className={`${coverImage ? 'hidden md:flex' : 'flex'} w-16 h-16 rounded-xl bg-icc-100 dark:bg-icc-900/50 items-center justify-center text-3xl shrink-0`}>
              {'\uD83D\uDCD6'}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
              {showEnglishFallback && <p className="text-gray-400 mt-1">{book.title}</p>}

              {availableLangs.length > 1 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-xs text-white/40 mr-1">{t('admin.available_in')}:</span>
                  {availableLangs.map((l) => (
                    <span key={l} className={`px-2 py-0.5 rounded text-[10px] font-medium ${l === lang ? 'bg-icc-500/20 text-icc-400 border border-icc-500/30' : 'bg-white/5 text-white/40'}`}>
                      {t(`admin.language_${l}`)}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                {book.teacher && (
                  <Link to={`/teachers/${book.teacher.slug}`} className="flex items-center gap-1 hover:text-icc-500">
                    <HiUser className="w-4 h-4" /> {book.teacher.name}
                  </Link>
                )}
                {book.category && (
                  <Link to={`/categories/${book.category.slug}`} className="flex items-center gap-1 hover:text-icc-500">
                    <HiBookOpen className="w-4 h-4" /> {book.category.name}
                  </Link>
                )}
              </div>

              {description && (
                <p className="text-sm text-gray-400 mt-4 max-w-3xl leading-relaxed">{description}</p>
              )}

              {pdfUrl && (
                <div className="flex items-center gap-3 mt-6">
                  <a
                    href={getDownloadUrl(pdfUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-icc-500 to-icc-600 text-white text-sm font-semibold hover:from-icc-400 hover:to-icc-500 transition-all hover:scale-105 shadow-lg shadow-icc-500/20"
                  >
                    <HiDownload className="w-4 h-4" /> {t('book_detail.download')}
                  </a>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-semibold hover:bg-white/10 hover:text-white transition-all"
                  >
                    <HiEye className="w-4 h-4" /> {t('book_detail.preview')}
                  </a>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">{t('lesson_detail.share')}</h3>
                <ShareButtons url={window.location.href} title={title} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {book.lessons && book.lessons.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">{t('book_detail.lessons_in_book')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {book.lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
