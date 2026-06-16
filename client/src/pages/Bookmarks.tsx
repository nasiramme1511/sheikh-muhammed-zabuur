import { useState, useEffect } from 'react';
import { bookmarks as bookmarksApi } from '../lib/api';
import { Bookmark } from '../types';
import LessonCard from '../components/LessonCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';

export default function Bookmarks() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    bookmarksApi.getAll()
      .then((res) => setBookmarks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">{t('bookmarks.signin_required')}</p>
        <Link to="/login" className="btn-primary inline-block mt-4">{t('nav.sign_in')}</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="section-title">📌 {t('bookmarks.title')}</h1>
      {bookmarks.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>{t('bookmarks.no_bookmarks')}</p>
          <Link to="/categories" className="text-primary-600 hover:underline mt-4 inline-block">{t('bookmarks.browse_categories')}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {bookmarks.map((b) => (
            <LessonCard key={b.id} lesson={b.lesson} />
          ))}
        </div>
      )}
    </div>
  );
}

