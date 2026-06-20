import { useState, useEffect } from 'react';
import { Save, Globe } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { siteSettings } from '../../lib/api';
import toast from 'react-hot-toast';

export default function SeoSettings() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    siteName: '',
    siteDescription: '',
    socialShareImage: '',
    favicon: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    siteSettings.get().then(res => {
      if (res.data) {
        setForm({
          siteName: res.data.siteName || '',
          siteDescription: res.data.siteDescription || '',
          socialShareImage: res.data.socialShareImage || '',
          favicon: res.data.favicon || '',
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await siteSettings.update(form);
      toast.success(t('admin.settings_saved'));
    } catch {
      toast.error(t('admin.settings_failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-spin rounded-full h-12 w-12 border-4 border-icc-500 border-t-transparent mx-auto mt-20" />;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Globe className="w-6 h-6 text-icc-400" /> {t('admin.seo_settings')}
      </h1>

      <div className="glass-premium p-6 rounded-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">{t('admin.site_name')}</label>
          <input
            type="text" value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-icc-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">{t('admin.site_description')}</label>
          <textarea
            value={form.siteDescription}
            onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-icc-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">{t('admin.social_share_image')}</label>
          <input
            type="text" value={form.socialShareImage}
            onChange={(e) => setForm({ ...form, socialShareImage: e.target.value })}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-icc-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">{t('admin.favicon')}</label>
          <input
            type="text" value={form.favicon}
            onChange={(e) => setForm({ ...form, favicon: e.target.value })}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-icc-500/50"
          />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-icc flex items-center gap-2 px-5 py-2.5 text-sm">
          <Save className="w-4 h-4" />
          {saving ? t('admin.saving') : t('admin.save')}
        </button>
      </div>
    </div>
  );
}
