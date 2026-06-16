import { motion } from 'framer-motion';
import { BookOpen, FileText, GraduationCap, Users } from 'lucide-react';
import { FaTelegramPlane } from 'react-icons/fa';
import type { ElementType } from 'react';
import { useTranslation } from '../../i18n';
import type { Teacher } from '../../types';
import type { ChannelData } from '../../types';

interface Props {
  teacher: Teacher;
  channels: ChannelData[];
  booksCount: number;
}

interface Stat {
  icon: ElementType;
  label: string;
  value: number;
  color: string;
  bg: string;
}

export default function TeacherStats({ teacher, channels, booksCount }: Props) {
  const { t } = useTranslation();
  const lessonCount = teacher._count?.lessons ?? teacher.lessons?.length ?? 0;

  const stats: Stat[] = [
    { icon: BookOpen, label: t('teacher_detail_page.stats_lessons'), value: lessonCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: GraduationCap, label: t('teacher_detail_page.courses'), value: Math.max(1, Math.ceil(lessonCount / 5)), color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
    { icon: FaTelegramPlane, label: t('teacher_detail_page.stats_channels'), value: channels.length, color: 'text-[#0088cc]', bg: 'bg-blue-500/10 border-blue-500/20' },
    { icon: FileText, label: t('teacher_detail_page.stats_pdfs'), value: booksCount, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { icon: Users, label: t('teacher_detail_page.followers'), value: teacher.studentsCount ?? 0, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className={`rounded-2xl ${stat.bg} border p-4 text-center hover:scale-[1.02] transition-transform`}>
            <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
            <p className="text-xl md:text-2xl font-bold text-white">{stat.value.toLocaleString()}+</p>
            <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
          </div>
        );
      })}
    </motion.div>
  );
}
