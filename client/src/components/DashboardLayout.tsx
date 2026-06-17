import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  HiHome, HiBookmark, HiDownload, HiMenu, HiX,
  HiChevronLeft, HiSun, HiMoon, HiLogout,
  HiUser, HiCog,
} from 'react-icons/hi';
import { Headphones, Video, FileText, ShieldCheck, GraduationCap, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import type { TranslationKey } from '../i18n';

const navItems = [
  { href: '/dashboard', labelKey: 'dashboard.home' as const, icon: HiHome },
  { href: '/dashboard/bookmarks', labelKey: 'dashboard.bookmarks' as const, icon: HiBookmark },
  { href: '/dashboard/downloads', labelKey: 'dashboard.downloads' as const, icon: HiDownload },
  { href: '/dashboard/audio-history', labelKey: 'dashboard.audio_history' as const, icon: Headphones },
  { href: '/dashboard/video-history', labelKey: 'dashboard.video_history' as const, icon: Video },
  { href: '/dashboard/pdf-history', labelKey: 'dashboard.pdf_history' as const, icon: FileText },
  { href: '/dashboard/profile', labelKey: 'dashboard.profile' as const, icon: HiUser },
  { href: '/dashboard/settings', labelKey: 'dashboard.settings' as const, icon: HiCog },
];

import BackgroundLayout from './BackgroundLayout';

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { mode, toggle } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-icc-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <BackgroundLayout>
      <div className="flex h-screen overflow-hidden">
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-auto
          bg-surface-900/95 border-r border-white/5
          flex flex-col backdrop-blur-xl
        `}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/5 shrink-0">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-icc-500 to-icc-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-icc-500/20">
                S
              </div>
              <div>
                <span className="text-sm font-bold text-white block leading-tight">{t('dashboard.title')}</span>
                <span className="text-[9px] text-white/40 block leading-tight">Sh. Mohammed Zabuur</span>
              </div>
            </Link>
            <button className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-white/50 transition-all" onClick={() => setSidebarOpen(false)}>
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <div className="mb-4 px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icc-400 to-icc-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg shadow-icc-500/20">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-icc-400 font-medium">Student</p>
                </div>
              </div>
            </div>

            {navItems.map((item) => {
              const isActive = item.href === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-icc-500/10 text-icc-400 border border-icc-500/20 shadow-sm'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-icc-400' : ''}`} />
                  {t(item.labelKey as TranslationKey)}
                </Link>
              );
            })}

            {isAdmin && (
              <div className="pt-4 mt-4 border-t border-white/5">
                <Link
                  to="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-icc-500/10 text-icc-400 border border-icc-500/20'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80 border border-transparent'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  {t('dashboard.admin_panel')}
                </Link>
              </div>
            )}
          </nav>

          <div className="p-3 border-t border-white/5 shrink-0">
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"
            >
              <HiLogout className="w-4 h-4" />
              {t('dashboard.logout')}
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white/60 hover:bg-white/5 transition-all mt-1"
            >
              <HiChevronLeft className="w-4 h-4" />
              {t('dashboard.back_to_site')}
            </Link>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-surface-900/80 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 shrink-0 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-white/50 transition-all" onClick={() => setSidebarOpen(true)}>
                <HiMenu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-white hidden sm:block">
                {t('dashboard.title')}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggle}
                className="p-2 rounded-xl hover:bg-white/5 text-white/50 transition-all"
                aria-label={t('nav.toggle_dark')}
              >
                {mode === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"
                title={t('dashboard.logout')}
              >
                <HiLogout className="w-4 h-4" />
                <span className="hidden sm:inline">{t('dashboard.logout')}</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </BackgroundLayout>
  );
}
