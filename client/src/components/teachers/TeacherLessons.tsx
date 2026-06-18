import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiPlay } from 'react-icons/hi';
import { Search, Clock, BarChart3 } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedField } from '../../lib/language';
import LessonCard from '../LessonCard';
import type { Lesson } from '../../types';

interface Props {
  lessons: Lesson[];
}

export default function TeacherLessons({ lessons }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const cats: { slug: string; name: string }[] = [];
    for (const l of lessons) {
      if (l.category?.slug && !seen.has(l.category.slug)) {
        seen.add(l.category.slug);
        cats.push({ slug: l.category.slug, name: getLocalizedField(l.category, 'name', language) || l.category.name });
      }
    }
    return cats;
  }, [lessons, language]);

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      const title = getLocalizedField(l, 'title', language) || l.title;
      const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || l.category?.name?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || l.category?.slug === activeCategory;
      return matchesSearch && matchesCategory && l.duration && l.duration > 0;
    });
  }, [lessons, search, activeCategory, language]);

  if (lessons.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      id="lessons"
    >
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <HiPlay className="w-5 h-5 text-icc-400" />
        {t('teacher_detail_page.lessons_follow')}
      </h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('teacher_detail_page.search_lessons')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800/50 border border-white/5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/30 transition-colors"
          />
        </div>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setActiveCategory('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === 'all' ? 'bg-icc-500/20 text-icc-400 border border-icc-500/30' : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10'}`}>
            {t('teacher_detail_page.all_categories')}
          </button>
          {categories.map((cat) => (
            <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === cat.slug ? 'bg-icc-500/20 text-icc-400 border border-icc-500/30' : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10'}`}>
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-white/30 text-center py-12">{t('search.no_results')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
