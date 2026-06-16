import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Globe, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedField } from '../../lib/language';
import type { Teacher } from '../../types';

interface Props {
  teacher: Teacher;
}

export default function TeacherBio({ teacher }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const bio = getLocalizedField(teacher, 'bio', language);
  const specialties = teacher.specialties?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const languages = teacher.languages?.split(',').map(s => s.trim()).filter(Boolean) || [];

  if (!bio && !teacher.education && specialties.length === 0 && languages.length === 0) return null;

  const truncated = bio && bio.length > 200;
  const displayBio = expanded || !truncated ? bio : bio.slice(0, 200) + '...';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-2xl bg-dark-800/50 border border-white/5 p-6 md:p-8"
    >
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-emerald-400" />
        {t('teacher_detail_page.about')}
      </h2>

      {bio && (
        <div>
          <p className="text-sm text-white/60 leading-relaxed">{displayBio}</p>
          {truncated && (
            <button onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              {expanded ? (
                <><ChevronUp className="w-3.5 h-3.5" /> {t('teacher_detail_page.show_less')}</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> {t('teacher_detail_page.read_more')}</>
              )}
            </button>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
        {teacher.education && (
          <div>
            <div className="flex items-center gap-2 text-xs text-white/40 mb-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              {t('teacher_detail_page.education')}
            </div>
            <p className="text-sm text-white/80">{teacher.education}</p>
          </div>
        )}
        {specialties.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-xs text-white/40 mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              {t('teacher_detail_page.specialties')}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {specialties.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-white/60">{s}</span>
              ))}
            </div>
          </div>
        )}
        {languages.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-xs text-white/40 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              {t('teacher_detail_page.languages')}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((l) => (
                <span key={l} className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-white/60">{l}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
