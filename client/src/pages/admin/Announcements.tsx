import { useState, useEffect } from 'react';
import { HiPlus, HiTrash, HiPencil, HiCalendar, HiTag, HiChevronDown, HiChevronUp, HiEye } from 'react-icons/hi';
import api from '../../lib/api';
import { AdminModal, ConfirmDeleteModal } from '../../components/admin';
import toast from 'react-hot-toast';

interface Announcement {
  id: number;
  title: string;
  content: string;
  category: string;
  published: boolean;
  createdAt: string;
}

interface FormData {
  title: string;
  content: string;
  category: string;
  published: boolean;
}

const emptyForm: FormData = { title: '', content: '', category: 'General', published: true };
const CATEGORIES = ['General', 'Update', 'Event', 'Maintenance', 'Feature', 'Important'];

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    const params: any = {};
    if (search) params.search = search;
    if (filterCategory) params.category = filterCategory;
    if (filterStatus !== '') params.published = filterStatus;
    api.get('/announcements', { params })
      .then((res) => { setItems(res.data.items ?? res.data) })
      .catch(() => setError('Failed to load announcements'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load() }, [search, filterCategory, filterStatus]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: Announcement) => {
    setEditId(item.id);
    setForm({ title: item.title, content: item.content, category: item.category, published: item.published });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/announcements/${editId}`, form);
        toast.success('Announcement updated');
      } else {
        await api.post('/announcements', form);
        toast.success('Announcement created');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/announcements/${deleteId}`);
      toast.success('Announcement deleted');
      setDeleteId(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const CATEGORY_COLORS: Record<string, string> = {
    General: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    Update: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    Event: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    Maintenance: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    Feature: 'bg-icc-100 dark:bg-icc-900/30 text-icc-700 dark:text-icc-400',
    Important: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-icc-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <HiEye className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={load} className="px-5 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-400 text-white text-sm font-semibold transition-all">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2 self-start">
          <HiPlus className="w-5 h-5" /> Create Announcement
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <input type="text" placeholder="Search announcements..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-4 py-2 text-sm w-full" />
        </div>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); }} className="input-field py-2 text-sm w-auto">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); }} className="input-field py-2 text-sm w-auto">
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          No announcements yet
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const catColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.General;
            return (
              <div key={item.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-200">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${catColor}`}>
                          <HiTag className="w-3 h-3 mr-1" />
                          {item.category}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.published ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                          {item.published ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <HiCalendar className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                      <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${expandedId === item.id ? '' : 'line-clamp-2'}`}>
                        {item.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleExpand(item.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-primary-600 transition-colors">
                        {expandedId === item.id ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-primary-600 transition-colors">
                        <HiPencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600 transition-colors">
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Announcement' : 'Create Announcement'} size="lg">
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Announcement title" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input-field">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content <span className="text-red-500">*</span></label>
            <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="input-field" rows={6} placeholder="Write announcement content..." required />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
            <label htmlFor="published" className="text-sm font-medium">Published</label>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
              {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDeleteModal open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Announcement" entityName="Announcement" loading={deleteLoading} />
    </div>
  );
}
