import { Link } from 'react-router-dom';
import { HiPlay } from 'react-icons/hi';
import { FaTelegramPlane } from 'react-icons/fa';
import { BadgeCheck, BookOpen } from 'lucide-react';
import { Teacher } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedField } from '../lib/language';
import { useTranslation } from '../i18n';

interface Props {
  teacher: Teacher;
}

export default function TeacherCard({ teacher }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const name = getLocalizedField(teacher, 'name', language);
  const showEnglishFallback = language !== 'en' && teacher.name && name !== teacher.name;
  const specialties = teacher.specialties?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const lessonCount = teacher._count?.lessons ?? 0;

  return (
    <Link to={`/teachers/${teacher.slug}`} className="group block rounded-2xl bg-dark-800/50 border border-white/5 p-5 hover:border-emerald-500/20 hover:bg-dark-800/70 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-white/5">
          {teacher.image ? (
            <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HiPlay className="w-7 h-7 text-emerald-400" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors truncate">{name}</h3>
            {teacher.verified && (
              <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            {teacher.telegram && (
              <FaTelegramPlane className="w-3.5 h-3.5 text-[#0088cc] shrink-0" />
            )}
          </div>
          {showEnglishFallback && (
            <p className="text-xs text-white/40 truncate">{teacher.name}</p>
          )}
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {specialties.slice(0, 2).map((s) => (
                <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400/80">{s}</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {lessonCount} {t('admin.lessons_suffix')}
            </span>
            {teacher.studentsCount ? (
              <span>{teacher.studentsCount.toLocaleString()}+ {t('teacher_detail_page.followers')}</span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
