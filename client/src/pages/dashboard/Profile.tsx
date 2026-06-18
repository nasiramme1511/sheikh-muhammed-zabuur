import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiLockClosed, HiCamera } from 'react-icons/hi';
import { Save, Upload, Eye, EyeOff, User, ShieldCheck, BadgeCheck } from 'lucide-react';
import { dashboard } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import toast from 'react-hot-toast';

export default function DashboardProfile() {
  const { t } = useTranslation();
  const { user, login: refreshAuth } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [image, setImage] = useState(user?.image || '');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setImage(user.image || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await dashboard.updateProfile({ name, email, image });
      const updatedUser = res.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success(t('dashboard.profile_updated'));
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('dashboard.profile_update_failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error(t('dashboard.password_fields_required'));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t('dashboard.password_min_length'));
      return;
    }
    setChangingPassword(true);
    try {
      await dashboard.changePassword({ currentPassword, newPassword });
      toast.success(t('dashboard.password_changed'));
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('dashboard.password_change_failed'));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('dashboard.image_size_limit'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
      const { default: api } = await import('../../lib/api');
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImage(res.data.url);
      toast.success(t('dashboard.image_uploaded'));
    } catch {
      toast.error(t('dashboard.image_upload_failed'));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-icc-400" />
          {t('dashboard.my_profile')}
        </h1>
        <div className="flex items-center gap-2 text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          <BadgeCheck className="w-3.5 h-3.5 text-icc-400" />
          {user?.role || t('dashboard.role_fallback')}
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSaveProfile}
        className="glass-premium p-6 space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-icc-400 to-icc-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-2 ring-icc-500/20">
              {image ? (
                <img src={image} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || t('dashboard.avatar_fallback')
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-icc-500 flex items-center justify-center cursor-pointer hover:bg-icc-400 transition-colors shadow-lg shadow-icc-500/20">
              <HiCamera className="w-4 h-4 text-white" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-white font-medium text-lg">{user?.name}</p>
            <p className="text-sm text-white/40">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">{t('auth.name')}</label>
            <div className="relative">
              <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">{t('auth.email')}</label>
            <div className="relative">
              <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 text-sm"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-icc inline-flex items-center gap-2">
            {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
            <Save className="w-4 h-4" />
            {t('dashboard.save_changes')}
          </button>
        </div>
      </motion.form>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleChangePassword}
        className="glass-premium p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-icc-400" />
          {t('dashboard.change_password')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">{t('dashboard.current_password')}</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 text-sm"
                placeholder={t('dashboard.current_password_placeholder')}
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">{t('dashboard.new_password')}</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 text-sm"
                placeholder={t('dashboard.new_password_placeholder')}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={changingPassword} className="btn-icc inline-flex items-center gap-2">
            {changingPassword && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
            {t('dashboard.update_password')}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
