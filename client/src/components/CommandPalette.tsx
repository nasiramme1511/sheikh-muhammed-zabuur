import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Home, BookOpen, Users, GraduationCap, Layers,
  BookMarked, Send, Info, ArrowRight, Command, Sparkles, Music, Video, FileText, Loader2
} from 'lucide-react';
import { useTranslation, type TranslationKey } from '../i18n';
import api from '../lib/api';

const PAGES = [
  { labelKey: 'nav.home', href: '/', icon: Home, categoryKey: 'command_palette.navigate' },
  { labelKey: 'nav.categories', href: '/categories', icon: BookOpen, categoryKey: 'command_palette.navigate' },
  { labelKey: 'nav.teachers', href: '/teachers', icon: Users, categoryKey: 'command_palette.navigate' },
  { labelKey: 'nav.beginner', href: '/beginner', icon: GraduationCap, categoryKey: 'command_palette.navigate' },
  { labelKey: 'nav.courses', href: '/levels', icon: Layers, categoryKey: 'command_palette.navigate' },
  { labelKey: 'nav.telegram', href: '/telegram', icon: Send, categoryKey: 'command_palette.navigate' },
  { labelKey: 'nav.dashboard', href: '/dashboard', icon: Sparkles, categoryKey: 'command_palette.open' },
  { labelKey: 'nav.bookmarks', href: '/bookmarks', icon: BookMarked, categoryKey: 'command_palette.open' },
  { labelKey: 'nav.search_label', href: '/search', icon: Search, categoryKey: 'command_palette.navigate' },
];

const TYPE_ICONS: Record<string, any> = { AUDIO: Music, VIDEO: Video, PDF: FileText };
const TYPE_ROUTES: Record<string, string> = { AUDIO: '/audio', VIDEO: '/videos', PDF: '/pdfs' };

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<any>(null);

  const filteredPages = PAGES.filter((p) =>
    t(p.labelKey as TranslationKey).toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
    if (query.length < 2) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}&limit=5`);
        setResults(res.data?.results || res.data || []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
  }, [query]);

  const allItems = query.length >= 2
    ? [...filteredPages, ...results.map((r: any) => ({ ...r, _isResource: true }))]
    : filteredPages;

  const handleSelect = (item: any) => {
    if (item._isResource) {
      navigate(`${TYPE_ROUTES[item.type] || '/search'}?q=${encodeURIComponent(query)}`);
    } else {
      navigate(item.href);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((prev) => Math.max(prev - 1, 0)); }
    else if (e.key === 'Enter' && allItems[selectedIndex]) handleSelect(allItems[selectedIndex]);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-dark-800 border border-white/10 rounded-2xl shadow-2xl shadow-dark-900/60 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              {searching ? <Loader2 className="w-5 h-5 text-icc-400 animate-spin" /> : <Search className="w-5 h-5 text-white/30" />}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('command_palette.search_placeholder')}
                className="flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none text-sm"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/30 border border-white/5">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {allItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-white/30">{t('command_palette.no_results')}</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredPages.map((page, i) => {
                    const Icon = page.icon;
                    const idx = i;
                    return (
                      <button
                        key={page.href}
                        onClick={() => handleSelect(page)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all ${
                          idx === selectedIndex ? 'bg-icc-500/10 text-icc-400 border border-icc-500/20' : 'text-white/60 hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-left">{t(page.labelKey as TranslationKey)}</span>
                        <span className="text-[10px] text-white/20">{t(page.categoryKey as TranslationKey)}</span>
                        {idx === selectedIndex && <ArrowRight className="w-3.5 h-3.5 text-icc-400" />}
                      </button>
                    );
                  })}
                  {results.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span className="text-[10px] uppercase tracking-wider text-white/20 font-semibold">Resources</span>
                        <div className="flex-1 h-px bg-white/5" />
                      </div>
                      {results.map((r: any, ri: number) => {
                        const Icon = TYPE_ICONS[r.type] || Search;
                        const idx = filteredPages.length + ri;
                        const colors: Record<string, string> = { AUDIO: 'text-icc-400', VIDEO: 'text-blue-400', PDF: 'text-purple-400' };
                        return (
                          <button
                            key={`res-${r.id}-${r.type}`}
                            onClick={() => handleSelect(r)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all ${
                              idx === selectedIndex ? 'bg-icc-500/10 text-icc-400 border border-icc-500/20' : 'text-white/60 hover:bg-white/5'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${colors[r.type] || 'text-white/40'}`} />
                            <span className="flex-1 text-left truncate">{r.title}</span>
                            <span className="text-[10px] text-white/30">{r.category || r.type}</span>
                            {idx === selectedIndex && <ArrowRight className="w-3.5 h-3.5 text-icc-400" />}
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/5 bg-dark-900/50">
              <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/30">↑↓</kbd>
                <span>{t('command_palette.navigate')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/30">↵</kbd>
                <span>{t('command_palette.open')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/30">Esc</kbd>
                <span>{t('command_palette.close')}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
