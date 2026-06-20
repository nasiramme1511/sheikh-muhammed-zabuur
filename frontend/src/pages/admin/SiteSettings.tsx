import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiCog } from 'react-icons/hi';
import { Save, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import { useTranslation } from '../../i18n';
import toast from 'react-hot-toast';

interface SiteSettingsData {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  phone: string;
  address: string;
  copyrightText: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
}

export default function AdminSiteSettings() {
  const { t } = useTranslation();
  const [form, setForm] = useState<SiteSettingsData>({
    siteName: '',
    siteDescription: '',
    logo: '',
    favicon: '',
    contactEmail: '',
    phone: '',
    address: '',
    copyrightText: '',
    defaultLanguage: 'en',
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/site-settings').then(r => {
      const d = r.data;
      setForm({
        siteName: d.siteName || '',
        siteDescription: d.siteDescription || '',
        logo: d.logo || '',
        favicon: d.favicon || '',
        contactEmail: d.contactEmail || '',
        phone: d.phone || '',
        address: d.address || '',
        copyrightText: d.copyrightText || '',
        defaultLanguage: d.defaultLanguage || 'en',
        maintenanceMode: d.maintenanceMode || false,
      });
    }).catch(() => {
      toast.error('Failed to load site settings');
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/site-settings', form);
      toast.success('Site settings updated');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icc-500 to-icc-600 flex items-center justify-center">
            <HiCog className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Site Settings</h1>
            <p className="text-sm text-gray-500">Manage global site configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name</label>
            <input value={form.siteName} onChange={e => setForm(f => ({ ...f, siteName: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Language</label>
            <select value={form.defaultLanguage} onChange={e => setForm(f => ({ ...f, defaultLanguage: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]">
              <option value="en">English</option>
              <option value="am">Amharic</option>
              <option value="ar">Arabic</option>
              <option value="om">Oromic</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Description</label>
            <textarea value={form.siteDescription} onChange={e => setForm(f => ({ ...f, siteDescription: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL</label>
            <input value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Favicon URL</label>
            <input value={form.favicon} onChange={e => setForm(f => ({ ...f, favicon: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
            <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Copyright Text</label>
            <input value={form.copyrightText} onChange={e => setForm(f => ({ ...f, copyrightText: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.maintenanceMode} onChange={e => setForm(f => ({ ...f, maintenanceMode: e.target.checked }))} className="w-5 h-5 rounded border-gray-300 text-icc-500 focus:ring-icc-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Maintenance Mode</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-8">When enabled, only admins can access the site</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-icc-500 hover:bg-icc-400 text-white text-sm font-medium transition-all disabled:opacity-50 min-h-[44px]">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
}
