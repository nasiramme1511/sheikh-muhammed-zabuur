import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, Send, Heart, Bot, CheckCircle, AlertCircle, 
  Sparkles, Users, LogIn, BookOpen, Headphones, 
  Video, FileText, Radio, Tv 
} from 'lucide-react';
import { FaTelegramPlane, FaFacebook, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';
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
  { name: 'YouTube', icon: <FaYoutube />, url: 'https://youtube.com/@sheikhmahammadzabuur-b7f', color: '#FF0000' },
  { name: 'TikTok', icon: <FaTiktok />, url: 'https://www.tiktok.com/@sheikh.mahammad.z', color: '#FFFFFF' },
  { name: 'Telegram', icon: <FaTelegramPlane />, url: 'https://t.me/sheikhmohammedzabuur', color: '#229ED9' },
  { name: 'Facebook', icon: <FaFacebook />, url: 'https://facebook.com/profile.php?id=61555767907866', color: '#1877F2' },
  { name: 'Instagram', icon: <FaInstagram />, url: 'https://instagram.com/sheikhmohammedzabuur', color: '#E4405F' },
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
      { label: 'nav.about_sheikh', href: '/about' },
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
    <footer className="relative bg-surface-950 overflow-hidden border-t border-white/5 pt-16 pb-12 z-25 text-start">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-icc-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Multi-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
          
          {/* Brand & Social Segment */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-flex items-center gap-4 group">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/10 ring-2 ring-icc-500/20 group-hover:ring-icc-400/40 transition-all duration-500">
                  <img
                    src="/images/sheikh-zabuur.jpg"
                    alt={t('app.title')}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-icc-500/20 to-gold-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-sm tracking-tight text-white block leading-tight group-hover:text-icc-300 transition-colors">
                  Sheikh Mohammed Zabuur
                </span>
                <span className="text-[10px] text-white/40 block leading-tight mt-0.5 tracking-wider uppercase">
                  {t('footer.institution')}
                </span>
              </div>
            </Link>

            <p className="text-white/50 text-xs leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>

            {/* Dhikr box */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
              <p className="font-quran text-base text-amber-400/70 text-center leading-loose tracking-wide" dir="rtl">
                سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ
              </p>
            </div>

            {/* Follow widget */}
            {user ? (
              <div className="p-5 bg-gradient-to-br from-white/[0.07] to-white/[0.03] rounded-2xl border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-400" />
                  {t('footer.follow')}
                </h4>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  {t('footer.follow_description')}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {SOCIAL_LINKS.filter(s => s.url).map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/50 border border-white/10 hover:text-white hover:border-sky-500/30 hover:bg-sky-500/10 hover:-translate-y-0.5 transition-all"
                      style={{ '--brand-color': social.color } as React.CSSProperties}
                      title={social.name}
                      aria-label={social.name}
                    >
                      <span className="text-sm">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-5 bg-gradient-to-br from-white/[0.07] to-white/[0.03] rounded-2xl border border-white/10 text-center space-y-3">
                <LogIn className="w-6 h-6 text-sky-400/40 mx-auto" />
                <p className="text-xs font-bold text-white">{t('footer.join_community')}</p>
                <p className="text-[11px] text-white/40 leading-tight">{t('footer.sign_in_description')}</p>
                <Link to="/login" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl sky-icc-gradient text-white text-xs font-bold transition-all shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 active:scale-95 hover:-translate-y-0.5">
                  <LogIn className="w-3.5 h-3.5" />
                  {t('nav.sign_in')}
                </Link>
              </div>
            )}
          </div>

          {/* Links Columns */}
          {FOOTER_LINKS.map((group) => (
            <div key={group.title} className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-2">
                {t(group.title as any)}
              </h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => {
                  const Icon = (link as any).icon;
                  return (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-white/55 hover:text-icc-400 text-xs transition-colors flex items-center gap-2 group"
                      >
                        {Icon && <Icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:text-icc-400 transition-all" />}
                        <span className="group-hover:translate-x-0.5 transition-transform duration-300">
                          {t(link.label as any)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Languages & Hijri segment */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-2">
              {t('footer.languages')}
            </h3>
            <ul className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
              {LANGUAGES.map((lang) => (
                <li key={lang.code}>
                  <button
                    onClick={() => setLanguage(lang.code as any)}
                    className={`w-full flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
                      language === lang.code
                        ? 'bg-icc-500/10 text-icc-400 border-icc-500/20 font-bold'
                        : 'text-white/50 bg-white/5 border-transparent hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.label}</span>
                    {language === lang.code && (
                      <span className="ml-auto w-1 h-1 rounded-full bg-icc-400 shadow-md shadow-icc-500/30" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-1">
              <PrayerTimesWidget />
            </div>
          </div>
        </div>

        {/* Decorative divider line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-sky-500/20 to-transparent my-6" />

        {/* Bottom copyright & micro segment */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-[11px] pt-4">
          <p>
            {t('footer.copyright_full', { year: currentYear })}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/privacy" className="hover:text-icc-400 transition-colors">{t('footer.privacy')}</Link>
            <span className="opacity-30">•</span>
            <Link to="/terms" className="hover:text-icc-400 transition-colors">{t('footer.terms')}</Link>
            <span className="opacity-30">•</span>
            <Link to="/cookies" className="hover:text-icc-400 transition-colors">{t('footer.cookies')}</Link>
            <span className="opacity-30">•</span>
            <button
              onClick={openChat}
              className="hover:text-icc-400 transition-colors flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5 text-icc-500" />
              {t('footer.ai_assistant')}
            </button>
          </div>

          <div className="flex items-center gap-2 opacity-50 shrink-0">
            <div className="w-6 h-px bg-white/20" />
            <Heart className="w-3.5 h-3.5 text-red-500" />
            <div className="w-6 h-px bg-white/20" />
          </div>
        </div>
      </div>
    </footer>
  );
}
