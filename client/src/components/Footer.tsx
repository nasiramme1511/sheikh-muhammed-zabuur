import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Send, Heart, Bot, CheckCircle, AlertCircle, Sparkles, Globe, Users, LogIn } from 'lucide-react';
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
    <footer className="relative bg-dark-900 overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-islamic-pattern opacity-30" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-icc-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="relative">
                <img
                  src="/logo.svg"
                  alt={t('app.title')}
                  className="h-14 w-auto transition-all duration-300 group-hover:scale-105"
                  style={{ filter: 'drop-shadow(0 0 16px rgba(16,185,129,0.2))' }}
                  loading="lazy"
                />
                <div className="absolute -inset-2 rounded-xl bg-icc-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
            <p className="text-white/50 text-sm mb-6 max-w-sm leading-relaxed">
              {t('footer.description')}
            </p>

            <div className="mb-6 p-4 glass rounded-xl">
              <p className="font-amiri text-lg text-gold-400/60 text-center" dir="rtl">
                سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ
              </p>
            </div>

            {user ? (
              <div className="mb-6">
                <div className="p-5 glass rounded-xl">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold-400" />
                    Follow Sheikh Mohammed Zabuur
                  </h4>
                  <p className="text-xs text-white/50 mb-4 leading-relaxed">
                    Stay connected through official social media channels for:
                  </p>
                  <ul className="text-xs text-white/40 space-y-1 mb-4">
                    <li>• Live Streams</li>
                    <li>• Tafsir Lessons</li>
                    <li>• Riyadus Salihin</li>
                    <li>• Bulugh Al-Maram</li>
                    <li>• Tajreed Lessons</li>
                    <li>• Usul Classes</li>
                    <li>• Daily Islamic Reminders</li>
                  </ul>
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
              </div>
            ) : (
              <div className="mb-6">
                <div className="p-5 glass rounded-xl text-center">
                  <LogIn className="w-8 h-8 text-white/30 mx-auto mb-3" />
                  <p className="text-sm text-white/60 font-medium">Join Our Community</p>
                  <p className="text-xs text-white/40 mt-1 mb-4">Sign in to connect with Sheikh Mohammed Zabuur on social media.</p>
                  <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-icc-500 hover:bg-icc-600 text-white text-xs font-medium transition-colors">
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">{t('nav.content_library')}</h3>
            <ul className="space-y-3">
              <li><Link to="/audio" className="text-white/50 hover:text-icc-400 text-sm transition-colors flex items-center gap-2">🎵 {t('nav.audio_lectures')}</Link></li>
              <li><Link to="/videos" className="text-white/50 hover:text-icc-400 text-sm transition-colors flex items-center gap-2">🎬 {t('nav.video_lectures')}</Link></li>
              <li><Link to="/pdfs" className="text-white/50 hover:text-icc-400 text-sm transition-colors flex items-center gap-2">📄 {t('nav.pdf_library')}</Link></li>
              <li><Link to="/live" className="text-white/50 hover:text-icc-400 text-sm transition-colors flex items-center gap-2">🔴 {t('nav.live_stream')}</Link></li>
              <li><Link to="/recordings" className="text-white/50 hover:text-icc-400 text-sm transition-colors flex items-center gap-2">📺 {t('nav.recordings')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">{t('nav.platform')}</h3>
            <ul className="space-y-3">
              <li><Link to="/search" className="text-white/50 hover:text-icc-400 text-sm transition-colors">{t('nav.search_label')}</Link></li>
              <li><Link to="/about" className="text-white/50 hover:text-icc-400 text-sm transition-colors">{t('nav.about_shaykh')}</Link></li>
              <li><Link to="/contact" className="text-white/50 hover:text-icc-400 text-sm transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>


          <div>
            <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">{t('footer.support')}</h3>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-white/50 hover:text-icc-400 text-sm transition-colors">{t('footer.help_center')}</Link></li>
              <li><Link to="/privacy" className="text-white/50 hover:text-icc-400 text-sm transition-colors">{t('footer.privacy_policy')}</Link></li>
              <li><Link to="/terms" className="text-white/50 hover:text-icc-400 text-sm transition-colors">{t('footer.terms_of_service')}</Link></li>
              <li><Link to="/cookies" className="text-white/50 hover:text-icc-400 text-sm transition-colors">{t('footer.cookies')}</Link></li>
              <li><Link to="/contact" className="text-white/50 hover:text-icc-400 text-sm transition-colors">{t('footer.contact_us')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">{t('footer.languages')}</h3>
            <ul className="space-y-2">
              {LANGUAGES.map((lang) => (
                <li key={lang.code}>
                  <button
                    onClick={() => setLanguage(lang.code as any)}
                    className={`w-full flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-all ${
                      language === lang.code
                        ? 'bg-icc-500/10 text-icc-400 border border-icc-500/20'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {language === lang.code && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-icc-400" />
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

        <div className="mt-12 pt-12 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">{t('footer.stay_updated')}</h3>
              <p className="text-white/40 text-sm">{t('footer.newsletter_desc_alt')}</p>
            </div>
            <form className="flex flex-col sm:flex-row w-full md:w-auto gap-2" onSubmit={handleSubscribe} aria-label={t('footer.newsletter_title')}>
              <div className="relative flex-1 md:w-72">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.enter_email')}
                  required
                  disabled={status === 'loading'}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-r-none text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 transition-colors text-sm disabled:opacity-50"
                  aria-label={t('footer.email_placeholder')}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                className="px-6 py-3 bg-icc-500 hover:bg-icc-600 disabled:bg-icc-500/50 disabled:cursor-not-allowed text-white font-medium rounded-xl sm:rounded-l-none transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
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
              <p className="flex items-center gap-1.5 text-xs text-emerald-400" role="alert">
                <CheckCircle className="w-3 h-3" /> {msg}
              </p>
            )}
            {status === 'error' && (
              <p className="flex items-center gap-1.5 text-xs text-red-400" role="alert">
                <AlertCircle className="w-3 h-3" /> {msg}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
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
              <div className="w-8 h-px bg-current" />
              <Sparkles className="w-4 h-4" />
              <div className="w-8 h-px bg-current" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
