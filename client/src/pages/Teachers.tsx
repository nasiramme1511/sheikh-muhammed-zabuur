import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { teachers as teachersApi } from '../lib/api';
import { Teacher } from '../types';
import TeacherCard from '../components/TeacherCard';
import { useTranslation } from '../i18n';

export default function Teachers() {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teachersApi.getAll()
      .then((res) => setTeachers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-300">{t('teachers_page.our_scholars')}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">{t('teachers_page.title')}</h1>
        <p className="text-sm text-white/40 mt-2 max-w-2xl mx-auto">{t('teachers_page.subtitle')}</p>
      </motion.div>

      {teachers.length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <p className="text-sm text-white/30">{t('teacher_detail_page.not_found')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teachers.map((teacher, i) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <TeacherCard teacher={teacher} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
