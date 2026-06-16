import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { teachers as teachersApi, books as booksApi, telegram as telegramApi } from '../lib/api';
import { Teacher, Book, ChannelData } from '../types';
import { useTranslation } from '../i18n';
import TeacherHero from '../components/teachers/TeacherHero';
import TeacherStats from '../components/teachers/TeacherStats';
import TeacherBio from '../components/teachers/TeacherBio';
import TeacherLessons from '../components/teachers/TeacherLessons';
import TeacherChannels from '../components/teachers/TeacherChannels';
import TeacherBooks from '../components/teachers/TeacherBooks';
import TeacherSocials from '../components/teachers/TeacherSocials';
import RelatedTeachers from '../components/teachers/RelatedTeachers';
import TeacherFooter from '../components/teachers/TeacherFooter';

export default function TeacherDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [teacherBooks, setTeacherBooks] = useState<Book[]>([]);
  const [telegramChannels, setTelegramChannels] = useState<ChannelData[]>([]);

  useEffect(() => {
    if (!slug) return;
    teachersApi.getBySlug(slug)
      .then((res) => {
        setTeacher(res.data);
        if (res.data.id) {
          booksApi.getByTeacher(res.data.id).then((r) => setTeacherBooks(r.data));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    telegramApi.getAll().then((res) => {
      setTelegramChannels(res.data ?? []);
    }).catch(() => {});
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-white/40">{t('teacher_detail_page.not_found')}</p>
        <Link to="/teachers" className="text-emerald-400 hover:underline mt-4 inline-block">{t('teacher_detail_page.back')}</Link>
      </div>
    );
  }

  const teacherChannels = telegramChannels.filter((ch) => {
    if (!ch.teacherName) return false;
    return ch.teacherName.toLowerCase() === teacher.name.toLowerCase();
  });

  const validLessons = teacher.lessons?.filter(l => l.duration && l.duration > 0) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Link to="/teachers" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-emerald-400 transition-colors">
        <HiArrowLeft className="w-3.5 h-3.5" />
        {t('teacher_detail_page.back')}
      </Link>

      <TeacherHero teacher={teacher} />
      <TeacherStats teacher={teacher} channels={teacherChannels} booksCount={teacherBooks.length} />
      <TeacherBio teacher={teacher} />
      <TeacherSocials teacher={teacher} />
      <TeacherLessons lessons={validLessons} />
      <TeacherChannels channels={teacherChannels} />
      <TeacherBooks books={teacherBooks} />
      <RelatedTeachers currentTeacherId={teacher.id} />
      <TeacherFooter />
    </div>
  );
}
