import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';

export default function SmartThemeToggle() {
  const { mode, toggle } = useTheme();
  const { t } = useTranslation();
  const isDark = mode === 'dark';

  return (
    <button
      onClick={toggle}
      className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-300 group"
      aria-label={t('nav.toggle_dark')}
      title={isDark ? t('theme.light') : t('theme.dark')}
    >
      <motion.div
        key={mode}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-gold-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </motion.div>
      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-icc-500 animate-pulse" />
    </button>
  );
}
