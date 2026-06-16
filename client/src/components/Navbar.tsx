import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Search, User, LogOut, Home, Music, Video, FileText,
  Radio, Tv, Info, Mail, Bot, Command, Bell, Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAIChat } from '../context/AIChatContext';
import { useTranslation } from '../i18n';
import SmartThemeToggle from './SmartThemeToggle';
import SmartLanguageSwitcher from './SmartLanguageSwitcher';
import CommandPalette from './CommandPalette';
import api from '../lib/api';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { openChat } = useAIChat();

  const NAV_LINKS = (user ? [
    { label: t('nav.home'),            href: '/',            icon: Home },
    { label: t('nav.audio_lectures'),  href: '/audio',       icon: Music },
    { label: t('nav.video_lectures'),  href: '/videos',      icon: Video },
    { label: t('nav.pdf_library'),     href: '/pdfs',        icon: FileText },
    { label: t('nav.live_stream'),     href: '/live',        icon: Radio, live: true },
    { label: t('nav.recordings'),      href: '/recordings',  icon: Tv },
    { label: t('nav.about_shaykh'),    href: '/about',       icon: Info },
    { label: t('nav.contact'),         href: '/contact',     icon: Mail },
  ] : [
    { label: t('nav.home'),            href: '/',            icon: Home },
    { label: t('nav.about_shaykh'),    href: '/about',       icon: Info },
    { label: t('nav.contact'),         href: '/contact',     icon: Mail },
  ]);
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

  // Check live status
  useEffect(() => {
    api.get('/live').then(res => {
      setIsLive(!!res.data?.isActive);
    }).catch(() => {});
    const interval = setInterval(() => {
      api.get('/live').then(res => setIsLive(!!res.data?.isActive)).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
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

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadNotifications(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === 'Escape') setCommandOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setShowNotifications(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <a
        href="#main-content"
        className="fixed top-0 left-0 z-[10000] px-4 py-2 bg-emerald-500 text-white font-medium rounded-br-lg -translate-y-full focus:translate-y-0 transition-transform duration-200 text-sm"
      >
        {t('nav.skip_to_content')}
      </a>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'nav-blur shadow-2xl shadow-dark-900/50' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center justify-between h-16 md:h-20" role="navigation" aria-label="Main navigation">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group z-10" aria-label={t('hero.title_line1') + ' ' + t('hero.title_line2')}>
              <div className="relative shrink-0">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden ring-2 ring-emerald-500/30 group-hover:ring-emerald-500/60 transition-all duration-300">
                  <img
                    src="/images/sheikh-zabuur.jpg"
                    alt="Sheikh Mohammed Zabuur"
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                    loading="eager"
                  />
                </div>
                <div className="absolute -inset-1.5 rounded-full bg-emerald-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="hidden sm:block">
                <span className="block text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                  Sheikh Mohammed Zabuur
                </span>
                <span className="block text-[10px] text-white/40 leading-tight tracking-wider uppercase">
                  {t('home.platform_name')}
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`nav-link-icc relative flex items-center gap-1.5 ${active ? 'active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {link.live && isLive && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 z-10">
              <button
                onClick={openChat}
                className="hidden md:flex items-center gap-1.5 h-9 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all text-xs text-emerald-400 font-medium"
                aria-label={t('nav.ask_ai')}
              >
                <Bot className="w-3.5 h-3.5" />
                {t('nav.ask_ai')}
              </button>

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
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all relative"
                      aria-label={t('settings.notifications')}
                    >
                      <Bell className="w-4 h-4 text-white/70" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                      )}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-dark-800 rounded-xl shadow-2xl border border-white/10 z-50 max-h-96 overflow-y-auto">
                        <div className="p-3 border-b border-white/5 flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{t('settings.notifications')}</span>
                          {unreadNotifications > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-emerald-400 hover:text-emerald-300">
                              {t('nav.mark_all_read')}
                            </button>
                          )}
                        </div>
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-white/40">{t('nav.no_notifications')}</div>
                        ) : (
                          notifications.slice(0, 20).map(n => (
                            <div key={n.id} className={`px-3 py-2.5 border-b border-white/5 text-sm ${n.read ? '' : 'bg-emerald-500/5'}`}>
                              <p className={`text-sm ${n.read ? 'text-white/50' : 'text-white font-medium'}`}>{n.title}</p>
                              <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{n.body}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Profile dropdown */}
                  <div className="relative group">
                    <button
                      className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
                      aria-label={t('nav.mobile_profile')}
                    >
                      <span className="text-sm font-bold text-emerald-400">{user.name.charAt(0)}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-xl shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="p-3 border-b border-white/5">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-white/40">{user.email}</p>
                      </div>
                      {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                        <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/5 transition-colors">
                          <User className="w-4 h-4" /> {t('admin.panel')}
                        </Link>
                      )}
                      <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-4 h-4" /> {t('auth.sign_out')}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
                    {t('nav.sign_in')}
                  </Link>
                  <Link to="/register" className="btn-icc text-sm px-4 py-2">
                    {t('nav.register')}
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
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

        {/* Search bar dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-t border-white/5 bg-dark-800/95 backdrop-blur-xl"
              role="search"
            >
              <div className="max-w-7xl mx-auto px-4 py-4">
                <form onSubmit={handleSearch} className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('nav.search_placeholder')}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
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

      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-dark-900/95 backdrop-blur-xl" onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-72 bg-dark-800 border-l border-white/5 overflow-y-auto"
              role="dialog"
              aria-label={t('nav.toggle_menu')}
            >
              <div className="p-4 pt-20">
                {/* Auth buttons for mobile */}
                {!user && (
                  <div className="flex gap-2 mb-6">
                    <Link
                      to="/login"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white text-sm font-medium text-center hover:bg-white/5 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('nav.sign_in')}
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium text-center hover:bg-emerald-600 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('nav.register')}
                    </Link>
                  </div>
                )}

                {/* Live indicator + AI button */}
                <div className="mb-4 space-y-2">
                  {isLive && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      {t('nav.live_now_join')}
                    </div>
                  )}
                  <button
                    onClick={() => { openChat(); setMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  >
                    <Bot className="w-4 h-4" />
                    {t('nav.ai_islamic_assistant')}
                  </button>
                </div>

                {/* Nav links */}
                <div className="space-y-1">
                  {NAV_LINKS.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                          active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {link.label}
                        {link.live && isLive && (
                          <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] bg-red-500 text-white font-bold uppercase">
                            {t('nav.live_badge')}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Admin link if applicable */}
                {user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/5 transition-all"
                    >
                      <User className="w-4 h-4" /> {t('admin.panel')}
                    </Link>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
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
