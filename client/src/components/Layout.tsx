import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, Search, BookMarked, User, ArrowUp } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingPlayer from './FloatingPlayer';
import AIChatButton from './ai/AIChatButton';
import AIChatPanel from './ai/AIChatPanel';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import type { TranslationKey } from '../i18n';
import BackgroundLayout from './BackgroundLayout';
import AppearanceStyles from './AppearanceStyles';
import { useAppearance } from '../context/AppearanceContext';

const navItems = [
  { icon: Home, key: 'nav.mobile_home', path: '/' },
  { icon: BookOpen, key: 'nav.mobile_categories', path: '/categories' },
  { icon: Search, key: 'nav.mobile_search', path: '/search' },
  { icon: BookMarked, key: 'nav.mobile_bookmarks', path: '/bookmarks', authRequired: true },
  { icon: User, key: 'nav.mobile_profile', path: '/dashboard', authRequired: true },
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
  const isAdmin = pathname.startsWith('/admin');
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

  useEffect(() => {
    const mode = settings.defaultMode;
    const root = document.documentElement;
    if (mode === 'light') {
      root.classList.remove('dark');
    } else if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
    root.classList.toggle('app-zoom-bg', settings.backgroundBehavior === 'zoom');
  }, [settings.defaultMode, settings.backgroundBehavior]);

  return (
    <BackgroundLayout>
      <AppearanceStyles />
      <Navbar />
      <main id="main-content" className="flex-1" role="main">
        <Outlet />
      </main>
      <Footer />
      <FloatingPlayer />

      <AIChatPanel />
      <AIChatButton />

      <motion.button
        onClick={scrollToTop}
        className={`fixed bottom-20 lg:bottom-6 right-4 z-50 p-3 rounded-xl bg-gradient-to-br from-icc-500 to-icc-600 text-white shadow-lg shadow-icc-500/20 hover:shadow-icc-500/40 transition-all duration-300 ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label={t('layout.back_to_top')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>

      {!isAdmin && !notFound && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-dark-800/95 backdrop-blur-lg border-t border-white/5 shadow-lg">
          <div className="flex items-center justify-around h-14 px-2">
            {(user ? navItems : guestNavItems).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              const href = item.authRequired && !user ? '/login' : item.path;
              return (
                <Link
                  key={item.path}
                  to={href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'text-icc-400'
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
