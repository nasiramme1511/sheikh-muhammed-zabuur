import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, Layers, Globe, Users, ChevronRight, BookOpen as CourseIcon } from 'lucide-react';
import { courses as coursesApi, categories as categoriesApi, levels as levelsApi } from '../../lib/api';
import { Course, Category, Level } from '../../types';
import { useTranslation } from '../../i18n';

export default function Courses() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [cRes, catRes, lvlRes] = await Promise.all([
          coursesApi.getAll(),
          categoriesApi.getAll(),
          levelsApi.getAll(),
        ]);
        setCourses(cRes.data as Course[]);
        setCategories(catRes.data.categories || catRes.data);
        setLevels(lvlRes.data.levels || lvlRes.data);
      } catch (err) {
        console.error('Failed to load courses data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCat = selectedCategory === 'All' || c.categoryId === Number(selectedCategory);
    const matchesLvl = selectedLevel === 'All' || c.levelId === Number(selectedLevel);
    const matchesLang = selectedLanguage === 'All' || c.language === selectedLanguage;

    return matchesSearch && matchesCat && matchesLvl && matchesLang;
  });

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-800 to-dark-900 border border-white/5 py-12 px-6 md:p-16 mb-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-icc-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-icc-500/15 border border-icc-500/30 text-icc-400 text-xs font-semibold mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            {t('courses.isl_curriculum')}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {t('courses.structured_courses')}
          </h1>
          <p className="text-white/60 text-base md:text-lg mb-8 leading-relaxed">
            {t('courses.hero_desc')}
          </p>

          {/* Search Inputs */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('courses.search_placeholder')}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all text-sm shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Filters grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">{t('courses.category')}</label>
          <div className="relative">
            <CourseIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="All" className="bg-dark-800 text-white">{t('courses.all_categories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-dark-800 text-white">{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">{t('courses.level')}</label>
          <div className="relative">
            <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="All" className="bg-dark-800 text-white">{t('courses.all_levels')}</option>
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id} className="bg-dark-800 text-white">{lvl.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">{t('courses.language')}</label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="All" className="bg-dark-800 text-white">{t('courses.all_languages')}</option>
              <option value="en" className="bg-dark-800 text-white">{t('admin.language_en')}</option>
              <option value="ar" className="bg-dark-800 text-white">{t('admin.language_ar')}</option>
              <option value="am" className="bg-dark-800 text-white">{t('admin.language_am')}</option>
              <option value="om" className="bg-dark-800 text-white">{t('admin.language_om')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses count */}
      <div className="text-sm text-white/40 mb-6 font-medium">
        {t('courses.showing_of', { count: filteredCourses.length, total: courses.length })}
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white/5 border border-white/10 h-72" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white/5 border border-white/5">
          <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">{t('courses.no_courses_found')}</h3>
          <p className="text-white/40 text-sm">{t('courses.try_modifying')}</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
        >
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              className="group flex flex-col rounded-2xl bg-dark-800/50 border border-white/5 hover:border-icc-500/30 hover:bg-dark-800/80 transition-all duration-300 overflow-hidden shadow-lg"
            >
              {/* Thumbnail */}
              <div className="relative h-44 overflow-hidden bg-dark-900 shrink-0">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-icc-500/10 to-icc-950/20">
                    <CourseIcon className="w-12 h-12 text-icc-500/40" />
                  </div>
                )}
                {/* Accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-icc-500 to-icc-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>

              {/* Info */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold tracking-wider uppercase">
                    <span className="px-2 py-0.5 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400">
                      {course.category?.name || 'General'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      {course.level?.name || 'All Levels'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      {course.language.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-icc-400 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-white/50 text-xs line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-icc-500/20 flex items-center justify-center text-icc-400 text-xs font-bold border border-icc-500/30 overflow-hidden">
                      {course.teacher?.image ? (
                        <img src={course.teacher.image} alt={course.teacher.name} className="w-full h-full object-cover" />
                      ) : (
                        course.teacher?.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs text-white/60 font-semibold">{course.teacher?.name || 'Instructor'}</span>
                  </div>

                  <Link
                    to={`/courses/${course.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-icc-400 hover:text-white transition-colors"
                  >
                    {t('courses.view_course')}
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
