import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { FaTelegramPlane, FaFacebook, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';
import { useTranslation } from '../i18n';
import ResponsiveScholarImage from './ResponsiveScholarImage';

const SOCIAL_LINKS = [
  { name: 'YouTube', icon: <FaYoutube />, url: 'https://youtube.com/@sheikhmahammadzabuur-b7f', color: '#FF0000' },
  { name: 'Telegram', icon: <FaTelegramPlane />, url: 'https://t.me/sheikhmohammedzabuur', color: '#229ED9' },
  { name: 'Facebook', icon: <FaFacebook />, url: 'https://facebook.com/profile.php?id=61555767907866', color: '#1877F2' },
  { name: 'TikTok', icon: <FaTiktok />, url: 'https://www.tiktok.com/@sheikh.mahammad.z', color: '#FFFFFF' },
  { name: 'Instagram', icon: <FaInstagram />, url: 'https://instagram.com/sheikhmohammedzabuur', color: '#E4405F' },
];

const TELEGRAM_CHANNELS = [
  { label: 'Darsii Tafsiiraa', url: 'https://t.me/sheikhmohammedzabuur' },
  { label: 'Darsii Riyaadaa', url: 'https://t.me/sheikhmohammedzabuur' },
  { label: 'Darsii Buluukaa', url: 'https://t.me/sheikhmohammedzabuur' },
  { label: 'Darsii Tajriidaa', url: 'https://t.me/sheikhmohammedzabuur' },
  { label: 'Darsii Beeyquunaa', url: 'https://t.me/sheikhmohammedzabuur' },
  { label: 'Darsii Tawheed', url: 'https://t.me/sheikhmohammedzabuur' },
  { label: 'Darsii Usuula Salaasaa', url: 'https://t.me/sheikhmohammedzabuur' },
];

const PLATFORM_LINKS = [
  { label: 'nav.series', href: '/series' },
  { label: 'nav.audio_lectures', href: '/audio' },
  { label: 'nav.video_lectures', href: '/videos' },
  { label: 'nav.pdf_library', href: '/pdfs' },
  { label: 'nav.live_stream', href: '/live' },
  { label: 'nav.recordings', href: '/recordings' },
  { label: 'nav.about_sheikh', href: '/about' },
  { label: 'nav.contact', href: '/contact' },
];

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-surface-950 overflow-hidden border-t border-white/5 pt-14 pb-10 z-25 text-start">
      {/* Subtle decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-64 bg-icc-500/4 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-72 h-48 bg-gold-500/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10">

          {/* Brand column */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center gap-4 group">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/10 ring-2 ring-icc-500/20 group-hover:ring-icc-400/40 transition-all duration-500">
                  <ResponsiveScholarImage
                    src="/images/sheikh-zabuur.jpg"
                    alt={t('app.title')}
                    className="w-full h-full transition-transform duration-500 group-hover:scale-110"
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

            {/* Social links */}
            <div className="flex items-center gap-2 flex-wrap">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/50 border border-white/10 hover:text-white hover:border-sky-500/30 hover:bg-sky-500/10 hover:-translate-y-0.5 transition-all"
                  title={social.name}
                  aria-label={social.name}
                >
                  <span className="text-sm">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-2">
              {t('footer.platform')}
            </h3>
            <ul className="space-y-2.5">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/55 hover:text-icc-400 text-xs transition-colors flex items-center gap-2 group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300">
                      {t(link.label as any)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Telegram channels */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
              <FaTelegramPlane className="w-3.5 h-3.5 text-sky-400" />
              {t('footer.telegram_channels')}
            </h3>
            <ul className="space-y-2.5">
              {TELEGRAM_CHANNELS.map((ch) => (
                <li key={ch.label}>
                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/55 hover:text-sky-400 text-xs transition-colors flex items-center gap-2 group"
                  >
                    <FaTelegramPlane className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:text-sky-400 transition-all shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300">
                      {ch.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Telegram CTA */}
            <a
              href="https://t.me/sheikhmohammedzabuur"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all group mt-4"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
                <FaTelegramPlane className="w-4 h-4 text-sky-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">{t('footer.join_telegram')}</p>
                <p className="text-[10px] text-white/40 mt-0.5">@sheikhmohammedzabuur</p>
              </div>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-sky-500/20 to-transparent my-5" />

        {/* Copyright bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/35 text-[11px] pt-2">
          <p>{t('footer.copyright_full', { year: currentYear })}</p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/privacy" className="hover:text-icc-400 transition-colors">{t('footer.privacy')}</Link>
            <span className="opacity-30">•</span>
            <Link to="/terms" className="hover:text-icc-400 transition-colors">{t('footer.terms')}</Link>
          </div>

          <div className="flex items-center gap-2 opacity-40 shrink-0">
            <div className="w-6 h-px bg-white/20" />
            <Heart className="w-3.5 h-3.5 text-red-500" />
            <div className="w-6 h-px bg-white/20" />
          </div>
        </div>
      </div>
    </footer>
  );
}
