import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaTelegramPlane } from 'react-icons/fa';
import { HiArrowLeft, HiUser, HiClock, HiCalendar, HiBookOpen } from 'react-icons/hi';
import { Send, Lock, LogIn } from 'lucide-react';
import { lessons as lessonsApi, telegram, telegramAccess } from '../lib/api';
import { Lesson } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedField } from '../lib/language';
import { useTranslation } from '../i18n';
import AudioPlayer from '../components/AudioPlayer';
import LessonCard from '../components/LessonCard';
import ShareButtons from '../components/ShareButtons';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../seo/metadata';

export default function LessonDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useSEO({
    title: slug ? `Lesson: ${slug.replace(/-/g, ' ')}` : 'Lesson',
    description: 'View and listen to Islamic lessons by Sheikh Mohammed Zabuur.',
  });
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [telegramChannel, setTelegramChannel] = useState<{ name: string; id: number } | null>(null);
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramModalType, setTelegramModalType] = useState<'login' | 'subscribe'>('login');

  useEffect(() => {
    if (!slug) return;
    lessonsApi.getBySlug(slug)
      .then((res) => {
        const lessonData = res.data;
        setLesson(lessonData);
        const catSlug = lessonData?.category?.slug;
        if (catSlug) {
          const keyword = catSlug.replace(/[-_]/g, ' ').toLowerCase();
          telegram.getAll().then((telRes) => {
            if (Array.isArray(telRes.data) && telRes.data.length > 0) {
              const match = telRes.data.find((ch: any) => ch.name.toLowerCase().includes(keyword));
              if (match) setTelegramChannel({ name: match.name, id: match.id });
            }
          }).catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!telegramChannel) return;
    if (!user) { setTelegramLink(null); return; }
    telegram.checkAccess().then(accessRes => {
      if (accessRes.data.allowed) {
        telegramAccess.getAll().then(chRes => {
          const match = (chRes.data ?? []).find((ch: any) => ch.id === telegramChannel.id);
          if (match?.link) setTelegramLink(match.link);
        });
      } else { setTelegramLink(null); }
    }).catch(() => setTelegramLink(null));
  }, [user, telegramChannel]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">{t('lesson_detail.not_found')}</p>
        <Link to="/categories" className="text-primary-600 hover:underline mt-4 inline-block">{t('lesson_detail.browse')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={lesson.category ? `/categories/${lesson.category.slug}` : '/categories'} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <HiArrowLeft className="w-4 h-4" /> {t('lesson_detail.back_to', { category: lesson.category ? getLocalizedField(lesson.category, 'name', language) : t('nav.categories') })}
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {lesson.episodeNumber && `${lesson.episodeNumber}. `}{getLocalizedField(lesson, 'title', language)}
          </h1>
          {language !== 'en' && lesson.title && getLocalizedField(lesson, 'title', language) !== lesson.title && <p className="text-lg text-gray-500 mt-1">{lesson.title}</p>}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
            {lesson.duration && (
              <span className="flex items-center gap-1">
                <HiClock className="w-4 h-4" /> {formatDuration(lesson.duration)}
              </span>
            )}
            {lesson.category && (
              <Link to={`/categories/${lesson.category.slug}`} className="flex items-center gap-1 hover:text-primary-600">
                <HiBookOpen className="w-4 h-4" /> {getLocalizedField(lesson.category, 'name', language)}
              </Link>
            )}
            <span className="flex items-center gap-1">
              <HiCalendar className="w-4 h-4" /> {new Date(lesson.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <AudioPlayer
          audioUrl={lesson.audioUrl}
          lessonId={lesson.id}
          initialPosition={lesson.userProgress?.position || 0}
          isBookmarked={lesson.isBookmarked}
        />

        {telegramChannel && (
          <div
            onClick={() => {
              if (telegramLink) { window.open(telegramLink, '_blank', 'noopener,noreferrer'); }
              else if (!user) { setTelegramModalType('login'); setShowTelegramModal(true); }
              else { setTelegramModalType('subscribe'); setShowTelegramModal(true); }
            }}
            className="card p-4 flex items-center gap-4 group hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <FaTelegramPlane className="w-6 h-6 text-[#0088cc]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Official Telegram Channel</p>
              <p className="text-sm font-semibold group-hover:text-blue-600 transition-colors">{telegramChannel.name}</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:bg-blue-500/20 transition-all">
              {!user ? <Lock className="w-4 h-4" /> : !telegramLink ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              {!user ? 'Login Required' : !telegramLink ? 'Subscribe' : 'Join'}
            </div>
          </div>
        )}

        {/* Telegram Access Modal */}
        {showTelegramModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowTelegramModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border dark:border-gray-700" onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                {telegramModalType === 'login' ? <LogIn className="w-7 h-7 text-blue-500" /> : <Lock className="w-7 h-7 text-blue-500" />}
              </div>
              <h3 className="text-xl font-bold text-center mb-2">
                {telegramModalType === 'login' ? 'Login Required' : 'Subscription Required'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
                {telegramModalType === 'login' ? 'Please login to access Telegram channels.' : 'Subscribe to our newsletter to access Telegram channels.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowTelegramModal(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium">
                  Cancel
                </button>
                <button onClick={() => navigate(telegramModalType === 'login' ? '/login' : '/dashboard/profile')} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium">
                  {telegramModalType === 'login' ? 'Login' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{t('lesson_detail.share')}</h3>
          <ShareButtons url={window.location.href} title={getLocalizedField(lesson, 'title', language)} />
        </div>

        {lesson.pdfUrl && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold">{t('lesson_detail.lesson_text')}</h2>
            </div>
            <iframe
              src={lesson.pdfUrl}
              className="w-full h-[500px] md:h-[700px]"
              title={getLocalizedField(lesson, 'title', language)}
            />
          </div>
        )}

        {lesson.description && (
          <div className="card p-5">
            <h2 className="font-semibold mb-2">{t('lesson_detail.description')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.description}</p>
          </div>
        )}

        {lesson.related && lesson.related.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">{t('lesson_detail.related')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lesson.related.map((l) => (
                <LessonCard key={l.id} lesson={l} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
