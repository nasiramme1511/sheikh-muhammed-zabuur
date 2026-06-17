import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Send, Heart, Bot, CheckCircle, AlertCircle, Sparkles, Users, LogIn, BookOpen, Headphones, Video, FileText, Radio, Tv } from 'lucide-react';
import { FaYoutube, FaTiktok, FaTelegramPlane, FaFacebook, FaInstagram } from 'react-icons/fa';
import PrayerTimesWidget from './PrayerTimesWidget';
import { useTranslation } from '../i18n';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { newsletter } from '../lib/api';
import { useAIChat } from '../context/AIChatContext';

interface SocialLink {
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  { name: 'YouTube', icon: <FaYoutube />, url: 'https://youtube.com/@sheikhmahammadzabuur-b7f?si=DE0JIVb15Eg_qyTo', color: '#FF0000' },
  { name: 'TikTok', icon: <FaTiktok />, url: 'https://www.tiktok.com/@sheikh.mahammad.z?_t=ZM-8t2Fl7d7POv&_r=1', color: '#FFFFFF' },
  { name: 'Telegram', icon: <FaTelegramPlane />, url: 'https://t.me/shaykhmohammedzabuur', color: '#229ED9' },
  { name: 'Facebook', icon: <FaFacebook />, url: 'https://facebook.com/profile.php?id=61555767907866', color: '#1877F2' },
  { name: 'Instagram', icon: <FaInstagram />, url: 'https://instagram.com/shaykhmohammedzabuur', color: '#E4405F' },
];

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
  { code: 'om', label: 'Afaan Oromoo', flag: '🇪🇹' },
];

const FOOTER_LINKS = [
  {
    title: 'nav.content_library',
    links: [
      { label: 'nav.audio_lectures', href: '/audio', icon: Headphones },
      { label: 'nav.video_lectures', href: '/videos', icon: Video },
      { label: 'nav.pdf_library', href: '/pdfs', icon: FileText },
      { label: 'nav.live_stream', href: '/live', icon: Radio },
      { label: 'nav.recordings', href: '/recordings', icon: Tv },
    ],
  },
  {
    title: 'nav.platform',
    links: [
      { label: 'nav.search_label', href: '/search' },
      { label: 'nav.about_shaykh', href: '/about' },
      { label: 'nav.contact', href: '/contact' },
    ],
  },
  {
    title: 'footer.support',
    links: [
      { label: 'footer.privacy_policy', href: '/privacy' },
      { label: 'footer.terms_of_service', href: '/terms' },
      { label: 'footer.cookies', href: '/cookies' },
      { label: 'footer.contact_us', href: '/contact' },
    ],
  },
];

export default function Footer() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { openChat } = useAIChat();
  const { language, setLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await newsletter.subscribe(email.trim());
      setStatus('success');
      setMsg(res.data.message);
      setEmail('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err: any) {
      setStatus('error');
      setMsg(err.response?.data?.error || t('common.error'));
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <footer className="relative bg-surface-950 overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-islamic-pattern opacity-20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-icc-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gold-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-4">
              <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
                <div className="relative">
                  <img
                    src="/logo.svg"
                    alt={t('app.title')}
                    className="h-12 w-auto transition-all duration-300 group-hover:scale-105"
                    style={{ filter: 'drop-shadow(0 0 16px rgba(16,185,129,0.2))' }}
                    loading="lazy"
                  />
                  <div className="absolute -inset-2 rounded-xl bg-icc-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
              <p className="text-white/50 text-sm mb-6 max-w-sm leading-relaxed">
                {t('footer.description')}
              </p>

              <div className="mb-6 p-4 glass rounded-2xl">
                <p className="font-quran text-lg text-gold-400/60 text-center leading-loose" dir="rtl">
                  سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ
                </p>
              </div>

              {user ? (
                <div className="p-5 glass rounded-2xl">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold-400" />
                    Follow Sheikh Mohammed Zabuur
                  </h4>
                  <p className="text-xs text-white/50 mb-4 leading-relaxed">
                    Stay connected through official social media channels for live streams, tafsir lessons, and daily Islamic reminders.
                  </p>
                  <div className="footer-social-links" role="list" aria-label="Social media links">
                    {SOCIAL_LINKS.filter(s => s.url).map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-social-link"
                        aria-label={social.name}
                        role="listitem"
                        title={social.name}
                        style={{ '--brand-color': social.color } as React.CSSProperties}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-5 glass rounded-2xl text-center">
                  <LogIn className="w-8 h-8 text-white/30 mx-auto mb-3" />
                  <p className="text-sm text-white/60 font-medium">Join Our Community</p>
                  <p className="text-xs text-white/40 mt-1 mb-4">Sign in to connect with Sheikh Mohammed Zabuur on social media.</p>
                  <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 text-white text-xs font-medium transition-all shadow-lg shadow-icc-500/20">
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {FOOTER_LINKS.map((group) => (
              <div key={group.title} className="lg:col-span-2">
                <h3 className="font-semibold text-white text-sm mb-5 uppercase tracking-wider">{t(group.title as any)}</h3>
                <ul className="space-y-3">
                  {group.links.map((link) => {
                    const Icon = (link as any).icon;
                    return (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          className="text-white/50 hover:text-icc-400 text-sm transition-colors flex items-center gap-2 group"
                        >
                          {Icon && <Icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />}
                          {t(link.label as any)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <div className="lg:col-span-2">
              <h3 className="font-semibold text-white text-sm mb-5 uppercase tracking-wider">{t('footer.languages')}</h3>
              <ul className="space-y-2">
                {LANGUAGES.map((lang) => (
                  <li key={lang.code}>
                    <button
                      onClick={() => setLanguage(lang.code as any)}
                      className={`w-full flex items-center gap-2.5 text-sm px-3 py-2 rounded-xl transition-all ${
                        language === lang.code
                          ? 'bg-icc-500/10 text-icc-400 border border-icc-500/20'
                          : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.label}</span>
                      {language === lang.code && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-icc-400 shadow-lg shadow-icc-500/30" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <PrayerTimesWidget />
              </div>
            </div>
          </div>
        </div>

        <div className="py-12 border-t border-white/5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{t('footer.stay_updated')}</h3>
              <p className="text-white/40 text-sm">{t('footer.newsletter_desc_alt')}</p>
            </div>
            <form className="flex flex-col sm:flex-row w-full lg:w-auto gap-2" onSubmit={handleSubscribe} aria-label={t('footer.newsletter_title')}>
              <div className="relative flex-1 lg:w-80">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.enter_email')}
                  required
                  disabled={status === 'loading'}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-r-none text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all text-sm disabled:opacity-50"
                  aria-label={t('footer.email_placeholder')}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                className="px-6 py-3 bg-icc-500 hover:bg-icc-600 disabled:bg-icc-500/50 disabled:cursor-not-allowed text-white font-medium rounded-xl sm:rounded-l-none transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap shadow-lg shadow-icc-500/20"
              >
                {status === 'loading' ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {status === 'loading' ? t('common.loading') : t('footer.subscribe')}
              </button>
            </form>
            {status === 'success' && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-xs text-emerald-400" role="alert">
                <CheckCircle className="w-3 h-3" /> {msg}
              </motion.p>
            )}
            {status === 'error' && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-xs text-red-400" role="alert">
                <AlertCircle className="w-3 h-3" /> {msg}
              </motion.p>
            )}
          </div>
        </div>

        <div className="py-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              &copy; {currentYear} Iman Chercher College. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/40">
              <Link to="/privacy" className="hover:text-icc-400 transition-colors">{t('footer.privacy')}</Link>
              <span className="text-white/10" aria-hidden="true">•</span>
              <Link to="/terms" className="hover:text-icc-400 transition-colors">{t('footer.terms')}</Link>
              <span className="text-white/10" aria-hidden="true">•</span>
              <Link to="/cookies" className="hover:text-icc-400 transition-colors">{t('footer.cookies')}</Link>
              <span className="text-white/10" aria-hidden="true">•</span>
              <button
                onClick={openChat}
                className="hover:text-icc-400 transition-colors flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                {t('footer.ai_assistant')}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center gap-3 text-white/10">
              <div className="w-12 h-px bg-current" />
              <Heart className="w-4 h-4" />
              <div className="w-12 h-px bg-current" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
