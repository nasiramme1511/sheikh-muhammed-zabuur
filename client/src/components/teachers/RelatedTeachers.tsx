import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlay, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { BadgeCheck } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedField } from '../../lib/language';
import { teachers as teachersApi } from '../../lib/api';
import type { Teacher } from '../../types';

interface Props {
  currentTeacherId: number;
}

export default function RelatedTeachers({ currentTeacherId }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    teachersApi.getAll().then((res) => {
      const all: Teacher[] = res.data ?? [];
      setTeachers(all.filter((t) => t.id !== currentTeacherId).slice(0, 8));
    }).catch(() => {});
  }, [currentTeacherId]);

  if (teachers.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{t('teacher_detail_page.related_scholars')}</h2>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <HiChevronLeft className="w-4 h-4 text-white/40" />
          </button>
          <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <HiChevronRight className="w-4 h-4 text-white/40" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {teachers.map((teacher) => {
          const name = getLocalizedField(teacher, 'name', language) || teacher.name;
          const lessonCount = teacher._count?.lessons ?? 0;
          return (
            <Link
              key={teacher.id}
              to={`/teachers/${teacher.slug}`}
              className="shrink-0 w-44 rounded-2xl bg-dark-800/50 border border-white/5 p-4 hover:border-emerald-500/20 hover:bg-dark-800/70 transition-all group"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto mb-3 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-white/5">
                {teacher.image ? (
                  <img src={teacher.image} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HiPlay className="w-6 h-6 text-emerald-400" />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-white text-center group-hover:text-emerald-400 transition-colors line-clamp-1">{name}</h3>
              <p className="text-xs text-white/40 text-center mt-1">{lessonCount} {t('teacher_detail_page.lessons')}</p>
              {teacher.verified && (
                <div className="flex justify-center mt-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
