import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { categories as categoriesApi } from '../lib/api';
import { Category } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedField } from '../lib/language';
import { useTranslation } from '../i18n';
import LessonCard from '../components/LessonCard';

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    categoriesApi.getBySlug(slug)
      .then((res) => setCategory(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">{t('category_detail.not_found')}</p>
        <Link to="/categories" className="text-primary-600 hover:underline mt-4 inline-block">{t('category_detail.back')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/categories" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <HiArrowLeft className="w-4 h-4" /> {t('category_detail.back')}
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl" style={{ backgroundColor: category.color + '20' }}>
          {category.icon || '\uD83D\uDCDA'}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{getLocalizedField(category, 'name', language)}</h1>
          <p className="text-gray-500">{category.name}</p>
          {category.description && <p className="text-sm text-gray-500 mt-1">{category.description}</p>}
        </div>
      </div>

      {category.books && category.books.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{t('category_detail.books')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {category.books.map((book) => (
              <Link key={book.id} to={`/books/${book.slug}`} className="card p-3 flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center shrink-0">
                  <span className="text-lg">{'\uD83D\uDCD6'}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary-600 transition-colors truncate">{getLocalizedField(book, 'title', language)}</p>
                  <p className="text-xs text-gray-400">{book._count?.lessons || 0} {t('nav.lessons')}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {category.lessons && category.lessons.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">{t('category_detail.lessons')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {category.lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
