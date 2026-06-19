import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Check, Settings2, Languages, Palette, Bell, Mail, HardDrive, Trash2, Wifi, Download, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { useLanguage } from '../../context/LanguageContext';
import type { ThemeMode } from '../../context/ThemeContext';
import type { Language } from '../../lib/language';
import { useOffline } from '../../context/OfflineContext';
import { getAllOfflineResources, deleteOfflineResource } from '../../lib/offline/db';
import toast from 'react-hot-toast';

export default function DashboardSettings() {
  const { t } = useTranslation();
  const { mode, setMode, resolved } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { state, refresh } = useOffline();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);

  const completedCount = state.resources.filter((r) => r.status === 'completed').length;
  const usedBytes = state.resources.filter((r) => r.status === 'completed').reduce((s, r) => s + (r.fileSize || 0), 0);
  const usedMB = (usedBytes / 1048576).toFixed(1);

  async function handleClearDownloads() {
    const all = await getAllOfflineResources();
    for (const r of all) {
      await deleteOfflineResource(r.id);
    }
    refresh();
    toast.success('All downloads cleared');
  }

  const themeOptions: { value: ThemeMode; label: string; icon: any }[] = [
    { value: 'dark', label: t('theme.dark'), icon: Moon },
    { value: 'light', label: t('theme.light'), icon: Sun },
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
          {mode === 'dark' ? t('theme.dark') : t('theme.light')}
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

      {/* Offline Storage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-premium p-6"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <HardDrive className="w-5 h-5 text-icc-400" />
          Offline Storage
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-sm text-white">{completedCount} items downloaded</p>
              <p className="text-xs text-white/40">{usedMB} MB used</p>
            </div>
            <button
              onClick={handleClearDownloads}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-sm text-white">Wi-Fi only downloads</p>
                <p className="text-xs text-white/40">Only download files on Wi-Fi to save mobile data</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWifiOnly(!wifiOnly)}
              className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${
                wifiOnly ? 'bg-icc-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                wifiOnly ? 'left-5' : 'left-1'
              }`} />
            </button>
          </label>

          <Link
            to="/my-downloads"
            className="flex items-center justify-between p-4 rounded-xl bg-icc-500/10 border border-icc-500/20 hover:bg-icc-500/15 transition-all"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-icc-400" />
              <div>
                <p className="text-sm text-white font-medium">Manage Downloads</p>
                <p className="text-xs text-white/40">View, play, and delete downloaded files</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-icc-400" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
