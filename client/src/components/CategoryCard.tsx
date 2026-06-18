import { Link } from 'react-router-dom';
import { Category } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedField } from '../lib/language';
import { useTranslation } from '../i18n';

interface Props {
  category: Category;
}

export default function CategoryCard({ category }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const localizedName = getLocalizedField(category, 'name', language);
  const showEnglishFallback = language !== 'en' && category.name && localizedName !== category.name;
  return (
    <Link
      to={`/categories/${category.slug}`}
      className="card p-5 flex items-center gap-4 group cursor-pointer"
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ backgroundColor: category.color + '20' }}
      >
        {category.icon || '📚'}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-base group-hover:text-primary-600 transition-colors truncate">
          {localizedName}
        </h3>
        {showEnglishFallback && (
          <p className="text-sm text-white/50 truncate">{category.name}</p>
        )}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-400">{category._count?.lessons || 0} {t('admin.lessons_suffix')}</span>
          <span className="text-xs text-gray-400">{category._count?.books || 0} {t('admin.books_suffix')}</span>
        </div>
      </div>
    </Link>
  );
}
