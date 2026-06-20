import { Link } from 'react-router-dom';
import { FaTelegramPlane, FaYoutube } from 'react-icons/fa';
import { Heart, MapPin, Navigation } from 'lucide-react';

const SOCIAL_LINKS = [
  { name: 'YouTube', icon: <FaYoutube />, url: 'https://youtube.com/@sheikhmahammadzabuur-b7f', color: '#FF0000' },
  { name: 'Telegram', icon: <FaTelegramPlane />, url: 'https://t.me/sheikhmohammedzabuur', color: '#229ED9' },
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

const RESOURCE_LINKS = [
  { label: 'Audio Library', href: '/audio' },
  { label: 'Video Library', href: '/videos' },
  { label: 'Study Series', href: '/series' },
  { label: 'Live Stream', href: '/live' },
  { label: 'Resources', href: '/resources' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const googleMapLink = 'https://maps.app.goo.gl/ehUvnR3LAsLNov3A7?g_st=ac';

  return (
    <footer className="relative bg-surface-950 overflow-hidden border-t border-white/5 pt-14 pb-10 z-25 text-start">
      <div className="absolute top-0 left-1/4 w-96 h-64 bg-green-500/4 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-72 h-48 bg-gold-500/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center gap-4 group">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg group-hover:shadow-green-500/30 transition-all duration-500">
                  <span className="text-white font-bold text-2xl font-arabic">ز</span>
                </div>
                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-green-500/20 to-gold-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-sm tracking-tight text-white block leading-tight group-hover:text-green-300 transition-colors">
                  Sheikh Mohammed Zabuur
                </span>
                <span className="text-[10px] text-white/40 block leading-tight mt-0.5 tracking-wider uppercase">
                  Authentic Islamic Lessons
                </span>
              </div>
            </Link>

            <p className="text-white/50 text-xs leading-relaxed max-w-sm">
              Dedicated to teaching authentic Islamic sciences through daily lessons, structured study circles, audio lectures, video lessons, live broadcasts, and educational resources.
            </p>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
              <p className="font-quran text-base text-amber-400/70 text-center leading-loose tracking-wide" dir="rtl">
                سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {SOCIAL_LINKS.map((social) => (
                <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/50 border border-white/10 hover:text-white hover:border-green-500/30 hover:bg-green-500/10 hover:-translate-y-0.5 transition-all"
                  title={social.name} aria-label={social.name}>
                  <span className="text-sm">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-2">Platform</h3>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-white/55 hover:text-green-400 text-xs transition-colors">Home</Link></li>
              <li><Link to="/series" className="text-white/55 hover:text-green-400 text-xs transition-colors">Study Series</Link></li>
              <li><Link to="/live" className="text-white/55 hover:text-green-400 text-xs transition-colors">Live Stream</Link></li>
              <li><Link to="/about" className="text-white/55 hover:text-green-400 text-xs transition-colors">About Sheikh</Link></li>
              <li><Link to="/contact" className="text-white/55 hover:text-green-400 text-xs transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-2">Resources</h3>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/55 hover:text-green-400 text-xs transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-2">Community</h3>
            <ul className="space-y-2.5">
              {TELEGRAM_CHANNELS.slice(0, 5).map((ch) => (
                <li key={ch.label}>
                  <a href={ch.url} target="_blank" rel="noopener noreferrer" className="text-white/55 hover:text-green-400 text-xs transition-colors flex items-center gap-2">
                    <FaTelegramPlane className="w-3 h-3 opacity-40 group-hover:opacity-100 shrink-0" />
                    <span>{ch.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-2">Contact</h3>
            <ul className="space-y-2.5">
              <li>
                <a href={googleMapLink} target="_blank" rel="noopener noreferrer" className="text-white/55 hover:text-green-400 text-xs transition-colors flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  Iman Chercher, Ethiopia
                </a>
              </li>
              <li>
                <a href={googleMapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-green-400 hover:text-green-300 transition-colors font-medium">
                  <Navigation className="w-3.5 h-3.5" />
                  Get Directions
                </a>
              </li>
            </ul>
            <a href="https://t.me/sheikhmohammedzabuur" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-all group mt-4">
              <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                <FaTelegramPlane className="w-4 h-4 text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-green-300 transition-colors">Join Telegram</p>
                <p className="text-[10px] text-white/40 mt-0.5">@sheikhmohammedzabuur</p>
              </div>
            </a>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-green-500/20 to-transparent my-5" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/35 text-[11px] pt-2">
          <p>© {currentYear} Sheikh Mohammed Zabuur. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/privacy" className="hover:text-green-400 transition-colors">Privacy Policy</Link>
            <span className="opacity-30">•</span>
            <Link to="/terms" className="hover:text-green-400 transition-colors">Terms of Service</Link>
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
