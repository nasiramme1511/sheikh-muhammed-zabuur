import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiPlay, HiClock, HiSearch, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { series as seriesApi } from '../lib/api';
import { Lesson } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedField } from '../lib/language';
import { useTranslation } from '../i18n';
import { usePlayer } from '../context/PlayerContext';
import { useSEO } from '../seo/metadata';

interface Series {
  id: number;
  name: string;
  nameAmharic?: string;
  nameArabic?: string;
  nameOromic?: string;
  slug: string;
  description?: string;
  descriptionAmharic?: string;
  descriptionArabic?: string;
  descriptionOromic?: string;
  image?: string;
  icon?: string;
  color?: string;
  totalHours?: number;
  _count?: { lessons: number };
  lessons: Lesson[];
}

const PAGE_SIZE = 20;

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SeriesDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { playSeries, currentLesson, currentPlaylist } = usePlayer();

  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    seriesApi
      .getBySlug(slug, { includeLessons: true })
      .then((res) => {
        setSeries({ ...res.data.series, lessons: res.data.lessons ?? [] });
        setPage(1);
        setSearchQuery('');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const localizedName = series ? getLocalizedField(series, 'name', language) : '';
  const localizedDesc = series ? getLocalizedField(series, 'description', language) : '';

  useSEO({
    title: localizedName || t('series.page_title'),
    description: localizedDesc || t('series.page_desc'),
    canonical: series ? `/series/${series.slug}` : undefined,
  });

  const lessons = useMemo(() => {
    if (!series?.lessons) return [];
    const sorted = [...series.lessons].sort(
      (a, b) => (a.episodeNumber ?? 999) - (b.episodeNumber ?? 999),
    );
    if (!searchQuery) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter((lesson) => {
      const title = getLocalizedField(lesson, 'title', language).toLowerCase();
      return title.includes(q);
    });
  }, [series, searchQuery, language]);

  const totalPages = Math.max(1, Math.ceil(lessons.length / PAGE_SIZE));
  const paginatedLessons = lessons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalLessons = series?._count?.lessons ?? series?.lessons?.length ?? 0;

  const handlePlayAll = () => {
    if (!series || !series.lessons?.length) return;
    const sorted = [...series.lessons].sort(
      (a, b) => (a.episodeNumber ?? 999) - (b.episodeNumber ?? 999),
    );
    playSeries(sorted, series.name, series.slug);
  };

  const handlePlayLesson = (lesson: Lesson, index: number) => {
    if (!series) return;
    const sorted = [...series.lessons].sort(
      (a, b) => (a.episodeNumber ?? 999) - (b.episodeNumber ?? 999),
    );
    playSeries(sorted, series.name, series.slug, index);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">{t('series.not_found')}</p>
        <Link to="/series" className="text-green-600 hover:underline mt-2 inline-block">
          {t('series.back_to_series')}
        </Link>
      </div>
    );
  }

  const color = series.color || '#0EA5E9';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      <Link
        to="/series"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 group"
      >
        <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        {t('series.back_to_series')}
      </Link>

      <div
        className="glass-premium rounded-2xl p-6 md:p-8 mb-8 border"
        style={{ borderColor: `${color}20` }}
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
              style={{ backgroundColor: `${color}15`, border: `2px solid ${color}25` }}
            >
              {series.icon || '\uD83D\uDCDA'}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{localizedName}</h1>
              {localizedDesc && (
                <p className="text-gray-400 mt-2 leading-relaxed max-w-2xl">{localizedDesc}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <HiPlay className="w-4 h-4" style={{ color }} />
            <span>
              {t('series.lessons_count', { count: totalLessons })}
            </span>
          </div>
          {series.totalHours && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <HiClock className="w-4 h-4" style={{ color }} />
              <span>{series.totalHours}h</span>
            </div>
          )}
          {totalLessons > 0 && (
            <button
              onClick={handlePlayAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ backgroundColor: color }}
            >
              <HiPlay className="w-4 h-4" />
              {t('series.play_all')}
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t('series.search_lessons')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-icc-500/40 transition-colors"
          />
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {paginatedLessons.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('series.no_lessons')}</p>
        ) : (
          paginatedLessons.map((lesson, i) => {
            const globalIndex = (page - 1) * PAGE_SIZE + i;
            const isCurrent =
              currentLesson?.id === lesson.id && currentPlaylist?.seriesSlug === series.slug;
            const localizedTitle = getLocalizedField(lesson, 'title', language);
            return (
              <div
                key={lesson.id}
                className={`glass-premium p-4 rounded-xl border transition-all ${
                  isCurrent ? 'border-icc-500/40' : 'border-white/5'
                }`}
                style={isCurrent ? { borderColor: `${color}50` } : {}}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      backgroundColor: isCurrent ? `${color}20` : `${color}10`,
                      color: isCurrent ? color : undefined,
                    }}
                  >
                    {String(lesson.episodeNumber ?? globalIndex + 1).padStart(3, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold line-clamp-1">{localizedTitle}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {lesson.duration && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <HiClock className="w-3 h-3" />
                          {formatDuration(lesson.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePlayLesson(lesson, globalIndex)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      isCurrent
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                    style={isCurrent ? { backgroundColor: color } : {}}
                    title={t('series.play_lesson')}
                  >
                    <HiPlay className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        {paginatedLessons.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('series.no_lessons')}</p>
        ) : (
          <div className="glass-premium rounded-2xl overflow-hidden border border-white/5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-500">
                  <th className="text-left py-3 px-4 font-medium w-16">#</th>
                  <th className="text-left py-3 px-4 font-medium">{t('series.lesson_title')}</th>
                  <th className="text-right py-3 px-4 font-medium w-24">{t('series.duration')}</th>
                  <th className="text-right py-3 px-4 font-medium w-20"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedLessons.map((lesson, i) => {
                  const globalIndex = (page - 1) * PAGE_SIZE + i;
                  const isCurrent =
                    currentLesson?.id === lesson.id && currentPlaylist?.seriesSlug === series.slug;
                  const localizedTitle = getLocalizedField(lesson, 'title', language);
                  return (
                    <tr
                      key={lesson.id}
                      className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                        isCurrent ? 'bg-white/[0.04]' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: isCurrent ? `${color}20` : 'rgba(255,255,255,0.05)',
                            color: isCurrent ? color : 'rgba(255,255,255,0.5)',
                          }}
                        >
                          {String(lesson.episodeNumber ?? globalIndex + 1).padStart(3, '0')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm ${isCurrent ? 'font-semibold' : ''}`}>
                          {localizedTitle}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm text-gray-500">
                          {formatDuration(lesson.duration)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handlePlayLesson(lesson, globalIndex)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ml-auto ${
                            isCurrent
                              ? 'text-white'
                              : 'text-gray-500 hover:text-white hover:bg-white/10'
                          }`}
                          style={isCurrent ? { backgroundColor: color } : {}}
                          title={t('series.play_lesson')}
                        >
                          <HiPlay className="w-4 h-4 ml-0.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <HiChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: p === page ? color : undefined,
                color: p === page ? '#fff' : 'rgba(255,255,255,0.5)',
                border: p === page ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <HiChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
