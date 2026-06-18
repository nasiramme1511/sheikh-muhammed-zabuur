import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  HiHome, HiUserGroup, HiUsers, HiMenu, HiX,
  HiChevronLeft, HiBell, HiSearch, HiSun, HiMoon, HiLogout,
  HiLibrary, HiMusicNote, HiVideoCamera, HiCollection,
  HiChevronDown, HiCog, HiPhotograph, HiCalendar, HiClock,
  HiMicrophone, HiMenuAlt2,
} from 'react-icons/hi';
import { Radio, FileText, Settings, Upload, Palette, Layout, Image, UserCheck, Activity, DownloadCloud, Bell, Megaphone, Newspaper, BarChart3, Database, Shield, Navigation, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import type { TranslationKey } from '../i18n';
import BackgroundLayout from './BackgroundLayout';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scrollLock';

interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: any;
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
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
    items: [
      { href: '/admin/audio', labelKey: 'admin.audio_lectures', icon: HiMusicNote },
      { href: '/admin/videos', labelKey: 'admin.video_lectures', icon: HiVideoCamera },
      { href: '/admin/pdfs', labelKey: 'admin.pdf_library', icon: FileText },
      { href: '/admin/gallery', labelKey: 'admin.images_gallery', icon: Image },
      { href: '/admin/recordings', labelKey: 'admin.recordings', icon: HiMicrophone },
      { href: '/admin/resources', labelKey: 'admin.resources', icon: HiLibrary },
    ],
  },
  {
    labelKey: 'admin.group_tools',
    items: [
      { href: '/admin/import', labelKey: 'admin.content_importer', icon: Upload },
      { href: '/admin/bulk-upload', labelKey: 'admin.bulk_upload', icon: Upload },
      { href: '/admin/media', labelKey: 'admin.media_library', icon: HiPhotograph },
      { href: '/admin/collections', labelKey: 'admin.collections', icon: HiCollection },
      { href: '/admin/categories', labelKey: 'admin.categories', icon: HiCollection },
      { href: '/admin/telegram', labelKey: 'admin.telegram', icon: Send },
    ],
  },
  {
    labelKey: 'admin.group_broadcast',
    items: [
      { href: '/admin/live', labelKey: 'admin.live_stream', icon: Radio },
      { href: '/admin/stream-schedule', labelKey: 'admin.stream_schedule', icon: HiCalendar },
      { href: '/admin/recording-archive', labelKey: 'admin.recording_archive', icon: HiClock },
    ],
  },
  {
    labelKey: 'admin.group_users',
    items: [
      { href: '/admin/users', labelKey: 'admin.users', icon: HiUsers },
      { href: '/admin/roles', labelKey: 'admin.roles', icon: UserCheck },
      { href: '/admin/permissions', labelKey: 'admin.permissions', icon: Shield },
    ],
  },
  {
    labelKey: 'admin.group_website',
    items: [
      { href: '/admin/homepage', labelKey: 'admin.homepage', icon: Layout },
      { href: '/admin/appearance', labelKey: 'admin.appearance', icon: Palette },
      { href: '/admin/navigation', labelKey: 'admin.navigation', icon: Navigation },
      { href: '/admin/footer', labelKey: 'admin.footer', icon: FileText },
    ],
  },
  {
    labelKey: 'admin.group_communication',
    items: [
      { href: '/admin/announcements', labelKey: 'admin.announcements', icon: Megaphone },
      { href: '/admin/notifications', labelKey: 'admin.notifications', icon: Bell },
      { href: '/admin/newsletter', labelKey: 'admin.newsletter', icon: Newspaper },
    ],
  },
  {
    labelKey: 'admin.group_analytics',
    items: [
      { href: '/admin/analytics', labelKey: 'admin.content_analytics', icon: BarChart3 },
      { href: '/admin/user-analytics', labelKey: 'admin.user_analytics', icon: HiUserGroup },
      { href: '/admin/download-reports', labelKey: 'admin.download_reports', icon: DownloadCloud },
    ],
  },
  {
    labelKey: 'admin.group_system',
    items: [
      { href: '/admin/settings', labelKey: 'admin.settings', icon: HiCog },
      { href: '/admin/backup', labelKey: 'admin.backup', icon: Database },
      { href: '/admin/activity', labelKey: 'admin.activity_logs', icon: Activity },
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
  const { mode, toggle } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => { initial[g.labelKey] = g.defaultOpen ?? true; });
    return initial;
  });

  const breadcrumbs = getBreadcrumbs(location.pathname, t);
  const currentGroup = getCurrentGroup(location.pathname);

  const toggleGroup = (key: string) => setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when sidebar drawer is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
    return () => {
      unlockBodyScroll();
    };
  }, [sidebarOpen]);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-surface-950 px-4">
        <div className="text-center p-6 sm:p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <HiUsers className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-white/60 text-base sm:text-lg font-medium">{t('admin.denied')}</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-400 text-white text-sm font-semibold transition-all shadow-lg shadow-icc-500/20 min-h-[44px]">
            {t('admin.go_home')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <BackgroundLayout>
      <div className="flex h-[100dvh] overflow-hidden">
        {/* ── Overlay (mobile only) ── */}
        <div
          className={`
            fixed inset-0 z-40 bg-black/60 backdrop-blur-sm
            transition-opacity duration-300
            lg:hidden
            ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `}
          onClick={closeSidebar}
          aria-hidden="true"
        />

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed inset-y-0 start-0 z-50 w-[272px] max-w-[85vw]
            transform transition-all duration-300 ease-in-out will-change-transform
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}
            lg:translate-x-0 lg:rtl:translate-x-0
            lg:static lg:inset-auto lg:max-w-none
            ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
            bg-surface-900/95 backdrop-blur-2xl border-e border-white/5
            flex flex-col
          `}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 border-b border-white/5 shrink-0">
            <Link to="/admin" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-icc-500 to-icc-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-icc-500/20 shrink-0">
                S
              </div>
              <div className={`min-w-0 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <span className="text-sm font-bold text-white block leading-tight truncate">{t('admin.panel')}</span>
                <span className="text-[9px] text-white/40 block leading-tight truncate">Sheikh Mohammed Zabuur</span>
              </div>
            </Link>
            <div className="flex items-center gap-1">
              <button
                className="hidden lg:flex p-2 rounded-xl hover:bg-white/5 text-white/50 transition-all min-h-[44px] min-w-[44px] items-center justify-center"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <HiMenuAlt2 className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
              </button>
              <button
                className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-white/50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={closeSidebar}
                aria-label="Close sidebar"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className={`px-3 pt-3 shrink-0 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
            <div className="relative">
              <HiSearch className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder={t('admin.search_placeholder')}
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full ps-9 pe-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all min-h-[44px]"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scroll-hidden overscroll-contain">
            {navGroups.map((group) => {
              const isActiveGroup = currentGroup === group.labelKey;
              const isExpanded = expandedGroups[group.labelKey];
              const hasLabel = group.labelKey.length > 0;

              const filteredItems = globalSearch
                ? group.items.filter((item) => t(item.labelKey).toLowerCase().includes(globalSearch.toLowerCase()))
                : group.items;

              if (filteredItems.length === 0) return null;

              return (
                <div key={group.labelKey || '__dashboard'} className="py-0.5">
                  {hasLabel && (
                    <button
                      onClick={() => toggleGroup(group.labelKey)}
                      className={`flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all min-h-[36px] ${
                        isActiveGroup
                          ? 'text-icc-400'
                          : 'text-white/40 hover:text-white/60'
                      } ${sidebarCollapsed ? 'lg:hidden' : ''}`}
                    >
                      <span className="truncate">{t(group.labelKey as TranslationKey)}</span>
                      <HiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ms-2 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                    </button>
                  )}
                  <div className={`space-y-0.5 overflow-hidden transition-all duration-200 ${isExpanded || !hasLabel ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {filteredItems.map((item) => {
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
                          title={sidebarCollapsed ? t(item.labelKey) : undefined}
                        >
                          <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-icc-400' : ''}`} />
                          <span className={`truncate ${sidebarCollapsed ? 'lg:sr-only' : ''}`}>{t(item.labelKey)}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-white/5 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white/60 hover:bg-white/5 transition-all min-h-[44px]"
            >
              <HiChevronLeft className="w-4 h-4 rtl:rotate-180" />
              {t('admin.back_to_site')}
            </Link>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Header */}
          <header className="h-14 sm:h-16 bg-surface-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-3 sm:px-4 lg:px-6 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-white/50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <HiMenu className="w-5 h-5" />
              </button>
              <nav className="hidden sm:flex items-center gap-1.5 text-sm min-w-0 overflow-hidden">
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
                    {i > 0 && <span className="text-white/20 shrink-0">/</span>}
                    <Link
                      to={crumb.href}
                      className={`truncate ${
                        i === breadcrumbs.length - 1
                          ? 'text-white font-semibold'
                          : 'text-white/50 hover:text-white/70 transition-colors'
                      }`}
                    >
                      {crumb.label}
                    </Link>
                  </span>
                ))}
              </nav>
              <span className="sm:hidden text-sm font-semibold text-white truncate">
                {breadcrumbs[breadcrumbs.length - 1]?.label}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Link to="/admin/notifications" className="p-2 rounded-xl hover:bg-white/5 text-white/50 transition-all relative min-h-[44px] min-w-[44px] flex items-center justify-center">
                <HiBell className="w-5 h-5" />
              </Link>
              <button
                onClick={toggle}
                className="p-2 rounded-xl hover:bg-white/5 text-white/50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={t('nav.toggle_dark')}
              >
                {mode === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-1 sm:gap-2 ps-1 sm:ps-2 border-s border-white/5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-icc-400 to-icc-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-icc-500/20 shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="hidden lg:block min-w-0">
                  <p className="text-sm font-medium text-white leading-tight truncate max-w-[140px]">{user.name}</p>
                  <p className="text-xs text-white/40 truncate max-w-[140px]">{user.email}</p>
                </div>
                <button onClick={logout} className="p-1.5 rounded-xl hover:bg-white/5 text-white/40 hover:text-red-400 transition-all ms-1 min-h-[44px] min-w-[44px] flex items-center justify-center" title={t('admin.logout')}>
                  <HiLogout className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
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
