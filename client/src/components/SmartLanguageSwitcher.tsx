import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../lib/language';
import { useTranslation } from '../i18n';

export default function SmartLanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
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

  const current = LANGUAGES.find(l => l.code === language)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-300 text-sm group"
        aria-label={t('nav.language')}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <motion.span
          key={language}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="text-base leading-none"
        >
          {current.flag}
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-44 bg-dark-800/95 backdrop-blur-xl rounded-xl shadow-2xl shadow-dark-900/50 border border-white/10 py-1.5 z-50 origin-top-right overflow-hidden"
          >
            {LANGUAGES.map((lang, i) => {
              const isActive = language === lang.code;
              return (
                <motion.button
                  key={lang.code}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => { setLanguage(lang.code); setOpen(false); }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left transition-all ${
                    isActive
                      ? 'text-icc-400 bg-icc-500/10 font-medium'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  role="menuitem"
                  aria-checked={isActive}
                  dir={lang.dir}
                >
                  <span className="text-base leading-none w-5 text-center">{lang.flag}</span>
                  <span className="flex-1">{lang.native}</span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Check className="w-3.5 h-3.5 text-icc-400" />
                    </motion.div>
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
