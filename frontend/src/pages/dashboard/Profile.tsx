import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { dashboard } from '../../lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dashboard.updateProfile({ name });
      toast.success(t('my_library.profile_updated'));
    } catch {
      toast.error(t('my_library.profile_failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/60 mb-6">
        <ArrowLeft className="w-4 h-4" /> {t('my_library.back')}
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-icc-400" /> {t('my_library.profile')}
      </h1>

      <div className="glass-premium p-6 rounded-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">{t('my_library.name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-icc-500/50 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">{t('my_library.email')}</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-icc flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? t('my_library.saving') : t('my_library.save')}
        </button>
      </div>
    </div>
  );
}
