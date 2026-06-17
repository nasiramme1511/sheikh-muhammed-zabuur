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
    <footer className="relative bg-[#050505] overflow-hidden border-t border-white/5 pt-16 pb-12 z-25 text-left">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Multi-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
          
          {/* Brand & Social Segment */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/logo.svg"
                  alt={t('app.title')}
                  className="h-10 w-auto transition-transform duration-500 group-hover:scale-105"
                  style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.25))' }}
                  loading="lazy"
                />
                <div className="absolute -inset-2 rounded-xl bg-emerald-500/15 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-extrabold text-sm tracking-wider text-white uppercase group-hover:text-emerald-400 transition-colors">
                Iman Chercher College
              </span>
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
              <div className="p-5 bg-[#0B0B0B] rounded-2xl border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Follow Sheikh Zabuur
                </h4>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Join the official digital media accounts for regular classes, announcements, and direct streams.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {SOCIAL_LINKS.filter(s => s.url).map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 border border-white/5 hover:text-white transition-all hover:-translate-y-0.5"
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
              <div className="p-5 bg-[#0B0B0B] rounded-2xl border border-white/5 text-center space-y-3">
                <LogIn className="w-6 h-6 text-white/30 mx-auto" />
                <p className="text-xs font-bold text-white">Join Our Student Community</p>
                <p className="text-[11px] text-white/40 leading-tight">Sign in to connect, save lessons, and obtain completion verification.</p>
                <Link to="/login" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95">
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
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
                        className="text-white/55 hover:text-emerald-400 text-xs transition-colors flex items-center gap-2 group"
                      >
                        {Icon && <Icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:text-emerald-400 transition-all" />}
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
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold'
                        : 'text-white/50 bg-white/5 border-transparent hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.label}</span>
                    {language === lang.code && (
                      <span className="ml-auto w-1 h-1 rounded-full bg-emerald-400 shadow-md shadow-emerald-500/30" />
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
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

        {/* Bottom copyright & micro segment */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-[11px] pt-4">
          <p>
            &copy; {currentYear} Iman Chercher College. All rights reserved.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/privacy" className="hover:text-emerald-400 transition-colors">{t('footer.privacy')}</Link>
            <span className="opacity-30">•</span>
            <Link to="/terms" className="hover:text-emerald-400 transition-colors">{t('footer.terms')}</Link>
            <span className="opacity-30">•</span>
            <Link to="/cookies" className="hover:text-emerald-400 transition-colors">{t('footer.cookies')}</Link>
            <span className="opacity-30">•</span>
            <button
              onClick={openChat}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-500" />
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
