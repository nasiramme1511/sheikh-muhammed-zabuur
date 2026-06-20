import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ChevronDown, Headphones, Video, BookOpen,
  Radio, Download, Users, Send, Calendar, Share2,
  User, Info, MapPin, Mail, Book, GraduationCap,
  LogOut, Command, Search, Sparkles, Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SmartThemeToggle from './SmartThemeToggle';
import SmartLanguageSwitcher from './SmartLanguageSwitcher';
import CommandPalette from './CommandPalette';
import api from '../lib/api';

const dropdownGroups = {
  learn: {
    label: 'Learn',
    items: [
      { icon: Headphones, label: 'Audio Library', href: '/audio' },
      { icon: Video, label: 'Video Library', href: '/videos' },
      { icon: BookOpen, label: 'Study Series', href: '/series' },
      { icon: Clock, label: 'Daily Lessons', href: '/series' },
      { icon: Radio, label: 'Recorded Lessons', href: '/recordings' },
      { icon: Download, label: 'Resources', href: '/resources' },
    ],
  },
  media: {
    label: 'Media',
    items: [
      { icon: Radio, label: 'Live Stream', href: '/live', live: true },
      { icon: Calendar, label: 'Broadcast Schedule', href: '/live' },
      { icon: Headphones, label: 'Lecture Archive', href: '/recordings' },
      { icon: Download, label: 'Downloads', href: '/resources' },
    ],
  },
  community: {
    label: 'Community',
    items: [
      { icon: Send, label: 'Telegram Channels', href: '/telegram' },
      { icon: Calendar, label: 'Events', href: '/about' },
      { icon: Sparkles, label: 'Announcements', href: '/about' },
      { icon: Share2, label: 'Share Platform', href: '/about' },
    ],
  },
  about: {
    label: 'About',
    items: [
      { icon: User, label: 'About Sheikh', href: '/about' },
      { icon: Book, label: 'Biography', href: '/about' },
      { icon: GraduationCap, label: 'Teaching Methodology', href: '/about' },
      { icon: Info, label: 'Learning Center', href: '/about' },
      { icon: Mail, label: 'Contact', href: '/contact' },
      { icon: MapPin, label: 'Location', href: '/about' },
    ],
  },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/live').then(res => setIsLive(!!res.data?.isActive)).catch(() => {});
    const interval = setInterval(() => {
      api.get('/live').then(res => setIsLive(!!res.data?.isActive)).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

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
    setMenuOpen(false); setActiveDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const dropdownAnimation = {
    initial: { opacity: 0, y: 8, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.96 },
    transition: { duration: 0.2 },
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'nav-blur shadow-2xl shadow-surface-950/50' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 md:h-20" role="navigation" aria-label="Main navigation">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group z-10" aria-label="Sheikh Mohammed Zabuur">
              <div className="relative shrink-0">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-all duration-300">
                  <span className="text-white font-bold text-xl font-arabic">ز</span>
                </div>
                <div className="absolute -inset-1.5 rounded-xl bg-green-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="hidden sm:block">
                <span className="block text-sm font-bold text-white group-hover:text-green-400 transition-colors leading-tight">
                  Sheikh Mohammed Zabuur
                </span>
                <span className="block text-[10px] text-white/40 leading-tight tracking-wider uppercase">
                  Authentic Islamic Lessons
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
              <Link to="/" className={`nav-link-icc ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>
                Home
              </Link>

              {/* Learn Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('learn')}
                  className={`nav-link-icc flex items-center gap-1 ${activeDropdown === 'learn' ? 'active' : ''}`}
                  aria-expanded={activeDropdown === 'learn'}
                >
                  Learn <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'learn' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'learn' && (
                    <motion.div {...dropdownAnimation} className="absolute top-full left-0 mt-1 w-56 bg-surface-900/98 backdrop-blur-xl rounded-2xl shadow-modal border border-white/10 overflow-hidden">
                      <div className="p-2">
                        {dropdownGroups.learn.items.map((item) => (
                          <Link key={item.href + item.label} to={item.href} onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                              <item.icon className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-sm font-medium text-white">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Media Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('media')}
                  className={`nav-link-icc flex items-center gap-1 ${activeDropdown === 'media' ? 'active' : ''}`}
                  aria-expanded={activeDropdown === 'media'}
                >
                  Media <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'media' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'media' && (
                    <motion.div {...dropdownAnimation} className="absolute top-full left-0 mt-1 w-56 bg-surface-900/98 backdrop-blur-xl rounded-2xl shadow-modal border border-white/10 overflow-hidden">
                      <div className="p-2">
                        {dropdownGroups.media.items.map((item) => (
                          <Link key={item.href + item.label} to={item.href} onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                              <item.icon className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-sm font-medium text-white">{item.label}</span>
                            {(item as any).live && isLive && (
                              <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] bg-red-500 text-white font-bold uppercase">LIVE</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Community Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('community')}
                  className={`nav-link-icc flex items-center gap-1 ${activeDropdown === 'community' ? 'active' : ''}`}
                  aria-expanded={activeDropdown === 'community'}
                >
                  Community <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'community' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'community' && (
                    <motion.div {...dropdownAnimation} className="absolute top-full left-0 mt-1 w-56 bg-surface-900/98 backdrop-blur-xl rounded-2xl shadow-modal border border-white/10 overflow-hidden">
                      <div className="p-2">
                        {dropdownGroups.community.items.map((item) => (
                          <Link key={item.href + item.label} to={item.href} onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                              <item.icon className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-sm font-medium text-white">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* About Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('about')}
                  className={`nav-link-icc flex items-center gap-1 ${activeDropdown === 'about' ? 'active' : ''}`}
                  aria-expanded={activeDropdown === 'about'}
                >
                  About <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'about' && (
                    <motion.div {...dropdownAnimation} className="absolute top-full left-0 mt-1 w-56 bg-surface-900/98 backdrop-blur-xl rounded-2xl shadow-modal border border-white/10 overflow-hidden">
                      <div className="p-2">
                        {dropdownGroups.about.items.map((item) => (
                          <Link key={item.href + item.label} to={item.href} onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                              <item.icon className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-sm font-medium text-white">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleInstall}
                className="btn-icc text-sm px-4 py-2 flex items-center gap-2 ml-2"
              >
                <Download className="w-4 h-4" /> Install App
              </button>
            </div>

            <div className="flex items-center gap-2 z-10">
              <button
                onClick={() => setCommandOpen(true)}
                className="hidden md:flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs text-white/40"
                aria-label="Command palette"
              >
                <Command className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Ctrl+K</span>
              </button>

              <button
                onClick={() => navigate('/search')}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-white/70" />
              </button>

              <SmartLanguageSwitcher />
              <SmartThemeToggle />

              {user ? (
                <div className="relative group">
                  <button className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center hover:bg-green-500/30 transition-all" aria-label="Profile">
                    <span className="text-sm font-bold text-green-400">{user.name.charAt(0)}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-surface-900 rounded-2xl shadow-modal border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                    <div className="p-3 border-b border-white/5">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-white/40">{user.email}</p>
                    </div>
                    {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                      <Link to="/admin" className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 transition-colors">
                        <Command className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">Sign In</Link>
                  <Link to="/register" className="btn-icc text-sm px-4 py-2">Register</Link>
                </div>
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
            </div>
          </nav>
        </div>
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
              aria-label="Mobile menu"
            >
              <div className="p-6 pt-24">
                {!user && (
                  <div className="flex gap-2 mb-8">
                    <Link to="/login" className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white text-sm font-medium text-center hover:bg-white/5 transition-colors" onClick={() => setMenuOpen(false)}>Sign In</Link>
                    <Link to="/register" className="flex-1 px-4 py-3 rounded-xl bg-green-500 text-white text-sm font-medium text-center hover:bg-green-600 transition-colors" onClick={() => setMenuOpen(false)}>Register</Link>
                  </div>
                )}

                {isLive && (
                  <Link to="/live" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold mb-6">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                    </span>
                    Live Now - Join Broadcast
                  </Link>
                )}

                {Object.entries(dropdownGroups).map(([key, group]) => (
                  <div key={key} className="mb-6">
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-4 mb-3">{group.label}</p>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <Link key={item.href + item.label} to={item.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                            <item.icon className="w-4 h-4 text-white/40" />
                          </div>
                          <span className="font-medium">{item.label}</span>
                          {(item as any).live && isLive && (
                            <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] bg-red-500 text-white font-bold uppercase">LIVE</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mb-6">
                  <button onClick={() => { handleInstall(); setMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Install App</span>
                  </button>
                </div>

                {user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <div className="mt-8 pt-6 border-t border-white/5 space-y-1">
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/5 transition-all">
                      <Command className="w-4 h-4" /> Admin Panel
                    </Link>
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
                      <LogOut className="w-4 h-4" /> Sign Out
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
