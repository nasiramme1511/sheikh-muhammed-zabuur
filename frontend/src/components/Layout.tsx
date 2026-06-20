import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, Headphones, Radio, User, ArrowUp } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingPlayer from './FloatingPlayer';
import FloatingTelegram from './FloatingTelegram';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import type { TranslationKey } from '../i18n';
import BackgroundLayout from './BackgroundLayout';
import AppearanceStyles from './AppearanceStyles';
import InstallPrompt from './InstallPrompt';
import { useAppearance } from '../context/AppearanceContext';

const navItems = [
  { icon: Home, key: 'nav.mobile_home', path: '/' },
  { icon: Headphones, key: 'nav.audio_library', path: '/audio' },
  { icon: BookOpen, key: 'nav.series', path: '/series' },
  { icon: Radio, key: 'nav.live_stream', path: '/live' },
  { icon: User, key: 'nav.mobile_profile', path: '/login', authRequired: false },
];

const guestNavItems: Array<{ icon: any; key: string; path: string; authRequired?: boolean }> = [
  { icon: Home, key: 'nav.mobile_home', path: '/' },
  { icon: User, key: 'nav.sign_in', path: '/login', authRequired: true },
];

export default function Layout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { settings } = useAppearance();
  const notFound = pathname === '/404';
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { mode, setMode } = useTheme();

  useEffect(() => {
    const savedTheme = localStorage.getItem('icc-theme');
    if (!savedTheme && settings.defaultMode && mode !== settings.defaultMode) {
      setMode(settings.defaultMode);
    }
  }, [settings.defaultMode, mode, setMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);
    if (mode === 'light') {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    } else {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    }
    root.classList.toggle('app-zoom-bg', settings.backgroundBehavior === 'zoom');
    root.classList.toggle('app-bg-enabled', settings.backgroundEnabled);
    root.classList.toggle('app-bg-disabled', !settings.backgroundEnabled);
  }, [mode, settings.backgroundBehavior, settings.backgroundEnabled]);

  return (
    <BackgroundLayout>
      <AppearanceStyles />
      <Navbar />
      <main id="main-content" className="flex-1 min-h-screen" role="main">
        <Outlet />
      </main>
      <Footer />
      <FloatingPlayer />
      <FloatingTelegram />
      <InstallPrompt />

      <motion.button
        onClick={scrollToTop}
        className={`fixed bottom-20 lg:bottom-24 right-4 z-50 p-3 rounded-2xl bg-gradient-to-br from-icc-500 to-icc-600 text-white shadow-lg shadow-icc-500/20 hover:shadow-icc-500/40 transition-all duration-300 ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label={t('layout.back_to_top')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>

      {!notFound && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-surface-900/95 backdrop-blur-xl border-t border-white/5 shadow-2xl shadow-surface-950/50">
          <div className="flex items-center justify-around h-16 px-2">
            {(user ? navItems : guestNavItems).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              const href = item.authRequired && !user ? '/login' : item.path;
              return (
                <Link
                  key={item.path}
                  to={href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'text-icc-400 bg-icc-500/10'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                  aria-label={t(item.key as TranslationKey)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{t(item.key as TranslationKey)}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </BackgroundLayout>
  );
}
