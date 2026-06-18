import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Save, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import { scholarProfile } from '../../lib/api';
import { useTranslation } from '../../i18n';
import toast from 'react-hot-toast';
import type { ScholarProfile as ScholarProfileType } from '../../types';

export default function AdminScholarProfile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ScholarProfileType | null>(null);
  const [form, setForm] = useState({
    name: '',
    title: '',
    biography: '',
    shortBiography: '',
    profileImage: '',
    coverImage: '',
    yearsActive: 0,
    youtubeUrl: '',
    telegramUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    websiteUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    scholarProfile.get().then(r => {
      setProfile(r.data);
      setForm({
        name: r.data.name || '',
        title: r.data.title || '',
        biography: r.data.biography || '',
        shortBiography: r.data.shortBiography || '',
        profileImage: r.data.profileImage || '',
        coverImage: r.data.coverImage || '',
        yearsActive: r.data.yearsActive || 0,
        youtubeUrl: r.data.youtubeUrl || '',
        telegramUrl: r.data.telegramUrl || '',
        facebookUrl: r.data.facebookUrl || '',
        tiktokUrl: r.data.tiktokUrl || '',
        websiteUrl: r.data.websiteUrl || '',
      });
    }).catch(() => {
      toast.error('Failed to load scholar profile');
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await scholarProfile.update(form);
      setProfile(res.data);
      toast.success('Scholar profile updated');
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
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icc-500 to-icc-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Scholar Profile</h1>
            <p className="text-sm text-gray-500">Manage Sheikh Mohammed Zabuur's profile</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Biography</label>
            <textarea value={form.shortBiography} onChange={e => setForm(f => ({ ...f, shortBiography: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Biography</label>
            <textarea value={form.biography} onChange={e => setForm(f => ({ ...f, biography: e.target.value }))} rows={6} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Image URL</label>
            <input value={form.profileImage} onChange={e => setForm(f => ({ ...f, profileImage: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image URL</label>
            <input value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YouTube URL</label>
            <input value={form.youtubeUrl} onChange={e => setForm(f => ({ ...f, youtubeUrl: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telegram URL</label>
            <input value={form.telegramUrl} onChange={e => setForm(f => ({ ...f, telegramUrl: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook URL</label>
            <input value={form.facebookUrl} onChange={e => setForm(f => ({ ...f, facebookUrl: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TikTok URL</label>
            <input value={form.tiktokUrl} onChange={e => setForm(f => ({ ...f, tiktokUrl: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website URL</label>
            <input value={form.websiteUrl} onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years Active</label>
            <input type="number" value={form.yearsActive} onChange={e => setForm(f => ({ ...f, yearsActive: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-icc-500 min-h-[44px]" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-icc-500 hover:bg-icc-400 text-white text-sm font-medium transition-all disabled:opacity-50 min-h-[44px]">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
