import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, ArrowLeft, Bell, Globe, Moon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Language } from '../../lib/language';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { mode, toggle } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/60 mb-6">
        <ArrowLeft className="w-4 h-4" /> {t('my_library.back')}
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6 text-icc-400" /> {t('my_library.settings')}
      </h1>

      <div className="glass-premium p-6 rounded-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-white/60" />
            <div>
              <p className="text-sm font-medium text-white">{t('my_library.dark_mode')}</p>
              <p className="text-xs text-white/40">{t('my_library.dark_mode_desc')}</p>
            </div>
          </div>
          <button
            onClick={toggle}
            className={`w-12 h-6 rounded-full transition-colors relative ${mode === 'dark' ? 'bg-icc-500' : 'bg-white/20'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${mode === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-white/60" />
            <div>
              <p className="text-sm font-medium text-white">{t('my_library.language')}</p>
              <p className="text-xs text-white/40">{t('my_library.language_desc')}</p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-icc-500/50"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="am">አማርኛ</option>
            <option value="om">Oromoo</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-white/60" />
            <div>
              <p className="text-sm font-medium text-white">{t('my_library.notifications')}</p>
              <p className="text-xs text-white/40">{t('my_library.notifications_desc')}</p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-icc-500' : 'bg-white/20'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
