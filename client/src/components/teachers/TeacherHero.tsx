import { motion } from 'framer-motion';
import { HiPlay } from 'react-icons/hi';
import { FaTelegramPlane, FaYoutube } from 'react-icons/fa';
import { GraduationCap, BadgeCheck, BookOpen, Users } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedField } from '../../lib/language';
import type { Teacher } from '../../types';

interface Props {
  teacher: Teacher;
}

export default function TeacherHero({ teacher }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const name = getLocalizedField(teacher, 'name', language);
  const bio = getLocalizedField(teacher, 'bio', language);
  const showEnglishFallback = language !== 'en' && teacher.name && name !== teacher.name;
  const specialties = teacher.specialties?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const languages = teacher.languages?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const lessonCount = teacher._count?.lessons ?? teacher.lessons?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-icc-900/40 via-dark-800 to-dark-900 border border-white/5"
    >
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start">
        <div className="shrink-0">
          <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
            {teacher.image ? (
              <img src={teacher.image} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-icc-500/20 to-icc-600/20 flex items-center justify-center">
                <HiPlay className="w-12 h-12 text-icc-400" />
              </div>
            )}
            {teacher.verified && (
              <div className="absolute top-2 right-2 bg-icc-500 rounded-full p-1 shadow-lg">
                <BadgeCheck className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{name}</h1>
              {teacher.verified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-icc-500/10 text-icc-400 border border-icc-500/20">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {t('teacher_detail_page.verified')}
                </span>
              )}
            </div>
            {showEnglishFallback && (
              <p className="text-sm text-white/40 mt-0.5">{teacher.name}</p>
            )}
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {specialties.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {bio && (
            <p className="text-sm text-white/60 leading-relaxed max-w-3xl">{bio}</p>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-white/40">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-icc-400" />
              <span>{lessonCount} {t('teacher_detail_page.lessons')}</span>
            </div>
            {teacher.studentsCount ? (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>{teacher.studentsCount.toLocaleString()}+ {t('teacher_detail_page.followers')}</span>
              </div>
            ) : null}
            {languages.length > 0 && (
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                <span>{languages.join(', ')}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#lessons"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-icc-500 to-icc-600 text-white text-sm font-semibold hover:from-icc-400 hover:to-icc-500 transition-all hover:scale-105 shadow-lg shadow-icc-500/20"
            >
              <HiPlay className="w-4 h-4" />
              {t('teacher_detail_page.start_learning')}
            </a>
            {teacher.telegram && (
              <a href={teacher.telegram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0088cc]/20 text-[#0088cc] text-sm font-semibold border border-[#0088cc]/30 hover:bg-[#0088cc]/30 transition-all hover:scale-105">
                <FaTelegramPlane className="w-4 h-4" />
                {t('teacher_detail_page.telegram')}
              </a>
            )}
            {teacher.youtube && (
              <a href={teacher.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold border border-red-500/30 hover:bg-red-500/30 transition-all hover:scale-105">
                <FaYoutube className="w-4 h-4" />
                {t('teacher_detail_page.youtube')}
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
