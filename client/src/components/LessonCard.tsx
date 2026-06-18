import { Link } from 'react-router-dom';
import { HiPlay, HiClock, HiUser, HiBookmark, HiOutlineBookmark } from 'react-icons/hi';
import { Lesson } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedField } from '../lib/language';
import { usePlayer } from '../context/PlayerContext';
import { useState } from 'react';

interface Props {
  lesson: Lesson;
  highlightQuery?: string;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const CATEGORY_COLORS: Record<string, string> = {
  aqeedah: '#1E40AF', tawheed: '#0284C7', tafsir: '#7C3AED',
  hadith: '#B45309', fiqh: '#DC2626', seerah: '#0891B2',
  tajweed: '#4F46E5', nahw: '#0D9488', sarf: '#9333EA',
  adab: '#DB2777', tarbiyah: '#65A30D', manhaj: '#CA8A04',
};

export default function LessonCard({ lesson, highlightQuery }: Props) {
  const { language } = useLanguage();
  const { play } = usePlayer();
  const localizedTitle = getLocalizedField(lesson, 'title', language);
  const catColor = lesson.category ? CATEGORY_COLORS[lesson.category.slug] || '#0284C7' : '#0284C7';

  return (
    <div className="glass-card rounded-2xl border border-white/10 overflow-hidden group hover:border-gold-500/40 transition-all duration-300">
      <Link to={`/lessons/${lesson.slug}`} className="block">
        <div className="relative h-36 bg-gradient-to-br from-icc-500/10 to-icc-600/5 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <HiPlay className="w-7 h-7 text-icc-400 ml-0.5" />
          </div>
          {lesson.difficulty && (
            <span className="absolute top-3 left-3 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-white/60">
              {lesson.difficulty}
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              play(lesson);
            }}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30"
          >
            <div className="w-12 h-12 rounded-full bg-icc-500 text-white flex items-center justify-center shadow-lg shadow-icc-500/20 transform scale-90 group-hover:scale-100 transition-transform">
              <HiPlay className="w-6 h-6 ml-0.5" />
            </div>
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-icc-400 transition-colors leading-snug">
            {localizedTitle}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {lesson.duration && (
                <span className="flex items-center gap-1 text-xs text-white/40">
                  <HiClock className="w-3 h-3" />
                  {formatDuration(lesson.duration)}
                </span>
              )}
              {lesson.category && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${catColor}15`, color: catColor }}
                >
                  {getLocalizedField(lesson.category, 'name', language)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
