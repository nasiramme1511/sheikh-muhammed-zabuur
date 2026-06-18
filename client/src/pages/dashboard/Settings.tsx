import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Monitor, Check, Settings2, Languages, Palette, Bell, Mail } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { useLanguage } from '../../context/LanguageContext';
import { HiSun } from 'react-icons/hi';
import type { ThemeMode } from '../../context/ThemeContext';
import type { Language } from '../../lib/language';

export default function DashboardSettings() {
  const { t } = useTranslation();
  const { mode, setMode, resolved } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const themeOptions: { value: ThemeMode; label: string; icon: any }[] = [
    { value: 'dark', label: t('theme.dark'), icon: Moon },
    { value: 'light', label: t('theme.light'), icon: HiSun },
    { value: 'system', label: t('theme.system'), icon: Monitor },
  ];

  const languageOptions: { value: Language; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' },
    { value: 'am', label: 'አማርኛ' },
    { value: 'om', label: 'Oromoo' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-icc-400" />
          {t('dashboard.settings')}
        </h1>
        <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          {resolved === 'dark' ? t('theme.dark') : t('theme.light')}
        </span>
      </div>

      {/* Language */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-premium p-6"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Languages className="w-5 h-5 text-icc-400" />
          {t('settings.language')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {languageOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setLanguage(opt.value)}
              className={`p-3 rounded-xl text-sm font-medium transition-all border ${
                language === opt.value
                  ? 'bg-icc-500/10 border-icc-500/30 text-icc-400 shadow-sm shadow-icc-500/5'
                  : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              {opt.label}
              {language === opt.value && <Check className="w-4 h-4 inline ml-1" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Theme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-premium p-6"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-icc-400" />
          {t('settings.theme')}
        </h2>
        <div className="flex gap-3">
          {themeOptions.map(opt => {
            const Icon = opt.icon;
            const isActive = mode === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setMode(opt.value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                  isActive
                    ? 'bg-icc-500/10 border-icc-500/30 text-icc-400 shadow-sm shadow-icc-500/5'
                    : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-premium p-6"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-icc-400" />
          {t('settings.notifications')}
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-sm text-white">{t('settings.push_notifications')}</p>
                <p className="text-xs text-white/40">{t('settings.push_notifications_desc')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${
                notifications ? 'bg-icc-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                notifications ? 'left-5' : 'left-1'
              }`} />
            </button>
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-sm text-white">{t('settings.email_updates')}</p>
                <p className="text-xs text-white/40">{t('settings.email_updates_desc')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEmailUpdates(!emailUpdates)}
              className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${
                emailUpdates ? 'bg-icc-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                emailUpdates ? 'left-5' : 'left-1'
              }`} />
            </button>
          </label>
        </div>
      </motion.div>
    </div>
  );
}
