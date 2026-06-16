import { useState, useEffect } from 'react';
import { categories as categoriesApi } from '../lib/api';
import { Category } from '../types';
import CategoryCard from '../components/CategoryCard';
import { useTranslation } from '../i18n';
import { useSEO } from '../seo/metadata';

export default function Categories() {
  useSEO({
    title: 'Categories',
    description: 'Browse Islamic learning resources by category - Aqeedah, Tafsir, Hadith, Fiqh, Seerah, Tajweed, Arabic and more.',
  });

  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.getAll()
      .then((res) => setCategories(res.data))
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
      <h1 className="section-title">{t('home.categories_title')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
}

