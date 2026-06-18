import { Link } from 'react-router-dom';
import { FaTelegramPlane } from 'react-icons/fa';
import { BookOpen } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useLanguage } from '../../context/LanguageContext';

export default function TeacherFooter() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
    { code: 'om', label: 'Afaan Oromoo', flag: '🇪🇹' },
  ];

  return (
    <footer className="border-t border-white/5 pt-8 pb-6 mt-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-icc-400" />
            <span className="text-sm font-bold text-white">{t('app.title')}</span>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs text-white/40">
          <Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link>
          <Link to="/teachers" className="hover:text-white transition-colors">{t('nav.teachers')}</Link>
          <Link to="/categories" className="hover:text-white transition-colors">{t('nav.categories')}</Link>
          <Link to="/contact" className="hover:text-white transition-colors">{t('nav.contact')}</Link>
        </div>

        <div className="flex items-center gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as any)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${language === lang.code ? 'bg-icc-500/20 text-icc-400 border border-icc-500/30' : 'text-white/40 hover:text-white bg-white/5 border border-white/5'}`}
            >
              {lang.flag} {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 text-center">
        <p className="text-xs text-white/30">
          &copy; {new Date().getFullYear()} {t('app.title')}. {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
}
