import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  HiHome, HiBookmark, HiDownload, HiMenu, HiX,
  HiChevronLeft, HiSun, HiMoon, HiLogout, HiCollection,
  HiUser, HiCog,
} from 'react-icons/hi';
import { Headphones, Video, FileText, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import type { TranslationKey } from '../i18n';

const navItems = [
  { href: '/dashboard', labelKey: 'dashboard.home' as const, icon: HiHome },
  { href: '/dashboard/bookmarks', labelKey: 'dashboard.bookmarks' as const, icon: HiBookmark },
  { href: '/dashboard/downloads', labelKey: 'dashboard.downloads' as const, icon: HiDownload },
  { href: '/dashboard/audio-history', labelKey: 'dashboard.audio_history' as const, icon: Headphones, customIcon: true },
  { href: '/dashboard/video-history', labelKey: 'dashboard.video_history' as const, icon: Video, customIcon: true },
  { href: '/dashboard/pdf-history', labelKey: 'dashboard.pdf_history' as const, icon: FileText, customIcon: true },
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
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <BackgroundLayout>
      <div className="flex h-screen overflow-hidden">

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-auto
          bg-dark-800/95 border-r border-white/5
          flex flex-col backdrop-blur-xl
        `}
          style={{ boxShadow: sidebarOpen ? '0 0 40px rgba(0,0,0,0.5)' : 'none' }}
        >
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/5 shrink-0">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                S
              </div>
              <div>
                <span className="text-sm font-bold text-white block leading-tight">{t('dashboard.title')}</span>
                <span className="text-[9px] text-white/40 block leading-tight">Sh. Mohammed Zabuur</span>
              </div>
            </Link>
            <button className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-white/50" onClick={() => setSidebarOpen(false)}>
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
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
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-emerald-500/10 text-emerald-400 shadow-sm border-l-2 border-emerald-500'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80 border-l-2 border-transparent'
                    }
                  `}
                >
                  {item.customIcon ? (
                    <Icon className="w-5 h-5 shrink-0" />
                  ) : (
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
                  )}
                  {t(item.labelKey as TranslationKey)}
                </Link>
              );
            })}

            {/* Admin Panel link for admins */}
            {isAdmin && (
              <div className="pt-4 mt-4 border-t border-white/5">
                <Link
                  to="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${location.pathname.startsWith('/admin')
                      ? 'bg-emerald-500/10 text-emerald-400 shadow-sm border-l-2 border-emerald-500'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80 border-l-2 border-transparent'
                    }
                  `}
                >
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  {t('dashboard.admin_panel')}
                </Link>
              </div>
            )}
          </nav>

          {/* User info & logout */}
          <div className="p-3 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/60 hover:bg-white/5 transition-all mt-1"
            >
              <HiChevronLeft className="w-4 h-4" />
              {t('dashboard.back_to_site')}
            </Link>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="h-16 bg-dark-800/80 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 shrink-0 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-white/50" onClick={() => setSidebarOpen(true)}>
                <HiMenu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-white hidden sm:block">
                {t('dashboard.title')}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggle}
                className="p-2 rounded-lg hover:bg-white/5 text-white/50 transition-all"
                aria-label={t('nav.toggle_dark')}
              >
                {mode === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"
                title={t('dashboard.logout')}
              >
                <HiLogout className="w-4 h-4" />
                <span className="hidden sm:inline">{t('dashboard.logout')}</span>
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </BackgroundLayout>
  );
}
