import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { series as seriesApi } from '../lib/api';
import { useSEO } from '../seo/metadata';
import SeriesCard from '../components/sections/SeriesCard';

export default function SeriesPage() {
  const { t } = useTranslation();
  const [allSeries, setAllSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: t('series.page_title'),
    description: t('series.page_desc'),
    canonical: '/series',
  });

  useEffect(() => {
    seriesApi.getAll().then(res => {
      setAllSeries(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-icc-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-icc-400 uppercase tracking-wider">
            {t('home.subjects')}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">
            {t('series.page_title')}
          </h1>
          <p className="text-white/50 mt-2 max-w-xl mx-auto">
            {t('series.page_desc')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allSeries.map((s: any) => (
            <SeriesCard
              key={s.id}
              name={s.name}
              nameAmharic={s.nameAmharic}
              nameArabic={s.nameArabic}
              nameOromic={s.nameOromic}
              slug={s.slug}
              description={s.description}
              image={s.image}
              icon={s.icon}
              color={s.color}
              totalLessons={s.totalLessons}
              totalDuration={s.totalDuration}
              latestLesson={s.latestLesson}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
