import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Palette, Save, Upload, Image, Monitor, Smartphone, Globe, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { branding } from '../../lib/api';
import toast from 'react-hot-toast';

interface BrandingSettings {
  id?: number;
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  splashScreen: string;
  heroImage: string;
  socialShareImage: string;
  dashboardBanner: string;
  appleTouchIcon: string;
  pwaMaskableIcon: string;
  contactEmail: string;
  phone: string;
  address: string;
  copyrightText: string;
}

export default function AdminBranding() {
  const [settings, setSettings] = useState<BrandingSettings>({
    siteName: 'Sheikh Mohammed Zabuur Official Platform',
    siteDescription: '',
    logo: '', favicon: '', splashScreen: '', heroImage: '', socialShareImage: '', dashboardBanner: '',
    appleTouchIcon: '', pwaMaskableIcon: '',
    contactEmail: '', phone: '', address: '', copyrightText: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    branding.get().then(r => {
      if (r.data) setSettings(prev => ({ ...prev, ...r.data }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await branding.update(settings);
      toast.success('Branding settings saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleUpload = async (type: string, file: File) => {
    setUploading(type);
    try {
      const res = await branding.upload(type, file);
      const field = type === 'logo' ? 'logo' : type === 'favicon' ? 'favicon' : type === 'splash' ? 'splashScreen' : type === 'hero' ? 'heroImage' : type === 'social' ? 'socialShareImage' : type === 'banner' ? 'dashboardBanner' : type === 'apple-icon' ? 'appleTouchIcon' : type === 'maskable-icon' ? 'pwaMaskableIcon' : null;
      if (field) setSettings(prev => ({ ...prev, [field]: res.data.url }));
      toast.success(`${type} uploaded`);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(null); }
  };

  const triggerFile = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) handleUpload(type, file);
    };
    input.click();
  };

  if (loading) {
    return <div className="space-y-6 animate-pulse"><div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" /></div></div>;
  }

  const ImageUpload = ({ label, value, type, icon: Icon }: { label: string; value: string; type: string; icon: any }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Icon className="w-4 h-4" />{label}</label>
      <div className="flex items-center gap-3">
        {value ? <img src={value} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" /> : <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"><Image className="w-5 h-5 text-gray-400" /></div>}
        <div className="flex-1 min-w-0">
          <input value={value} onChange={e => setSettings(prev => {
            const key = type === 'logo' ? 'logo' : type === 'favicon' ? 'favicon' : type === 'splash' ? 'splashScreen' : type === 'hero' ? 'heroImage' : type === 'social' ? 'socialShareImage' : type === 'banner' ? 'dashboardBanner' : type === 'apple-icon' ? 'appleTouchIcon' : 'pwaMaskableIcon';
            return { ...prev, [key]: e.target.value };
          })} placeholder="Image URL" className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-icc-500 mb-1.5" />
          <button onClick={() => triggerFile(type)} disabled={uploading === type} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-icc-500/10 text-icc-600 dark:text-icc-400 text-xs font-medium hover:bg-icc-500/20 transition-all">
            {uploading === type ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {uploading === type ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icc-500 to-icc-600 flex items-center justify-center"><Palette className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-lg font-bold text-gray-900 dark:text-white">Branding</h1><p className="text-sm text-gray-500">Manage all platform branding assets</p></div>
        </div>

        {/* Site Identity */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2"><Globe className="w-4 h-4" /> Site Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name</label><input value={settings.siteName} onChange={e => setSettings(prev => ({ ...prev, siteName: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tagline / Description</label><input value={settings.siteDescription} onChange={e => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" /></div>
          </div>
        </div>

        {/* Branding Images */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2"><Image className="w-4 h-4" /> Branding Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUpload label="Logo" value={settings.logo} type="logo" icon={Image} />
            <ImageUpload label="Favicon" value={settings.favicon} type="favicon" icon={Image} />
            <ImageUpload label="Splash Screen (PWA)" value={settings.splashScreen} type="splash" icon={Smartphone} />
            <ImageUpload label="Homepage Hero Image" value={settings.heroImage} type="hero" icon={Monitor} />
            <ImageUpload label="Social Share Image (OG)" value={settings.socialShareImage} type="social" icon={Globe} />
            <ImageUpload label="Dashboard Banner" value={settings.dashboardBanner} type="banner" icon={Monitor} />
            <ImageUpload label="Apple Touch Icon" value={settings.appleTouchIcon} type="apple-icon" icon={Smartphone} />
            <ImageUpload label="PWA Maskable Icon" value={settings.pwaMaskableIcon} type="maskable-icon" icon={Smartphone} />
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input value={settings.contactEmail} onChange={e => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input value={settings.phone} onChange={e => setSettings(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label><textarea value={settings.address} onChange={e => setSettings(prev => ({ ...prev, address: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Copyright Text</label><input value={settings.copyrightText} onChange={e => setSettings(prev => ({ ...prev, copyrightText: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" /></div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-400 text-white text-sm font-medium transition-all disabled:opacity-50 min-h-[44px]">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Changes
        </button>
      </motion.div>
    </div>
  );
}
