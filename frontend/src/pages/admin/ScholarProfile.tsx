import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Save, RefreshCw, Upload, Image, Plus, X } from 'lucide-react';
import { scholarProfile } from '../../lib/api';
import { useTranslation } from '../../i18n';
import toast from 'react-hot-toast';

interface ScholarForm {
  name: string; arabicName: string; title: string; biography: string; shortBiography: string;
  profileImage: string; coverImage: string; yearsActive: number;
  youtubeUrl: string; telegramUrl: string; facebookUrl: string; tiktokUrl: string; websiteUrl: string; twitterUrl: string; instagramUrl: string;
  teachingSchedule: string[]; qualifications: string[]; areasOfStudy: string[];
}

export default function AdminScholarProfile() {
  const { t } = useTranslation();
  const [form, setForm] = useState<ScholarForm>({
    name: '', arabicName: '', title: '', biography: '', shortBiography: '',
    profileImage: '', coverImage: '', yearsActive: 0,
    youtubeUrl: '', telegramUrl: '', facebookUrl: '', tiktokUrl: '', websiteUrl: '', twitterUrl: '', instagramUrl: '',
    teachingSchedule: [], qualifications: [], areasOfStudy: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    scholarProfile.get().then(r => {
      const d = r.data;
      setForm({
        name: d.name || '', arabicName: d.arabicName || '', title: d.title || '',
        biography: d.biography || '', shortBiography: d.shortBiography || '',
        profileImage: d.profileImage || '', coverImage: d.coverImage || '',
        yearsActive: d.yearsActive || 0,
        youtubeUrl: d.youtubeUrl || '', telegramUrl: d.telegramUrl || '', facebookUrl: d.facebookUrl || '',
        tiktokUrl: d.tiktokUrl || '', websiteUrl: d.websiteUrl || '', twitterUrl: d.twitterUrl || '', instagramUrl: d.instagramUrl || '',
        teachingSchedule: Array.isArray(d.teachingSchedule) ? d.teachingSchedule : [],
        qualifications: Array.isArray(d.qualifications) ? d.qualifications : [],
        areasOfStudy: Array.isArray(d.areasOfStudy) ? d.areasOfStudy : [],
      });
    }).catch(() => {
      toast.error('Failed to load scholar profile');
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await scholarProfile.update(form);
      setForm(prev => ({ ...prev, ...res.data }));
      toast.success('Scholar profile updated');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleUpload = async (type: 'profile' | 'cover', file: File) => {
    setUploading(type);
    try {
      const res = await scholarProfile.uploadImage(type, file);
      setForm(prev => ({ ...prev, [type === 'profile' ? 'profileImage' : 'coverImage']: res.data.url }));
      toast.success(`${type} image uploaded`);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(null); }
  };

  const triggerFile = (type: 'profile' | 'cover') => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = (e: any) => { const file = e.target?.files?.[0]; if (file) handleUpload(type, file); };
    input.click();
  };

  const addArrayItem = (field: 'teachingSchedule' | 'qualifications' | 'areasOfStudy') => {
    setForm(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };
  const removeArrayItem = (field: 'teachingSchedule' | 'qualifications' | 'areasOfStudy', idx: number) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
  };
  const updateArrayItem = (field: 'teachingSchedule' | 'qualifications' | 'areasOfStudy', idx: number, val: string) => {
    setForm(prev => {
      const arr = [...prev[field]]; arr[idx] = val; return { ...prev, [field]: arr };
    });
  };

  if (loading) {
    return <div className="space-y-6 animate-pulse"><div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" /><div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />)}</div></div></div>;
  }

  const Input = (p: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label><input type={p.type || 'text'} value={p.value} onChange={e => p.onChange(e.target.value)} placeholder={p.placeholder} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" /></div>
  );
  const Textarea = (p: { label: string; value: string; onChange: (v: string) => void; rows?: number }) => (
    <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label><textarea value={p.value} onChange={e => p.onChange(e.target.value)} rows={p.rows || 3} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500" /></div>
  );
  const ImageField = (p: { label: string; value: string; onChange: (v: string) => void; type: 'profile' | 'cover' }) => (
    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label><div className="flex items-center gap-3">{p.value ? <img src={p.value} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-200 dark:border-gray-700" /> : <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"><Image className="w-5 h-5 text-gray-400" /></div>}<div className="flex-1 min-w-0"><input value={p.value} onChange={e => p.onChange(e.target.value)} placeholder="Image URL" className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-icc-500 mb-1.5" /><button onClick={() => triggerFile(p.type)} disabled={uploading === p.type} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-icc-500/10 text-icc-600 dark:text-icc-400 text-xs font-medium hover:bg-icc-500/20 transition-all min-h-[36px]">{uploading === p.type ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}{uploading === p.type ? 'Uploading...' : 'Upload Image'}</button></div></div></div>
  );
  const ArrayField = (p: { label: string; items: string[]; field: 'teachingSchedule' | 'qualifications' | 'areasOfStudy'; placeholder?: string }) => (
    <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{p.label}</label><div className="space-y-2">{p.items.map((item, i) => <div key={i} className="flex items-center gap-2"><input value={item} onChange={e => updateArrayItem(p.field, i, e.target.value)} placeholder={p.placeholder || `Item ${i + 1}`} className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" /><button onClick={() => removeArrayItem(p.field, i)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-4 h-4" /></button></div>)}<button onClick={() => addArrayItem(p.field)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-icc-500/10 text-icc-600 dark:text-icc-400 text-xs font-medium hover:bg-icc-500/20 transition-all min-h-[36px]"><Plus className="w-3.5 h-3.5" />Add {p.label}</button></div></div>
  );

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icc-500 to-icc-600 flex items-center justify-center"><UserCheck className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-lg font-bold text-gray-900 dark:text-white">Scholar Profile</h1><p className="text-sm text-gray-500">Manage Sheikh Mohammed Zabuur's profile</p></div>
        </div>

        {/* Basic Info */}
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Input label="Name (English)" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <Input label="Name (Arabic)" value={form.arabicName} onChange={v => setForm(f => ({ ...f, arabicName: v }))} placeholder="الشيخ محمد زبور" />
          <Input label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />
          <Input label="Years Active" value={String(form.yearsActive)} onChange={v => setForm(f => ({ ...f, yearsActive: Number(v) }))} type="number" />
          <Textarea label="Short Biography" value={form.shortBiography} onChange={v => setForm(f => ({ ...f, shortBiography: v }))} rows={2} />
          <Textarea label="Full Biography" value={form.biography} onChange={v => setForm(f => ({ ...f, biography: v }))} rows={5} />
        </div>

        {/* Images */}
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Photos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <ImageField label="Profile Image" value={form.profileImage} onChange={v => setForm(f => ({ ...f, profileImage: v }))} type="profile" />
          <ImageField label="Cover Image" value={form.coverImage} onChange={v => setForm(f => ({ ...f, coverImage: v }))} type="cover" />
        </div>

        {/* Scholar Details */}
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Scholar Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <ArrayField label="Teaching Schedule" items={form.teachingSchedule} field="teachingSchedule" placeholder="e.g. Fajr: Tafsir (6:00 AM)" />
          <ArrayField label="Qualifications" items={form.qualifications} field="qualifications" placeholder="e.g. PhD in Islamic Studies" />
          <div className="md:col-span-2"><ArrayField label="Areas of Study" items={form.areasOfStudy} field="areasOfStudy" placeholder="e.g. Tafsir, Hadith, Fiqh" /></div>
        </div>

        {/* Social Links */}
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Input label="YouTube URL" value={form.youtubeUrl} onChange={v => setForm(f => ({ ...f, youtubeUrl: v }))} />
          <Input label="Telegram URL" value={form.telegramUrl} onChange={v => setForm(f => ({ ...f, telegramUrl: v }))} />
          <Input label="Facebook URL" value={form.facebookUrl} onChange={v => setForm(f => ({ ...f, facebookUrl: v }))} />
          <Input label="TikTok URL" value={form.tiktokUrl} onChange={v => setForm(f => ({ ...f, tiktokUrl: v }))} />
          <Input label="Twitter / X URL" value={form.twitterUrl} onChange={v => setForm(f => ({ ...f, twitterUrl: v }))} />
          <Input label="Instagram URL" value={form.instagramUrl} onChange={v => setForm(f => ({ ...f, instagramUrl: v }))} />
          <Input label="Website URL" value={form.websiteUrl} onChange={v => setForm(f => ({ ...f, websiteUrl: v }))} />
        </div>

        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-400 text-white text-sm font-medium transition-all disabled:opacity-50 min-h-[44px]">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Changes
        </button>
      </motion.div>
    </div>
  );
}
