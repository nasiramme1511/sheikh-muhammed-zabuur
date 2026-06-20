import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Search, User, LogOut, Home as HomeIcon,
  Radio, Info, Mail, Command, Bell,
  BookOpen, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import ResponsiveScholarImage from './ResponsiveScholarImage';
import SmartThemeToggle from './SmartThemeToggle';
import SmartLanguageSwitcher from './SmartLanguageSwitcher';
import CommandPalette from './CommandPalette';
import api from '../lib/api';

function SendIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

interface TelegramChannel {
  id: number;
  name: string;
  link?: string;
  description?: string;
}

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [telegramChannels, setTelegramChannels] = useState<TelegramChannel[]>([]);
  const telegramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/live').then(res => setIsLive(!!res.data?.isActive)).catch(() => {});
    const interval = setInterval(() => {
      api.get('/live').then(res => setIsLive(!!res.data?.isActive)).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api.get('/telegram').then(res => {
      setTelegramChannels(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
        setUnreadNotifications(res.data.filter((n: any) => !n.read).length);
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCommandOpen(true); }
      if (e.key === 'Escape') setCommandOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setMenuOpen(false); setSearchOpen(false); setShowNotifications(false); setTelegramOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (telegramRef.current && !telegramRef.current.contains(e.target as Node)) {
        setTelegramOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false); setSearchQuery(''); setMenuOpen(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const navLinks = [
    { label: t('nav.home'), href: '/', icon: HomeIcon },
    { label: t('nav.about_sheikh'), href: '/about', icon: Info },
    { label: t('nav.live_stream'), href: '/live', icon: Radio, live: true },
    { label: t('nav.series'), href: '/series', icon: BookOpen },
    { label: t('nav.contact'), href: '/contact', icon: Mail },
  ] as const;

  return (
    <>
      <a href="#main-content" className="skip-link">{t('nav.skip_to_content')}</a>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'nav-blur shadow-2xl shadow-surface-950/50' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 md:h-20" role="navigation" aria-label={t('nav.main_navigation')}>
            <Link to="/" className="flex items-center gap-3 group z-10" aria-label={t('hero.title_line1') + ' ' + t('hero.title_line2')}>
              <div className="relative shrink-0">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl overflow-hidden ring-2 ring-icc-500/30 group-hover:ring-icc-500/60 transition-all duration-300">
                  <ResponsiveScholarImage
                    src="/images/sheikh-zabuur.jpg"
                    alt={t('app.title')}
                    className="w-full h-full transition-all duration-300 group-hover:scale-110"
                    loading="eager"
                  />
                </div>
                <div className="absolute -inset-1.5 rounded-xl bg-icc-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="hidden sm:block">
                <span className="block text-sm font-bold text-white group-hover:text-icc-400 transition-colors leading-tight">
                  Sheikh Mohammed Zabuur
                </span>
                <span className="block text-[10px] text-white/40 leading-tight tracking-wider uppercase">
                  {t('home.platform_name')}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`nav-link-icc flex items-center gap-1.5 ${active ? 'active' : ''}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                    {(link as any).live && isLive && (
                      <span className="ml-1 px-1 py-0.5 rounded text-[8px] bg-red-500 text-white font-bold uppercase">
                        LIVE
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Telegram Dropdown */}
              <div className="relative" ref={telegramRef}>
                <button
                  onClick={() => setTelegramOpen(!telegramOpen)}
                  className={`nav-link-icc flex items-center gap-1.5 ${telegramOpen ? 'active' : ''}`}
                  aria-expanded={telegramOpen}
                >
                  <SendIcon className="w-3.5 h-3.5" />
                  Telegram
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${telegramOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {telegramOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-1 w-72 bg-surface-900/98 backdrop-blur-xl rounded-2xl shadow-modal border border-white/10 overflow-hidden"
                    >
                      <div className="p-2">
                        {telegramChannels.length === 0 ? (
                          <a
                            href="https://t.me/sheikhmohammedzabuur"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-icc-500/10 flex items-center justify-center shrink-0">
                              <SendIcon className="w-4 h-4 text-icc-400" />
                            </div>
                            <span className="text-sm font-medium text-white">@sheikhmohammedzabuur</span>
                          </a>
                        ) : (
                          telegramChannels.map((ch) => (
                            <a
                              key={ch.id}
                              href={ch.link || `https://t.me/sheikhmohammedzabuur`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-icc-500/10 flex items-center justify-center shrink-0">
                                <SendIcon className="w-4 h-4 text-icc-400" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-white">{ch.name}</span>
                                {ch.description && (
                                  <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1">{ch.description}</p>
                                )}
                              </div>
                            </a>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2 z-10">
              <button
                onClick={() => setCommandOpen(true)}
                className="hidden md:flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs text-white/40"
                aria-label={t('nav.command_palette')}
              >
                <Command className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{t('nav.ctrl_k')}</span>
              </button>

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                aria-label={t('nav.search_label')}
              >
                <Search className="w-4 h-4 text-white/70" />
              </button>

              <SmartLanguageSwitcher />
              <SmartThemeToggle />

              {user ? (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all relative"
                      aria-label={t('settings.notifications')}
                    >
                      <Bell className="w-4 h-4 text-white/70" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center shadow-lg">
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                      )}
                    </button>
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          className="absolute right-0 mt-2 w-80 bg-surface-900 rounded-2xl shadow-modal border border-white/10 z-50 max-h-96 overflow-y-auto"
                        >
                          <div className="p-3 border-b border-white/5 flex items-center justify-between">
                            <span className="text-sm font-medium text-white">{t('settings.notifications')}</span>
                            {unreadNotifications > 0 && (
                              <button onClick={() => {}} className="text-xs text-icc-400 hover:text-icc-300 transition-colors">
                                {t('nav.mark_all_read')}
                              </button>
                            )}
                          </div>
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-white/40">{t('nav.no_notifications')}</div>
                          ) : (
                            notifications.slice(0, 20).map(n => (
                              <div key={n.id} className={`px-3 py-2.5 border-b border-white/5 text-sm ${n.read ? '' : 'bg-icc-500/5'}`}>
                                <p className={`text-sm ${n.read ? 'text-white/50' : 'text-white font-medium'}`}>{n.title}</p>
                                <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{n.body}</p>
                              </div>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative group">
                    <button
                      className="w-9 h-9 rounded-xl bg-icc-500/20 border border-icc-500/30 flex items-center justify-center hover:bg-icc-500/30 transition-all"
                      aria-label={t('nav.mobile_profile')}
                    >
                      <span className="text-sm font-bold text-icc-400">{user.name.charAt(0)}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-surface-900 rounded-2xl shadow-modal border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                      <div className="p-3 border-b border-white/5">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-white/40">{user.email}</p>
                      </div>
                      <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 transition-colors">
                        <User className="w-4 h-4" /> {t('nav.dashboard')}
                      </Link>
                      {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                        <Link to="/admin" className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 transition-colors">
                          <Command className="w-4 h-4" /> {t('admin.panel')}
                        </Link>
                      )}
                      <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5">
                        <LogOut className="w-4 h-4" /> {t('auth.sign_out')}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
                    {t('nav.sign_in')}
                  </Link>
                  <Link to="/register" className="btn-icc text-sm px-4 py-2">
                    {t('nav.register')}
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                aria-label={t('nav.toggle_menu')}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
            </div>
          </nav>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-t border-white/5 bg-surface-950/95 backdrop-blur-xl"
              role="search"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <form onSubmit={handleSearch} className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('nav.search_placeholder')}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all text-sm"
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="btn-icc px-6 py-3">
                    {t('nav.search_label')}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-surface-950/98 backdrop-blur-2xl" onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-surface-900 border-l border-white/5 overflow-y-auto"
              role="dialog"
              aria-label={t('nav.toggle_menu')}
            >
              <div className="p-6 pt-24">
                {!user && (
                  <div className="flex gap-2 mb-8">
                    <Link
                      to="/login"
                      className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white text-sm font-medium text-center hover:bg-white/5 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('nav.sign_in')}
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 px-4 py-3 rounded-xl bg-icc-500 text-white text-sm font-medium text-center hover:bg-icc-600 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('nav.register')}
                    </Link>
                  </div>
                )}

                <div className="mb-6">
                  {isLive && (
                    <Link
                      to="/live"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold mb-3"
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      </span>
                      {t('nav.live_now_join')}
                    </Link>
                  )}
                </div>

                {/* Main Navigation */}
                <div className="space-y-1 mb-6">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-4 mb-2">
                    {t('nav.main_navigation')}
                  </p>
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                          active
                            ? 'bg-icc-500/10 text-icc-400 border border-icc-500/20'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          <Icon className={`w-4 h-4 ${active ? 'text-icc-400' : 'text-white/40'}`} />
                        </div>
                        <span className="font-medium">{link.label}</span>
                        {(link as any).live && isLive && (
                          <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] bg-red-500 text-white font-bold uppercase">
                            LIVE
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Telegram Channels */}
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-4 mb-2">
                    Telegram
                  </p>
                  <div className="space-y-1">
                    {telegramChannels.length === 0 ? (
                      <a
                        href="https://t.me/sheikhmohammedzabuur"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          <SendIcon className="w-4 h-4 text-white/40" />
                        </div>
                        <span className="font-medium">@sheikhmohammedzabuur</span>
                      </a>
                    ) : (
                      telegramChannels.map((ch) => (
                        <a
                          key={ch.id}
                          href={ch.link || `https://t.me/sheikhmohammedzabuur`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                            <SendIcon className="w-4 h-4 text-white/40" />
                          </div>
                          <div>
                            <span className="font-medium">{ch.name}</span>
                            {ch.description && (
                              <p className="text-[10px] text-white/40 mt-0.5">{ch.description}</p>
                            )}
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                </div>

                {user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <div className="mt-8 pt-6 border-t border-white/5 space-y-1">
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/5 transition-all"
                    >
                      <Command className="w-4 h-4" /> {t('admin.panel')}
                    </Link>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> {t('auth.sign_out')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
