import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Palmtree, Sparkles } from 'lucide-react';
import { useTheme, type ThemeMode } from '../context/ThemeContext';
import { useTranslation } from '../i18n';

const OPTIONS: { mode: ThemeMode; icon: typeof Moon; labelKey: string }[] = [
  { mode: 'dark', icon: Moon, labelKey: 'theme.dark' },
  { mode: 'gold', icon: Sparkles, labelKey: 'theme.gold' },
  { mode: 'classic', icon: Palmtree, labelKey: 'theme.classic' },
];

export default function SmartThemeToggle() {
  const { mode, resolved, setMode } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentIcon = OPTIONS.find(o => o.mode === mode)?.icon || Moon;
  const Icon = currentIcon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-300 group"
        aria-label={t('nav.toggle_dark')}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <motion.div
          key={mode}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {mode === 'gold' ? (
            <Sparkles className="w-4 h-4 text-gold-400" />
          ) : mode === 'classic' ? (
            <Palmtree className="w-4 h-4 text-icc-400" />
          ) : (
            <Moon className="w-4 h-4 text-gold-400" />
          )}
        </motion.div>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-icc-500 animate-pulse" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-40 bg-dark-800/95 backdrop-blur-xl rounded-xl shadow-2xl shadow-dark-900/50 border border-white/10 py-1.5 z-50 origin-top-right overflow-hidden"
          >
            {OPTIONS.map((opt, i) => {
              const OptIcon = opt.icon;
              const isActive = mode === opt.mode;
              return (
                <motion.button
                  key={opt.mode}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => { setMode(opt.mode); setOpen(false); }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left transition-all ${
                    isActive
                      ? 'text-icc-400 bg-icc-500/10 font-medium'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  role="menuitem"
                  aria-checked={isActive}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isActive ? 'bg-icc-500/20' : 'bg-white/5'
                  }`}>
                    <OptIcon className={`w-3.5 h-3.5 ${isActive ? 'text-icc-400' : ''}`} />
                  </div>
                  <span className="flex-1">{t(opt.labelKey as any)}</span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 rounded-full bg-icc-500"
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
