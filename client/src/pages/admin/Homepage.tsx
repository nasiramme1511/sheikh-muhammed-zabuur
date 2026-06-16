import { useState, useEffect, useRef } from 'react';
import {
  Save, RefreshCw, AlertCircle, CheckCircle, Eye, EyeOff,
  Image as ImageIcon, Upload, Trash2, GripHorizontal, Type, Grid3X3,
  Layout, Video, Radio, BarChart3, ChevronDown, ChevronUp, Palette
} from 'lucide-react';
import { appearance, admin } from '../../lib/api';
import { useTranslation } from '../../i18n';

interface HomepageSettings {
  heroEnabled: boolean;
  heroBackground: string;
  heroTitle: string;
  heroSubtitle: string;
  featuredEnabled: boolean;
  featuredMaxItems: number;
  featuredSortOrder: 'recent' | 'popular' | 'manual';
  statisticsEnabled: boolean;
  counterAnimationSpeed: number;
  counterColor: string;
  categoriesEnabled: boolean;
  categoriesGridColumns: number;
  categoriesMaxItems: number;
  biographyEnabled: boolean;
  biographyLayout: 'left' | 'right';
  latestUploadsEnabled: boolean;
  latestUploadsMaxItems: number;
  latestUploadsTitle: string;
  liveStreamEnabled: boolean;
  liveStreamAutoShow: boolean;
}

export default function HomepageManager() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<HomepageSettings>({
    heroEnabled: true,
    heroBackground: '',
    heroTitle: 'Welcome to Islamic Learning',
    heroSubtitle: 'Learn the Quran, Hadith, and Islamic Sciences',
    featuredEnabled: true,
    featuredMaxItems: 6,
    featuredSortOrder: 'recent',
    statisticsEnabled: true,
    counterAnimationSpeed: 2000,
    counterColor: '#10b981',
    categoriesEnabled: true,
    categoriesGridColumns: 3,
    categoriesMaxItems: 12,
    biographyEnabled: true,
    biographyLayout: 'left',
    latestUploadsEnabled: true,
    latestUploadsMaxItems: 8,
    latestUploadsTitle: 'Latest Uploads',
    liveStreamEnabled: true,
    liveStreamAutoShow: true,
  });

  useEffect(() => {
    appearance.get()
      .then(res => {
        const d = res.data;
        if (d) {
          setSettings(prev => ({
            ...prev,
            heroEnabled: d.heroEnabled ?? prev.heroEnabled,
            heroBackground: d.heroBackground ?? prev.heroBackground,
            heroTitle: d.heroTitle ?? prev.heroTitle,
            heroSubtitle: d.heroSubtitle ?? prev.heroSubtitle,
            featuredEnabled: d.featuredEnabled ?? prev.featuredEnabled,
            featuredMaxItems: d.featuredMaxItems ?? prev.featuredMaxItems,
            featuredSortOrder: d.featuredSortOrder ?? prev.featuredSortOrder,
            statisticsEnabled: d.statisticsEnabled ?? prev.statisticsEnabled,
            counterAnimationSpeed: d.counterAnimationSpeed ?? prev.counterAnimationSpeed,
            counterColor: d.counterColor ?? prev.counterColor,
            categoriesEnabled: d.categoriesEnabled ?? prev.categoriesEnabled,
            categoriesGridColumns: d.categoriesGridColumns ?? prev.categoriesGridColumns,
            categoriesMaxItems: d.categoriesMaxItems ?? prev.categoriesMaxItems,
            biographyEnabled: d.biographyEnabled ?? prev.biographyEnabled,
            biographyLayout: d.biographyLayout ?? prev.biographyLayout,
            latestUploadsEnabled: d.latestUploadsEnabled ?? prev.latestUploadsEnabled,
            latestUploadsMaxItems: d.latestUploadsMaxItems ?? prev.latestUploadsMaxItems,
            latestUploadsTitle: d.latestUploadsTitle ?? prev.latestUploadsTitle,
            liveStreamEnabled: d.liveStreamEnabled ?? prev.liveStreamEnabled,
            liveStreamAutoShow: d.liveStreamAutoShow ?? prev.liveStreamAutoShow,
          }));
        }
      })
      .catch(() => setError('Failed to load homepage settings'))
      .finally(() => setLoading(false));
  }, []);

  const update = (partial: Partial<HomepageSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setError('Image exceeds 20MB limit'); return; }
    setUploading(true);
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', 'Hero Background');
    fd.append('category', 'General');
    fd.append('resourceType', 'IMAGE');
    try {
      const res = await admin.upload(fd);
      if (res.data?.url) update({ heroBackground: res.data.url });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await appearance.update(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save settings');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Layout className="w-6 h-6 text-emerald-500" />
            Homepage Manager
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure the sections and content of your homepage
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" /> Settings saved successfully!
        </div>
      )}

      {/* Hero Section */}
      <SectionCard icon={Eye} title="Hero Section" subtitle="Control the main hero banner">
        <div className="space-y-5">
          <ToggleRow label="Enable Hero Section" checked={settings.heroEnabled} onChange={(v) => update({ heroEnabled: v })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Background Image</label>
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video max-w-lg bg-gray-100 dark:bg-gray-900 mb-3">
              {settings.heroBackground ? (
                <>
                  <img src={settings.heroBackground} alt="Hero" className="w-full h-full object-cover" />
                  <button onClick={() => update({ heroBackground: '' })} className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
            </div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Image'}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={uploading} className="hidden" />
            </label>
          </div>
          <TextField label="Hero Title" value={settings.heroTitle} onChange={(v) => update({ heroTitle: v })} />
          <TextField label="Hero Subtitle" value={settings.heroSubtitle} onChange={(v) => update({ heroSubtitle: v })} />
        </div>
      </SectionCard>

      {/* Featured Content */}
      <SectionCard icon={BarChart3} title="Featured Content" subtitle="Featured audio, video & PDF section settings">
        <div className="space-y-5">
          <ToggleRow label="Enable Featured Content" checked={settings.featuredEnabled} onChange={(v) => update({ featuredEnabled: v })} />
          <RangeRow label="Max Items" value={settings.featuredMaxItems} min={2} max={12} step={1} format={(v) => String(v)} onChange={(v) => update({ featuredMaxItems: v })} />
          <SelectRow label="Sort Order" value={settings.featuredSortOrder} options={[
            { value: 'recent', label: 'Most Recent' },
            { value: 'popular', label: 'Most Popular' },
            { value: 'manual', label: 'Manual Selection' },
          ]} onChange={(v) => update({ featuredSortOrder: v as HomepageSettings['featuredSortOrder'] })} />
        </div>
      </SectionCard>

      {/* Statistics Section */}
      <SectionCard icon={BarChart3} title="Statistics Section" subtitle="Animated counter settings">
        <div className="space-y-5">
          <ToggleRow label="Enable Statistics" checked={settings.statisticsEnabled} onChange={(v) => update({ statisticsEnabled: v })} />
          <RangeRow label="Counter Animation Speed (ms)" value={settings.counterAnimationSpeed} min={500} max={5000} step={100} format={(v) => `${(v / 1000).toFixed(1)}s`} onChange={(v) => update({ counterAnimationSpeed: v })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Counter Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={settings.counterColor} onChange={(e) => update({ counterColor: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600" />
              <input type="text" value={settings.counterColor} onChange={(e) => update({ counterColor: e.target.value })} className="input-field flex-1 font-mono text-sm max-w-[120px]" />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Categories Section */}
      <SectionCard icon={Grid3X3} title="Categories Section" subtitle="Category grid display settings">
        <div className="space-y-5">
          <ToggleRow label="Enable Categories" checked={settings.categoriesEnabled} onChange={(v) => update({ categoriesEnabled: v })} />
          <SelectRow label="Grid Columns" value={String(settings.categoriesGridColumns)} options={[
            { value: '2', label: '2 Columns' },
            { value: '3', label: '3 Columns' },
            { value: '4', label: '4 Columns' },
          ]} onChange={(v) => update({ categoriesGridColumns: Number(v) })} />
          <RangeRow label="Max Categories" value={settings.categoriesMaxItems} min={3} max={24} step={1} format={(v) => String(v)} onChange={(v) => update({ categoriesMaxItems: v })} />
        </div>
      </SectionCard>

      {/* Biography Section */}
      <SectionCard icon={Type} title="Biography Section" subtitle="Teacher biography display settings">
        <div className="space-y-5">
          <ToggleRow label="Enable Biography" checked={settings.biographyEnabled} onChange={(v) => update({ biographyEnabled: v })} />
          <SelectRow label="Image Layout" value={settings.biographyLayout} options={[
            { value: 'left', label: 'Image on Left' },
            { value: 'right', label: 'Image on Right' },
          ]} onChange={(v) => update({ biographyLayout: v as HomepageSettings['biographyLayout'] })} />
        </div>
      </SectionCard>

      {/* Latest Uploads */}
      <SectionCard icon={Video} title="Latest Uploads" subtitle="Recent content section settings">
        <div className="space-y-5">
          <ToggleRow label="Enable Latest Uploads" checked={settings.latestUploadsEnabled} onChange={(v) => update({ latestUploadsEnabled: v })} />
          <RangeRow label="Max Items" value={settings.latestUploadsMaxItems} min={4} max={12} step={1} format={(v) => String(v)} onChange={(v) => update({ latestUploadsMaxItems: v })} />
          <TextField label="Section Title" value={settings.latestUploadsTitle} onChange={(v) => update({ latestUploadsTitle: v })} />
        </div>
      </SectionCard>

      {/* Live Stream Section */}
      <SectionCard icon={Radio} title="Live Stream Section" subtitle="Live broadcast display settings">
        <div className="space-y-5">
          <ToggleRow label="Enable Live Stream Section" checked={settings.liveStreamEnabled} onChange={(v) => update({ liveStreamEnabled: v })} />
          <ToggleRow label="Auto-Show When Live" desc="Automatically highlight the stream when broadcasting" checked={settings.liveStreamAutoShow} onChange={(v) => update({ liveStreamAutoShow: v })} />
        </div>
      </SectionCard>
    </div>
  );
}

function SectionCard({ icon: Icon, title, subtitle, children }: { icon: any; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
      <div>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</label>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${checked ? 'translate-x-[18px]' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function RangeRow({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-xs font-mono font-bold text-emerald-500">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <input
        type="text" value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
      />
    </div>
  );
}

function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
