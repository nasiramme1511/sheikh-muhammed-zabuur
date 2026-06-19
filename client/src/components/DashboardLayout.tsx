import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  HiHome, HiBookmark, HiDownload, HiMenu, HiX,
  HiChevronLeft, HiSun, HiMoon, HiLogout,
  HiUser, HiCog, HiChevronDown, HiMusicNote, HiVideoCamera,
  HiCollection, HiLibrary, HiClock, HiCalendar,
} from 'react-icons/hi';
import {
  Headphones, Video, FileText, GraduationCap, Clock, TrendingUp,
  BookOpen, Radio, MessageSquare, Bell, DownloadCloud,
  Wifi, WifiOff, Users, BookMarked, Play, BarChart3,
  Send, UserCircle, Settings, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import type { TranslationKey } from '../i18n';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scrollLock';
import BackgroundLayout from './BackgroundLayout';

interface NavItem {
  href: string;
  labelKey: string;
  icon: any;
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
  icon?: any;
}

const navGroups: NavGroup[] = [
  {
    labelKey: '',
    items: [
      { href: '/dashboard', labelKey: 'student.dashboard', icon: HiHome },
    ],
  },
  {
    labelKey: 'student.group_my_learning',
    icon: GraduationCap,
    items: [
      { href: '/dashboard/continue-learning', labelKey: 'student.continue_learning', icon: Play },
      { href: '/dashboard/study-circles', labelKey: 'student.study_circles', icon: Users },
      { href: '/dashboard/learning-progress', labelKey: 'student.learning_progress', icon: BarChart3 },
    ],
  },
  {
    labelKey: 'student.group_library',
    icon: HiLibrary,
    items: [
      { href: '/dashboard/audio-lectures', labelKey: 'student.audio_lectures', icon: Headphones },
      { href: '/dashboard/video-lectures', labelKey: 'student.video_lectures', icon: Video },
      { href: '/dashboard/pdf-library', labelKey: 'student.pdf_library', icon: FileText },
    ],
  },
  {
    labelKey: 'student.group_offline',
    icon: DownloadCloud,
    items: [
      { href: '/dashboard/downloads', labelKey: 'student.downloads', icon: HiDownload },
      { href: '/dashboard/offline-audio', labelKey: 'student.offline_audio', icon: WifiOff },
      { href: '/dashboard/offline-videos', labelKey: 'student.offline_videos', icon: WifiOff },
      { href: '/dashboard/offline-pdfs', labelKey: 'student.offline_pdfs', icon: WifiOff },
    ],
  },
  {
    labelKey: 'student.group_personal',
    icon: HiBookmark,
    items: [
      { href: '/dashboard/bookmarks', labelKey: 'student.bookmarks', icon: BookMarked },
      { href: '/dashboard/audio-history', labelKey: 'student.audio_history', icon: Headphones },
      { href: '/dashboard/video-history', labelKey: 'student.video_history', icon: Video },
      { href: '/dashboard/pdf-history', labelKey: 'student.pdf_history', icon: FileText },
    ],
  },
  {
    labelKey: 'student.group_community',
    icon: Send,
    items: [
      { href: '/dashboard/telegram-channels', labelKey: 'student.telegram_channels', icon: Send },
      { href: '/dashboard/announcements', labelKey: 'student.announcements', icon: Bell },
    ],
  },
  {
    labelKey: 'student.group_account',
    icon: UserCircle,
    items: [
      { href: '/dashboard/profile', labelKey: 'student.profile', icon: HiUser },
      { href: '/dashboard/settings', labelKey: 'student.settings', icon: HiCog },
      { href: '/dashboard/logout', labelKey: 'student.logout', icon: LogOut },
    ],
  },
];

function getCurrentGroup(pathname: string): string {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)) {
        return group.labelKey;
      }
    }
  }
  return '';
}

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { mode, toggle } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => { initial[g.labelKey] = g.labelKey ? false : true; });
    return initial;
  });

  const currentGroup = getCurrentGroup(location.pathname);

  const toggleGroup = (key: string) => setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const key = currentGroup || '';
    if (key && !expandedGroups[key]) {
      setExpandedGroups((prev) => ({ ...prev, [key]: true }));
    }
  }, [currentGroup]);

  useEffect(() => {
    if (sidebarOpen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
    return () => { unlockBodyScroll(); };
  }, [sidebarOpen]);

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
        <div
          className={`
            fixed inset-0 z-30 bg-black/60 backdrop-blur-sm
            transition-opacity duration-300 lg:hidden
            ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `}
          onClick={closeSidebar}
          aria-hidden="true"
        />

        <aside className={`
          fixed inset-y-0 start-0 z-40 w-64 max-w-[85vw]
          transform transition-transform duration-300 ease-in-out will-change-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}
          lg:translate-x-0 lg:rtl:translate-x-0 lg:static lg:inset-auto
          bg-surface-900/95 border-e border-white/5
          flex flex-col backdrop-blur-2xl
        `}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/5 shrink-0">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-icc-500 to-icc-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-icc-500/20">
                S
              </div>
              <div>
                <span className="text-sm font-bold text-white block leading-tight">Student Portal</span>
                <span className="text-[9px] text-white/40 block leading-tight">Sheikh Mohammed Zabuur</span>
              </div>
            </Link>
            <button className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-white/50 transition-all" onClick={() => setSidebarOpen(false)}>
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scroll-hidden overscroll-contain">
            {navGroups.map((group) => {
              const isActiveGroup = currentGroup === group.labelKey;
              const isExpanded = expandedGroups[group.labelKey];
              const hasLabel = group.labelKey.length > 0;

              return (
                <div key={group.labelKey || '__dashboard'} className="py-0.5">
                  {hasLabel ? (
                    <button
                      onClick={() => toggleGroup(group.labelKey)}
                      className={`flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all min-h-[36px] ${
                        isActiveGroup
                          ? 'text-icc-400'
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {group.icon && <group.icon className="w-3.5 h-3.5" />}
                        {t(group.labelKey as TranslationKey)}
                      </span>
                      <HiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ms-2 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                    </button>
                  ) : null}
                  <div className={`space-y-0.5 overflow-hidden transition-all duration-200 ${isExpanded || !hasLabel ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {group.items.map((item) => {
                      const isActive = item.href === '/dashboard'
                        ? location.pathname === '/dashboard'
                        : location.pathname.startsWith(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={closeSidebar}
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
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="p-3 border-t border-white/5 shrink-0">
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"
            >
              <HiLogout className="w-4 h-4" />
              {t('student.logout')}
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white/60 hover:bg-white/5 transition-all mt-1"
            >
              <HiChevronLeft className="w-4 h-4" />
              {t('student.back_to_site')}
            </Link>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-surface-900/80 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 shrink-0 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-white/50 transition-all" onClick={() => setSidebarOpen(true)}>
                <HiMenu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-icc-400 to-icc-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-icc-400 font-medium">Student</p>
                </div>
              </div>
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
                title={t('student.logout')}
              >
                <HiLogout className="w-4 h-4" />
                <span className="hidden sm:inline">{t('student.logout')}</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </BackgroundLayout>
  );
}
