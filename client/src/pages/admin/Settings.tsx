import { useState, useEffect } from 'react';
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
  aiAssistant: boolean;
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

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'am', label: 'Amharic' },
  { value: 'om', label: 'Afaan Oromo' },
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

const DEFAULT_GENERAL: GeneralSettings = {
  siteName: 'Iman Chercher College',
  siteDescription: 'A clear, guided Islamic learning journey',
  defaultLanguage: 'en',
  timezone: 'UTC',
};

const DEFAULT_FEATURES: FeatureSettings = {
  aiAssistant: true,
  userRegistration: true,
  comments: true,
  ratings: true,
};

const DEFAULT_LIMITS: LimitSettings = {
  maxUploadFileSize: 50,
  maxResourcesPerPage: 20,
  sessionTimeout: 60,
};

const DEFAULT_MAINTENANCE: MaintenanceSettings = {
  maintenanceMode: false,
  maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back shortly.',
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [general, setGeneral] = useState<GeneralSettings>(DEFAULT_GENERAL);
  const [features, setFeatures] = useState<FeatureSettings>(DEFAULT_FEATURES);
  const [limits, setLimits] = useState<LimitSettings>(DEFAULT_LIMITS);
  const [maintenance, setMaintenance] = useState<MaintenanceSettings>(DEFAULT_MAINTENANCE);

  const [saving, setSaving] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  const loadSettings = () => {
    setLoading(true);
    setError('');
    api.get('/admin/settings')
      .then((res) => {
        const data = res.data;
        if (data.general) setGeneral({ ...DEFAULT_GENERAL, ...data.general });
        if (data.features) setFeatures({ ...DEFAULT_FEATURES, ...data.features });
        if (data.limits) setLimits({ ...DEFAULT_LIMITS, ...data.limits });
        if (data.maintenance) setMaintenance({ ...DEFAULT_MAINTENANCE, ...data.maintenance });
      })
      .catch(() => {
        setGeneral(DEFAULT_GENERAL);
        setFeatures(DEFAULT_FEATURES);
        setLimits(DEFAULT_LIMITS);
        setMaintenance(DEFAULT_MAINTENANCE);
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
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving('');
    }
  };

  const handleReset = async () => {
    try {
      await api.post('/admin/settings/reset');
      toast.success('Settings reset to defaults');
      setResetConfirm(false);
      loadSettings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset settings');
    }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await api.post('/admin/cache/clear');
      toast.success('Cache cleared successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to clear cache');
    } finally {
      setClearingCache(false);
    }
  };

  const tabs: { key: SettingsTab; label: string; icon: any }[] = [
    { key: 'general', label: 'General', icon: HiGlobe },
    { key: 'features', label: 'Features', icon: HiTemplate },
    { key: 'limits', label: 'Limits', icon: HiUpload },
    { key: 'maintenance', label: 'Maintenance', icon: HiServer },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
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
          <button onClick={loadSettings} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all">Retry</button>
        </div>
      </div>
    );
  }

  const renderGeneral = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Site Name</label>
        <input value={general.siteName} onChange={(e) => setGeneral((f) => ({ ...f, siteName: e.target.value }))} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Site Description</label>
        <textarea value={general.siteDescription} onChange={(e) => setGeneral((f) => ({ ...f, siteDescription: e.target.value }))} className="input-field" rows={3} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Default Language</label>
          <select value={general.defaultLanguage} onChange={(e) => setGeneral((f) => ({ ...f, defaultLanguage: e.target.value }))} className="input-field">
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Timezone</label>
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
        { key: 'aiAssistant', label: 'AI Scholar', desc: 'Enable AI-powered Iman Chercher AI Scholar for users' },
        { key: 'userRegistration', label: 'User Registration', desc: 'Allow new users to create accounts' },
        { key: 'comments', label: 'Comments', desc: 'Enable comments on lessons and resources' },
        { key: 'ratings', label: 'Ratings', desc: 'Allow users to rate lessons and resources' },
      ].map((feat) => (
        <div key={feat.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{feat.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{feat.desc}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeatures((f) => ({ ...f, [feat.key]: !(f as any)[feat.key] }))}
            className={`relative w-11 h-6 rounded-full transition-all duration-200 ${(features as any)[feat.key] ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
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
        <label className="block text-sm font-medium mb-1">Max Upload File Size (MB)</label>
        <input type="number" value={limits.maxUploadFileSize} onChange={(e) => setLimits((f) => ({ ...f, maxUploadFileSize: parseInt(e.target.value) || 0 }))} className="input-field" min={1} max={500} />
        <p className="text-xs text-gray-500 mt-1">Maximum file size users can upload (1-500 MB)</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Max Resources Per Page</label>
        <input type="number" value={limits.maxResourcesPerPage} onChange={(e) => setLimits((f) => ({ ...f, maxResourcesPerPage: parseInt(e.target.value) || 0 }))} className="input-field" min={5} max={100} />
        <p className="text-xs text-gray-500 mt-1">Maximum items to show per page (5-100)</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
        <input type="number" value={limits.sessionTimeout} onChange={(e) => setLimits((f) => ({ ...f, sessionTimeout: parseInt(e.target.value) || 0 }))} className="input-field" min={5} max={1440} />
        <p className="text-xs text-gray-500 mt-1">User session expiration time in minutes (5-1440)</p>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
          <p className="text-xs text-gray-500 mt-0.5">When enabled, only admins can access the site</p>
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
          <label className="block text-sm font-medium mb-1">Maintenance Message</label>
          <textarea value={maintenance.maintenanceMessage} onChange={(e) => setMaintenance((f) => ({ ...f, maintenanceMessage: e.target.value }))} className="input-field" rows={3} placeholder="Message to show users during maintenance" />
        </div>
      )}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={handleClearCache} disabled={clearingCache} className="btn-secondary inline-flex items-center gap-2">
          {clearingCache ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" /> : <HiRefresh className="w-4 h-4" />}
          {clearingCache ? 'Clearing...' : 'Clear Cache'}
        </button>
        <p className="text-xs text-gray-500 mt-2">Clears cached pages, API responses, and compiled assets</p>
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
        <h1 className="text-2xl font-bold">System Settings</h1>
        <button onClick={() => setResetConfirm(true)} className="btn-secondary inline-flex items-center gap-2 text-sm">
          <HiRefresh className="w-4 h-4" /> Reset to Defaults
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
          <p className="text-xs text-gray-400">Changes are saved per section</p>
          <button onClick={() => saveSection(activeTab)} disabled={saving === activeTab} className="btn-primary inline-flex items-center gap-2">
            {saving === activeTab ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <HiSave className="w-4 h-4" />}
            {saving === activeTab ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        open={resetConfirm}
        onClose={() => setResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset Settings"
        entityName="all settings"
      />
    </div>
  );
}
