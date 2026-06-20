import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit3, Trash2, Library, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { series as seriesApi, admin as adminApi } from '../../lib/api';
import toast from 'react-hot-toast';

interface SeriesItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  totalLessons?: number;
  totalHours?: number;
  order?: number;
}

export default function SeriesManagement() {
  const { t } = useTranslation();
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SeriesItem | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image: '', order: 0 });

  const fetchData = () => {
    setLoading(true);
    seriesApi.getAll().then(res => {
      setSeries(res.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', image: '', order: 0 });
    setShowModal(true);
  };

  const openEdit = (item: SeriesItem) => {
    setEditing(item);
    setForm({ name: item.name, slug: item.slug, description: item.description || '', image: item.image || '', order: item.order || 0 });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await adminApi.lessons.update(editing.id, form);
        toast.success(t('admin.series_updated'));
      } else {
        await adminApi.lessons.create(form);
        toast.success(t('admin.series_created'));
      }
      setShowModal(false);
      fetchData();
    } catch {
      toast.error(t('admin.series_failed'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.confirm_delete'))) return;
    try {
      await adminApi.lessons.delete(id);
      toast.success(t('admin.series_deleted'));
      fetchData();
    } catch {
      toast.error(t('admin.series_delete_failed'));
    }
  };

  if (loading) return <div className="animate-spin rounded-full h-12 w-12 border-4 border-icc-500 border-t-transparent mx-auto mt-20" />;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Library className="w-6 h-6 text-icc-400" /> {t('admin.study_series')}
        </h1>
        <button onClick={openCreate} className="btn-icc text-sm px-4 py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('admin.create_series')}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {series.map((s) => (
          <div key={s.id} className="glass-premium p-5 rounded-xl">
            {s.image && (
              <img src={s.image} alt={s.name} className="w-full h-32 object-cover rounded-lg mb-3" />
            )}
            <h3 className="text-lg font-semibold text-white">{s.name}</h3>
            {s.description && <p className="text-sm text-white/40 mt-1 line-clamp-2">{s.description}</p>}
            <div className="flex items-center gap-3 mt-3 text-xs text-white/40">
              <span>{s.totalLessons || 0} {t('admin.lessons')}</span>
              {s.totalHours ? <span>{s.totalHours}h</span> : null}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button onClick={() => openEdit(s)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-icc-400 hover:bg-icc-500/10 transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-surface-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">
              {editing ? t('admin.edit_series') : t('admin.create_series')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">{t('admin.name')}</label>
                <input
                  type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-icc-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">{t('admin.slug')}</label>
                <input
                  type="text" value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-icc-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">{t('admin.description')}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-icc-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">{t('admin.cover_image')}</label>
                <input
                  type="text" value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-icc-500/50"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={handleSave} className="btn-icc text-sm px-5 py-2.5 flex-1">
                {t('admin.save')}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-outline text-sm px-5 py-2.5 flex-1">
                {t('admin.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
