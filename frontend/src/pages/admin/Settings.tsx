import { useState, useEffect } from 'react';
import { useTranslation, TranslationKey } from '../../i18n';
import { HiSave, HiRefresh, HiCog, HiGlobe, HiClock, HiUpload, HiTemplate, HiServer, HiTrash, HiExclamation, HiCheck, HiX } from 'react-icons/hi';
import api from '../../lib/api';
import { ConfirmDeleteModal } from '../../components/admin';
import toast from 'react-hot-toast';

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  defaultLanguage: string;
  timezone: string;
}

interface FeatureSettings {
  userRegistration: boolean;
  comments: boolean;
  ratings: boolean;
}

interface LimitSettings {
  maxUploadFileSize: number;
  maxResourcesPerPage: number;
  sessionTimeout: number;
}

interface MaintenanceSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

type SettingsTab = 'general' | 'features' | 'limits' | 'maintenance';

const LANGUAGES = (t: (k: string) => string) => [
  { value: 'en', label: t('admin.settings_lang_en') },
  { value: 'ar', label: t('admin.settings_lang_ar') },
  { value: 'am', label: t('admin.settings_lang_am') },
  { value: 'om', label: t('admin.settings_lang_om') },
];

const TIMEZONES = [
  'UTC',
  'Africa/Addis_Ababa',
  'Africa/Nairobi',
  'Africa/Cairo',
  'Asia/Riyadh',
  'Asia/Dubai',
  'America/New_York',
  'Europe/London',
];

const DEFAULT_GENERAL = (t: (k: string) => string): GeneralSettings => ({
  siteName: t('admin.settings_default_name'),
  siteDescription: t('admin.settings_default_desc'),
  defaultLanguage: 'en',
  timezone: 'UTC',
});

const DEFAULT_FEATURES: FeatureSettings = {
  userRegistration: true,
  comments: true,
  ratings: true,
};

const DEFAULT_LIMITS: LimitSettings = {
  maxUploadFileSize: 50,
  maxResourcesPerPage: 20,
  sessionTimeout: 60,
};

const DEFAULT_MAINTENANCE = (t: (k: string) => string): MaintenanceSettings => ({
  maintenanceMode: false,
  maintenanceMessage: t('admin.settings_maintenance_default_msg'),
});

export default function AdminSettings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tr = (k: string) => t(k as TranslationKey);
  const [general, setGeneral] = useState<GeneralSettings>(DEFAULT_GENERAL(tr));
  const [features, setFeatures] = useState<FeatureSettings>(DEFAULT_FEATURES);
  const [limits, setLimits] = useState<LimitSettings>(DEFAULT_LIMITS);
  const [maintenance, setMaintenance] = useState<MaintenanceSettings>(DEFAULT_MAINTENANCE(tr));

  const [saving, setSaving] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  const loadSettings = () => {
    setLoading(true);
    setError('');
    api.get('/admin/settings')
      .then((res) => {
        const data = res.data;
        if (data.general) setGeneral({ ...DEFAULT_GENERAL(tr), ...data.general });
        if (data.features) setFeatures({ ...DEFAULT_FEATURES, ...data.features });
        if (data.limits) setLimits({ ...DEFAULT_LIMITS, ...data.limits });
        if (data.maintenance) setMaintenance({ ...DEFAULT_MAINTENANCE(tr), ...data.maintenance });
      })
      .catch(() => {
        setGeneral(DEFAULT_GENERAL(tr));
        setFeatures(DEFAULT_FEATURES);
        setLimits(DEFAULT_LIMITS);
        setMaintenance(DEFAULT_MAINTENANCE(tr));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSettings() }, []);

  const saveSection = async (section: SettingsTab) => {
    setSaving(section);
    try {
      const payload: any = {};
      if (section === 'general') payload.general = general;
      else if (section === 'features') payload.features = features;
      else if (section === 'limits') payload.limits = limits;
      else if (section === 'maintenance') payload.maintenance = maintenance;
      await api.put('/admin/settings', payload);
      toast.success(t('admin.settings_saved'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('admin.settings_save_failed'));
    } finally {
      setSaving('');
    }
  };

  const handleReset = async () => {
    try {
      await api.post('/admin/settings/reset');
      toast.success(t('admin.settings_reset_done'));
      setResetConfirm(false);
      loadSettings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('admin.settings_reset_failed'));
    }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await api.post('/admin/cache/clear');
      toast.success(t('admin.settings_cache_cleared'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('admin.settings_cache_failed'));
    } finally {
      setClearingCache(false);
    }
  };

  const tabs: { key: SettingsTab; label: string; icon: any }[] = [
    { key: 'general', label: t('admin.settings_general'), icon: HiGlobe },
    { key: 'features', label: t('admin.settings_features'), icon: HiTemplate },
    { key: 'limits', label: t('admin.settings_limits'), icon: HiUpload },
    { key: 'maintenance', label: t('admin.settings_maintenance'), icon: HiServer },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-icc-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <HiCog className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={loadSettings} className="px-5 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-400 text-white text-sm font-semibold transition-all">{t('admin.settings_retry')}</button>
        </div>
      </div>
    );
  }

  const renderGeneral = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t('admin.settings_site_name')}</label>
        <input value={general.siteName} onChange={(e) => setGeneral((f) => ({ ...f, siteName: e.target.value }))} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t('admin.settings_site_desc')}</label>
        <textarea value={general.siteDescription} onChange={(e) => setGeneral((f) => ({ ...f, siteDescription: e.target.value }))} className="input-field" rows={3} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('admin.settings_default_lang')}</label>
          <select value={general.defaultLanguage} onChange={(e) => setGeneral((f) => ({ ...f, defaultLanguage: e.target.value }))} className="input-field">
            {LANGUAGES(tr).map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('admin.settings_timezone')}</label>
          <select value={general.timezone} onChange={(e) => setGeneral((f) => ({ ...f, timezone: e.target.value }))} className="input-field">
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-4">
      {[
        { key: 'userRegistration', label: t('admin.settings_user_reg'), desc: t('admin.settings_user_reg_desc') },
        { key: 'comments', label: t('admin.settings_comments'), desc: t('admin.settings_comments_desc') },
        { key: 'ratings', label: t('admin.settings_ratings'), desc: t('admin.settings_ratings_desc') },
      ].map((feat) => (
        <div key={feat.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{feat.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{feat.desc}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeatures((f) => ({ ...f, [feat.key]: !(f as any)[feat.key] }))}
            className={`relative w-11 h-6 rounded-full transition-all duration-200 ${(features as any)[feat.key] ? 'bg-icc-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${(features as any)[feat.key] ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      ))}
    </div>
  );

  const renderLimits = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t('admin.settings_max_upload')}</label>
        <input type="number" value={limits.maxUploadFileSize} onChange={(e) => setLimits((f) => ({ ...f, maxUploadFileSize: parseInt(e.target.value) || 0 }))} className="input-field" min={1} max={500} />
        <p className="text-xs text-gray-500 mt-1">{t('admin.settings_max_upload_desc')}</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t('admin.settings_max_per_page')}</label>
        <input type="number" value={limits.maxResourcesPerPage} onChange={(e) => setLimits((f) => ({ ...f, maxResourcesPerPage: parseInt(e.target.value) || 0 }))} className="input-field" min={5} max={100} />
        <p className="text-xs text-gray-500 mt-1">{t('admin.settings_max_per_page_desc')}</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t('admin.settings_session_timeout')}</label>
        <input type="number" value={limits.sessionTimeout} onChange={(e) => setLimits((f) => ({ ...f, sessionTimeout: parseInt(e.target.value) || 0 }))} className="input-field" min={5} max={1440} />
        <p className="text-xs text-gray-500 mt-1">{t('admin.settings_session_timeout_desc')}</p>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{t('admin.settings_maintenance_mode')}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t('admin.settings_maintenance_mode_desc')}</p>
        </div>
        <button
          type="button"
          onClick={() => setMaintenance((f) => ({ ...f, maintenanceMode: !f.maintenanceMode }))}
          className={`relative w-11 h-6 rounded-full transition-all duration-200 ${maintenance.maintenanceMode ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${maintenance.maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
      {maintenance.maintenanceMode && (
        <div>
          <label className="block text-sm font-medium mb-1">{t('admin.settings_maintenance_msg')}</label>
          <textarea value={maintenance.maintenanceMessage} onChange={(e) => setMaintenance((f) => ({ ...f, maintenanceMessage: e.target.value }))} className="input-field" rows={3} placeholder={t('admin.settings_maintenance_msg_placeholder')} />
        </div>
      )}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={handleClearCache} disabled={clearingCache} className="btn-secondary inline-flex items-center gap-2">
          {clearingCache ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" /> : <HiRefresh className="w-4 h-4" />}
          {clearingCache ? t('admin.settings_clearing') : t('admin.settings_clear_cache')}
        </button>
        <p className="text-xs text-gray-500 mt-2">{t('admin.settings_clear_cache_desc')}</p>
      </div>
    </div>
  );

  const sectionRenderers: Record<SettingsTab, () => JSX.Element> = {
    general: renderGeneral,
    features: renderFeatures,
    limits: renderLimits,
    maintenance: renderMaintenance,
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t('admin.settings_title')}</h1>
        <button onClick={() => setResetConfirm(true)} className="btn-secondary inline-flex items-center gap-2 text-sm">
          <HiRefresh className="w-4 h-4" /> {t('admin.settings_reset_defaults')}
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === t.key ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <t.icon className="w-4 h-4 inline mr-1.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
        {sectionRenderers[activeTab]()}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400">{t('admin.settings_save_section')}</p>
          <button onClick={() => saveSection(activeTab)} disabled={saving === activeTab} className="btn-primary inline-flex items-center gap-2">
            {saving === activeTab ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <HiSave className="w-4 h-4" />}
            {saving === activeTab ? t('admin.settings_saving') : t('admin.settings_save')}
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        open={resetConfirm}
        onClose={() => setResetConfirm(false)}
        onConfirm={handleReset}
        title={t('admin.settings_reset_confirm_title')}
        entityName="all settings"
      />
    </div>
  );
}
