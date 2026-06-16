import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  HiHome, HiUserGroup, HiUsers, HiMenu, HiX,
  HiChevronLeft, HiBell, HiSearch, HiSun, HiMoon, HiLogout,
  HiLibrary, HiMusicNote, HiVideoCamera, HiCollection,
  HiChevronDown, HiCog, HiPhotograph, HiCalendar, HiClock,
  HiMicrophone, HiPencil,
} from 'react-icons/hi';
import { Radio, FileText, Settings, Upload, Palette, Layout, Image, UserCheck, Activity, DownloadCloud, Bell, Megaphone, Newspaper, BarChart3, Database, Shield, Navigation, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation, TranslationKey } from '../i18n';
import BackgroundLayout from './BackgroundLayout';

interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: any;
  customIcon?: boolean;
}

interface NavGroup {
  labelKey: TranslationKey;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    labelKey: '' as TranslationKey,
    items: [
      { href: '/admin', labelKey: 'admin.dashboard', icon: HiHome },
    ],
  },
  {
    labelKey: 'admin.group_content',
    items: [
      { href: '/admin/audio', labelKey: 'admin.audio_lectures', icon: HiMusicNote },
      { href: '/admin/videos', labelKey: 'admin.video_lectures', icon: HiVideoCamera },
      { href: '/admin/pdfs', labelKey: 'admin.pdf_library', icon: FileText, customIcon: true },
      { href: '/admin/gallery', labelKey: 'admin.images_gallery', icon: Image, customIcon: true },
      { href: '/admin/recordings', labelKey: 'admin.recordings', icon: HiMicrophone },
      { href: '/admin/resources', labelKey: 'admin.resources', icon: HiLibrary },
    ],
  },
  {
    labelKey: 'admin.group_tools',
    items: [
      { href: '/admin/import', labelKey: 'admin.content_importer', icon: Upload, customIcon: true },
      { href: '/admin/bulk-upload', labelKey: 'admin.bulk_upload', icon: Upload, customIcon: true },
      { href: '/admin/media', labelKey: 'admin.media_library', icon: HiPhotograph },
      { href: '/admin/collections', labelKey: 'admin.collections', icon: HiCollection },
      { href: '/admin/categories', labelKey: 'admin.categories', icon: HiCollection },
      { href: '/admin/telegram', labelKey: 'admin.telegram', icon: Send, customIcon: true },
    ],
  },
  {
    labelKey: 'admin.group_broadcast',
    items: [
      { href: '/admin/live', labelKey: 'admin.live_stream', icon: Radio, customIcon: true },
      { href: '/admin/stream-schedule', labelKey: 'admin.stream_schedule', icon: HiCalendar },
      { href: '/admin/recording-archive', labelKey: 'admin.recording_archive', icon: HiClock },
    ],
  },
  {
    labelKey: 'admin.group_users',
    items: [
      { href: '/admin/users', labelKey: 'admin.users', icon: HiUsers },
      { href: '/admin/roles', labelKey: 'admin.roles', icon: UserCheck, customIcon: true },
      { href: '/admin/permissions', labelKey: 'admin.permissions', icon: Shield, customIcon: true },
    ],
  },
  {
    labelKey: 'admin.group_website',
    items: [
      { href: '/admin/homepage', labelKey: 'admin.homepage', icon: Layout, customIcon: true },
      { href: '/admin/appearance', labelKey: 'admin.appearance', icon: Palette, customIcon: true },
      { href: '/admin/navigation', labelKey: 'admin.navigation', icon: Navigation, customIcon: true },
      { href: '/admin/footer', labelKey: 'admin.footer', icon: HiPencil },
    ],
  },
  {
    labelKey: 'admin.group_communication',
    items: [
      { href: '/admin/announcements', labelKey: 'admin.announcements', icon: Megaphone, customIcon: true },
      { href: '/admin/notifications', labelKey: 'admin.notifications', icon: Bell, customIcon: true },
      { href: '/admin/newsletter', labelKey: 'admin.newsletter', icon: Newspaper, customIcon: true },
    ],
  },
  {
    labelKey: 'admin.group_analytics',
    items: [
      { href: '/admin/analytics', labelKey: 'admin.content_analytics', icon: BarChart3, customIcon: true },
      { href: '/admin/user-analytics', labelKey: 'admin.user_analytics', icon: HiUserGroup },
      { href: '/admin/download-reports', labelKey: 'admin.download_reports', icon: DownloadCloud, customIcon: true },
    ],
  },
  {
    labelKey: 'admin.group_system',
    items: [
      { href: '/admin/settings', labelKey: 'admin.settings', icon: HiCog },
      { href: '/admin/backup', labelKey: 'admin.backup', icon: Database, customIcon: true },
      { href: '/admin/activity', labelKey: 'admin.activity_logs', icon: Activity, customIcon: true },
    ],
  },
];

function getBreadcrumbs(pathname: string, t: (key: any) => string) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 1 && parts[0] === 'admin') return [{ label: t('admin.dashboard'), href: '/admin' }];
  const crumbs = [{ label: t('admin.dashboard'), href: '/admin' }];
  for (let i = 1; i < parts.length; i++) {
    const segment = parts[i];
    const key = `admin.${segment}` as string;
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
  const [globalSearch, setGlobalSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      initial[g.labelKey] = g.defaultOpen ?? true;
    });
    return initial;
  });

  const breadcrumbs = getBreadcrumbs(location.pathname, t);
  const currentGroup = getCurrentGroup(location.pathname);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <HiUsers className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">{t('admin.denied')}</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all">
            {t('admin.go_home')}
          </Link>
        </div>
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
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          flex flex-col
        `}>
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                S
              </div>
              <div>
                <span className="text-sm font-bold text-gray-800 dark:text-white block leading-tight">{t('admin.panel')}</span>
                <span className="text-[9px] text-gray-400 dark:text-gray-500 block leading-tight">Sh. Mohammed Zabuur</span>
              </div>
            </Link>
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500" onClick={() => setSidebarOpen(false)}>
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Global Search */}
          <div className="px-3 pt-3 shrink-0">
            <div className="relative">
              <HiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.search_placeholder')}
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
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
                      className={`flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                        isActiveGroup
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                      }`}
                    >
                      <span>{t(group.labelKey)}</span>
                      <HiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                    </button>
                  )}
                  <div className={`space-y-0.5 overflow-hidden transition-all duration-200 ${isExpanded || !hasLabel ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {filteredItems.map((item) => {
                      const isActive = item.href === '/admin'
                        ? location.pathname === '/admin'
                        : location.pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${isActive
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                            }
                          `}
                        >
                          {item.customIcon ? (
                            <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-500' : ''}`} />
                          ) : (
                            <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-500' : ''}`} />
                          )}
                          {t(item.labelKey)}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Back to site */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <HiChevronLeft className="w-4 h-4" />
              {t('admin.back_to_site')}
            </Link>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6 shrink-0">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500" onClick={() => setSidebarOpen(true)}>
                <HiMenu className="w-5 h-5" />
              </button>

              {/* Breadcrumbs */}
              <nav className="hidden sm:flex items-center gap-1.5 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.href} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
                    <Link
                      to={crumb.href}
                      className={`${i === breadcrumbs.length - 1 ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      {crumb.label}
                    </Link>
                  </span>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications bell */}
              <Link to="/admin/notifications" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all relative">
                <HiBell className="w-5 h-5" />
              </Link>

              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all"
                aria-label={t('nav.toggle_dark')}
              >
                {mode === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
              </button>

              {/* Profile */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-800 dark:text-white leading-tight">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <button onClick={logout} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-all ml-1" title={t('admin.logout')}>
                  <HiLogout className="w-4 h-4" />
                </button>
              </div>
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
