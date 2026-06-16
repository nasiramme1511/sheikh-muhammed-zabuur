import { useState, useEffect } from 'react';
import { categories as categoriesApi, lessons as lessonsApi } from '../lib/api';
import { useTranslation } from '../i18n';
import { Category, Lesson } from '../types';
import CategoryCard from '../components/CategoryCard';
import LessonCard from '../components/LessonCard';

export default function Beginner() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoriesApi.getBeginner(),
      lessonsApi.getAll({ beginner: 'true', limit: '50' }),
    ])
      .then(([catRes, lesRes]) => {
        setCategories(catRes.data);
        setLessons(lesRes.data.lessons);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">{t('beginner.title')}</h1>
        <p className="text-gray-500 mt-2">{t('beginner.subtitle')}</p>
      </div>

      {categories.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{t('beginner.categories')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      )}

      {lessons.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">{t('beginner.lessons')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
