import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiCheckCircle, HiPlay, HiClock, HiUser } from 'react-icons/hi';
import { levels as levelsApi } from '../lib/api';
import { Level, Lesson } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedField } from '../lib/language';
import { useTranslation } from '../i18n';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function LevelPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { play } = usePlayer();
  const { user } = useAuth();

  const [level, setLevel] = useState<Level | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      levelsApi.getBySlug(slug),
      levelsApi.getLessons(slug),
    ])
      .then(([levelRes, lessonsRes]) => {
        setLevel(levelRes.data);
        setLessons(Array.isArray(lessonsRes.data) ? lessonsRes.data : lessonsRes.data?.lessons || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!level) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">{t('level_page.not_found')}</p>
        <Link to="/" className="text-green-600 hover:underline mt-2 inline-block">{t('level_page.back_home')}</Link>
      </div>
    );
  }

  const localizedName = getLocalizedField(level, 'name', language);
  const localizedDesc = getLocalizedField(level, 'description', language);
  const completedCount = lessons.filter(l => l.userProgress?.completed).length;
  const totalLessons = lessons.length;
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 group">
        <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        {t('level_page.back_home')}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ backgroundColor: level.color ? `${level.color}15` : '#f0fdf4' }}
            >
              {level.icon || '\uD83D\uDCDA'}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{localizedName}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{localizedDesc}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <HiPlay className="w-4 h-4 text-green-600" />
            <span>{totalLessons} {t('level_page.lessons_count')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <HiCheckCircle className="w-4 h-4 text-green-600" />
            <span>{completedCount} {t('level_page.completed_count')}</span>
          </div>
          {user && (
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span>{t('levels.progress')}</span>
                <span>{pct}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-green-600"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold mb-4">{t('level_page.lessons')}</h2>
        {lessons.length === 0 ? (
          <p className="text-gray-400 text-center py-8">{t('level_page.no_lessons')}</p>
        ) : (
          lessons.map((lesson, i) => {
            const localizedTitle = getLocalizedField(lesson, 'title', language);
            const isCompleted = lesson.userProgress?.completed;
            return (
              <Link
                key={lesson.id}
                to={`/lessons/${lesson.slug}`}
                className={`flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700 transition-all group ${isCompleted ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="w-10 h-10 shrink-0 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                  {isCompleted ? (
                    <HiCheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <span className="text-sm font-bold text-green-600">{i + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold group-hover:text-green-600 transition-colors line-clamp-1">
                    {localizedTitle}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    {lesson.teacher && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <HiUser className="w-3 h-3" />
                        <span className="truncate">{getLocalizedField(lesson.teacher, 'name', language)}</span>
                      </span>
                    )}
                    {lesson.duration && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <HiClock className="w-3 h-3" />
                        {formatDuration(lesson.duration)}
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-medium text-gray-400 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                      {lesson.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isCompleted && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        play(lesson);
                      }}
                      className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                    >
                      <HiPlay className="w-4 h-4 ml-0.5" />
                    </button>
                  )}
                  {isCompleted && (
                    <span className="text-xs text-green-600 font-medium">{t('level_page.done')}</span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
