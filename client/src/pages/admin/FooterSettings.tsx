import { useState, useEffect } from 'react';
import {
  Save, RefreshCw, AlertCircle, CheckCircle, Plus, Trash2, GripVertical,
  Pen, Globe, Mail, MapPin, MessageSquare, ChevronUp, ChevronDown
} from 'lucide-react';
import { appearance } from '../../lib/api';
import { useTranslation } from '../../i18n';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface QuickLink {
  id: string;
  label: string;
  url: string;
}

interface FooterData {
  platformName: string;
  description: string;
  copyright: string;
  socialLinks: SocialLink[];
  contactEmail: string;
  address: string;
  quickLinks: QuickLink[];
  newsletterEnabled: boolean;
}

const DEFAULT_SOCIALS: SocialLink[] = [
  { platform: 'Telegram', url: '', icon: 'telegram' },
  { platform: 'YouTube', url: '', icon: 'youtube' },
  { platform: 'Facebook', url: '', icon: 'facebook' },
  { platform: 'Twitter', url: '', icon: 'twitter' },
  { platform: 'Instagram', url: '', icon: 'instagram' },
  { platform: 'WhatsApp', url: '', icon: 'whatsapp' },
];

const SOCIAL_COLORS: Record<string, string> = {
  telegram: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  youtube: 'bg-red-500/10 text-red-400 border-red-500/20',
  facebook: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  twitter: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  instagram: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  whatsapp: 'bg-icc-500/10 text-icc-400 border-icc-500/20',
};

export default function FooterSettings() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState<FooterData>({
    platformName: '',
    description: '',
    copyright: '',
    socialLinks: DEFAULT_SOCIALS.map(s => ({ ...s })),
    contactEmail: '',
    address: '',
    quickLinks: [
      { id: '1', label: 'Home', url: '/' },
      { id: '2', label: 'Audio', url: '/audio' },
      { id: '3', label: 'Video', url: '/video' },
      { id: '4', label: 'PDFs', url: '/pdfs' },
      { id: '5', label: 'About', url: '/about' },
      { id: '6', label: 'Contact', url: '/contact' },
    ],
    newsletterEnabled: true,
  });

  useEffect(() => {
    appearance.get()
      .then(res => {
        const d = res.data;
        if (d) {
          setData(prev => ({
            ...prev,
            platformName: d.platformName ?? prev.platformName,
            description: d.footerDescription ?? prev.description,
            copyright: d.copyrightText ?? prev.copyright,
            socialLinks: d.socialLinks && d.socialLinks.length > 0
              ? DEFAULT_SOCIALS.map(def => {
                  const existing = d.socialLinks.find((s: SocialLink) => s.platform === def.platform);
                  return existing ?? def;
                })
              : prev.socialLinks,
            contactEmail: d.contactEmail ?? prev.contactEmail,
            address: d.address ?? prev.address,
            quickLinks: d.quickLinks && d.quickLinks.length > 0 ? d.quickLinks : prev.quickLinks,
            newsletterEnabled: d.newsletterEnabled ?? prev.newsletterEnabled,
          }));
        }
      })
      .catch(() => setError('Failed to load footer settings'))
      .finally(() => setLoading(false));
  }, []);

  const update = (partial: Partial<FooterData>) => setData(prev => ({ ...prev, ...partial }));

  const updateSocial = (platform: string, url: string) => {
    const updated = data.socialLinks.map(s => s.platform === platform ? { ...s, url } : s);
    update({ socialLinks: updated });
  };

  const addQuickLink = () => {
    const newLink: QuickLink = { id: String(Date.now()), label: '', url: '' };
    update({ quickLinks: [...data.quickLinks, newLink] });
  };

  const updateQuickLink = (id: string, field: keyof QuickLink, value: string) => {
    const updated = data.quickLinks.map(l => l.id === id ? { ...l, [field]: value } : l);
    update({ quickLinks: updated });
  };

  const removeQuickLink = (id: string) => {
    update({ quickLinks: data.quickLinks.filter(l => l.id !== id) });
  };

  const moveQuickLink = (index: number, direction: 'up' | 'down') => {
    const list = [...data.quickLinks];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    update({ quickLinks: list });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const payload: Record<string, any> = {
        platformName: data.platformName,
        footerDescription: data.description,
        copyrightText: data.copyright,
        socialLinks: data.socialLinks,
        contactEmail: data.contactEmail,
        address: data.address,
        quickLinks: data.quickLinks,
        newsletterEnabled: data.newsletterEnabled,
      };
      await appearance.update(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save settings');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-icc-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Pen className="w-6 h-6 text-icc-500" />
            Footer Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Customize your website footer — branding, links, social media, and more
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-lg shadow-icc-500/20"
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
        <div className="flex items-center gap-2 p-3 rounded-xl bg-icc-500/10 border border-icc-500/20 text-icc-500 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" /> Settings saved successfully!
        </div>
      )}

      {/* Branding */}
      <SectionCard icon={Globe} title="Branding" subtitle="Platform name, description, and copyright">
        <div className="space-y-5">
          <TextField label="Platform Name" value={data.platformName} onChange={(v) => update({ platformName: v })} placeholder="My Islamic Platform" />
          <TextAreaField label="Description" value={data.description} onChange={(v) => update({ description: v })} placeholder="Brief description of your platform" />
          <TextField label="Copyright Text" value={data.copyright} onChange={(v) => update({ copyright: v })} placeholder="© 2024 All rights reserved." />
        </div>
      </SectionCard>

      {/* Contact */}
      <SectionCard icon={Mail} title="Contact Information" subtitle="Email and physical address">
        <div className="space-y-5">
          <TextField label="Contact Email" value={data.contactEmail} onChange={(v) => update({ contactEmail: v })} placeholder="info@example.com" type="email" />
          <TextAreaField label="Address" value={data.address} onChange={(v) => update({ address: v })} placeholder="Full address or location" />
        </div>
      </SectionCard>

      {/* Social Links */}
      <SectionCard icon={Globe} title="Social Media Links" subtitle="Connect your social media profiles">
        <div className="space-y-4">
          {data.socialLinks.map((social) => (
            <div key={social.platform} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <div className={`p-2 rounded-lg border shrink-0 ${SOCIAL_COLORS[social.icon] || 'bg-gray-500/10 text-gray-400'}`}>
                <MessageSquare className="w-4 h-4" />
              </div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 w-24 shrink-0">{social.platform}</label>
              <input
                type="url"
                value={social.url}
                onChange={(e) => updateSocial(social.platform, e.target.value)}
                placeholder={`${social.platform} URL...`}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all"
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Quick Links */}
      <SectionCard icon={MapPin} title="Quick Links" subtitle="Manage footer navigation links">
        <div className="space-y-3">
          {data.quickLinks.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">{t('admin.no_quick_links')}</div>
          ) : (
            data.quickLinks.map((link, index) => (
              <div key={link.id} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveQuickLink(index, 'up')} disabled={index === 0} className="p-0.5 rounded text-gray-400 hover:text-icc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button onClick={() => moveQuickLink(index, 'down')} disabled={index === data.quickLinks.length - 1} className="p-0.5 rounded text-gray-400 hover:text-icc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                <GripVertical className="w-4 h-4 text-gray-400 shrink-0 cursor-grab" />
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateQuickLink(link.id, 'label', e.target.value)}
                  placeholder="Link label"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => updateQuickLink(link.id, 'url', e.target.value)}
                  placeholder="/url"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all"
                />
                <button onClick={() => removeQuickLink(link.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
          <button onClick={addQuickLink} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 text-white text-sm font-semibold transition-all">
            <Plus className="w-4 h-4" /> Add Quick Link
          </button>
        </div>
      </SectionCard>

      {/* Newsletter */}
      <SectionCard icon={MessageSquare} title="Newsletter" subtitle="Email newsletter signup toggle">
        <div className="space-y-5">
          <ToggleRow label="Enable Newsletter Section" desc="Show email subscription form in footer" checked={data.newsletterEnabled} onChange={(v) => update({ newsletterEnabled: v })} />
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
          <div className="p-2 rounded-lg bg-icc-500/10 text-icc-400">
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
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-icc-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${checked ? 'translate-x-[18px]' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <input
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all resize-none"
      />
    </div>
  );
}
