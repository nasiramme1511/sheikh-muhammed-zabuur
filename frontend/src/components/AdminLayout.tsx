import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  HiHome, HiMenu, HiX,
  HiChevronLeft, HiBell, HiLogout,
  HiMusicNote, HiVideoCamera, HiCog,
} from 'react-icons/hi';
import {
  Radio, FileText, Layout, User, Settings, Send, Megaphone,
  Library, Globe,
} from 'lucide-react';
import SmartThemeToggle from './SmartThemeToggle';
import SmartLanguageSwitcher from './SmartLanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import type { TranslationKey } from '../i18n';
import BackgroundLayout from './BackgroundLayout';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scrollLock';

interface NavItem {
  href: string;
  labelKey: string;
  icon: any;
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
  icon?: any;
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    labelKey: '',
    items: [
      { href: '/admin', labelKey: 'admin.dashboard', icon: HiHome },
    ],
  },
  {
    labelKey: 'admin.group_content',
    icon: Library,
    items: [
      { href: '/admin/series', labelKey: 'admin.study_series', icon: Library },
      { href: '/admin/audio', labelKey: 'admin.audio_lessons', icon: HiMusicNote },
      { href: '/admin/videos', labelKey: 'admin.video_lessons', icon: HiVideoCamera },
      { href: '/admin/pdfs', labelKey: 'admin.pdf_library', icon: FileText },
    ],
  },
  {
    labelKey: 'admin.group_live',
    icon: Radio,
    items: [
      { href: '/admin/live', labelKey: 'admin.live_broadcasts', icon: Radio },
      { href: '/admin/stream-schedule', labelKey: 'admin.live_schedule', icon: Settings },
    ],
  },
  {
    labelKey: 'admin.group_community',
    icon: Send,
    items: [
      { href: '/admin/telegram', labelKey: 'admin.telegram_channels', icon: Send },
      { href: '/admin/announcements', labelKey: 'admin.announcements', icon: Megaphone },
    ],
  },
  {
    labelKey: 'admin.group_website',
    icon: Layout,
    items: [
      { href: '/admin/homepage', labelKey: 'admin.homepage', icon: Layout },
      { href: '/admin/scholar', labelKey: 'admin.biography', icon: User },
      { href: '/admin/media', labelKey: 'admin.media_gallery', icon: HiMusicNote },
      { href: '/admin/site-settings', labelKey: 'admin.site_settings', icon: HiCog },
      { href: '/admin/seo', labelKey: 'admin.seo_settings', icon: Globe },
    ],
  },
];

function getBreadcrumbs(pathname: string, t: (key: any) => string) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 1 && parts[0] === 'admin') return [{ label: t('admin.dashboard'), href: '/admin' }];
  const crumbs = [{ label: t('admin.dashboard'), href: '/admin' }];
  for (let i = 1; i < parts.length; i++) {
    const segment = parts[i];
    const key = `admin.${segment}`;
    const label = t(key) || segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({ label, href: '/' + parts.slice(0, i + 1).join('/') });
  }
  return crumbs;
}

function getCurrentGroup(pathname: string): string {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)) {
        return group.labelKey;
      }
    }
  }
  return '';
}

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => { initial[g.labelKey] = g.labelKey ? false : true; });
    return initial;
  });

  const breadcrumbs = getBreadcrumbs(location.pathname, t);
  const currentGroup = getCurrentGroup(location.pathname);

  const toggleGroup = (key: string) => setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    const key = currentGroup || '';
    if (key && !expandedGroups[key]) {
      setExpandedGroups((prev) => ({ ...prev, [key]: true }));
    }
  }, [currentGroup]);

  useEffect(() => {
    if (sidebarOpen) { lockBodyScroll(); } else { unlockBodyScroll(); }
    return () => { unlockBodyScroll(); };
  }, [sidebarOpen]);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-surface-950 px-4">
        <div className="text-center p-6 sm:p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <HiHome className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-white/60 text-base sm:text-lg font-medium">{t('admin.denied')}</p>
          <Link to="/" className="btn-icc inline-block mt-4">{t('admin.go_home')}</Link>
        </div>
      </div>
    );
  }

  return (
    <BackgroundLayout>
      <div className="flex h-[100dvh] overflow-hidden">
        <div
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
            sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={closeSidebar}
          aria-hidden="true"
        />

        <aside
          className={`fixed inset-y-0 start-0 z-50 w-[272px] max-w-[85vw] transform transition-all duration-300 ease-in-out will-change-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
          } lg:translate-x-0 lg:rtl:translate-x-0 lg:static lg:inset-auto lg:w-64 bg-surface-900/95 backdrop-blur-2xl border-e border-white/5 flex flex-col`}
        >
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 border-b border-white/5 shrink-0">
            <Link to="/admin" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-icc-500 to-icc-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-icc-500/20 shrink-0">
                S
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold text-white block leading-tight truncate">{t('admin.panel')}</span>
                <span className="text-[9px] text-white/40 block leading-tight truncate">Sheikh Mohammed Zabuur</span>
              </div>
            </Link>
            <button className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-white/50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center" onClick={closeSidebar}>
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scroll-hidden overscroll-contain">
            {navGroups.map((group) => {
              const isActiveGroup = currentGroup === group.labelKey;
              const isExpanded = expandedGroups[group.labelKey];
              const hasLabel = group.labelKey.length > 0;

              return (
                <div key={group.labelKey || '__dashboard'} className="py-0.5">
                  {hasLabel && (
                    <button
                      onClick={() => toggleGroup(group.labelKey)}
                      className={`flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all min-h-[36px] ${
                        isActiveGroup ? 'text-icc-400' : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {group.icon && <group.icon className="w-3.5 h-3.5" />}
                        {t(group.labelKey as TranslationKey)}
                      </span>
                    </button>
                  )}
                  <div className={`space-y-0.5 overflow-hidden transition-all duration-200 ${isExpanded || !hasLabel ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {group.items.map((item) => {
                      const isActive = item.href === '/admin'
                        ? location.pathname === '/admin'
                        : location.pathname.startsWith(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={closeSidebar}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] ${
                            isActive
                              ? 'bg-icc-500/10 text-icc-400 border border-icc-500/20 shadow-sm'
                              : 'text-white/50 hover:bg-white/5 hover:text-white/80 border border-transparent'
                          }`}
                        >
                          <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-icc-400' : ''}`} />
                          <span className="truncate">{t(item.labelKey as TranslationKey)}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="p-3 border-t border-white/5 shrink-0">
            <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white/60 hover:bg-white/5 transition-all min-h-[44px]">
              <HiChevronLeft className="w-4 h-4 rtl:rotate-180" />
              {t('admin.back_to_site')}
            </Link>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 w-full">
          <header className="h-14 sm:h-16 bg-surface-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-3 sm:px-4 lg:px-6 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-white/50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0" onClick={() => setSidebarOpen(true)}>
                <HiMenu className="w-5 h-5" />
              </button>
              <nav className="hidden sm:flex items-center gap-1.5 text-sm min-w-0 overflow-hidden">
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
                    {i > 0 && <span className="text-white/20 shrink-0">/</span>}
                    <Link to={crumb.href} className={`truncate ${i === breadcrumbs.length - 1 ? 'text-white font-semibold' : 'text-white/50 hover:text-white/70 transition-colors'}`}>
                      {crumb.label}
                    </Link>
                  </span>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <SmartLanguageSwitcher />
              <SmartThemeToggle />
              <button onClick={logout} className="p-1.5 rounded-xl hover:bg-white/5 text-white/40 hover:text-red-400 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center" title={t('admin.logout')}>
                <HiLogout className="w-4 h-4" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 lg:p-6 w-full min-w-0">
            <div className="w-full min-w-0 overflow-hidden">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </BackgroundLayout>
  );
}
