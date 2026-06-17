import { useState, useEffect, useCallback } from 'react';
import { HiPlus, HiPencil, HiTrash, HiMenu } from 'react-icons/hi';
import { FaTelegramPlane } from 'react-icons/fa';
import { admin } from '../../lib/api';
import { AdminModal, ConfirmDeleteModal } from '../../components/admin';
import toast from 'react-hot-toast';

const CATEGORIES = ['RIYADH', 'TAFSIR', 'BULUGH', 'TAJREED', 'USUL', 'BAYQUNIYYAH', 'TAWHEED', 'General'];

interface TelegramChannel {
  id?: number;
  name: string;
  link: string;
  teacherName: string;
  description: string;
  category: string;
  enabled: boolean;
  order?: number;
}

const emptyForm: TelegramChannel = { name: '', link: '', teacherName: 'Sheikh Muhammad Zabuur', description: '', category: 'General', enabled: true };

export default function AdminTelegramChannels() {
  const [items, setItems] = useState<TelegramChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<TelegramChannel>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    admin.telegram.getAll()
      .then((res) => setItems(res.data ?? []))
      .catch(() => toast.error('Failed to load Telegram channels'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load() }, [load]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: TelegramChannel, index: number) => {
    setEditId(item.id ?? index);
    setForm(item);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.link.trim()) { toast.error('Name and link are required'); return; }
    setSaving(true);
    try {
      if (editId !== null) {
        await admin.telegram.update(editId, form);
        toast.success('Channel updated');
      } else {
        await admin.telegram.create(form);
        toast.success('Channel created');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async (id: number) => {
    try {
      await admin.telegram.toggleEnabled(id);
      toast.success('Status toggled');
      load();
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleteLoading(true);
    try {
      await admin.telegram.delete(deleteId);
      toast.success('Channel deleted');
      setDeleteId(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDragStart = (idx: number) => setDragIndex(idx);
  const handleDragOver = (idx: number) => { if (dragIndex !== null && dragIndex !== idx) setOverIndex(idx); };
  const handleDragLeave = () => setOverIndex(null);
  const handleDrop = async () => {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) { setDragIndex(null); setOverIndex(null); return; }
    const reordered = [...items];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(overIndex, 0, moved);
    setItems(reordered);
    setDragIndex(null);
    setOverIndex(null);
    try {
      await admin.telegram.reorder(reordered.map((i: TelegramChannel) => i.id!));
      toast.success('Reordered');
    } catch { toast.error('Failed to save order'); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Telegram Channels</h1>
        <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2 self-start">
          <HiPlus className="w-5 h-5" /> Add Channel
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FaTelegramPlane className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>No Telegram channels added yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-3 w-10"></th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Link</th>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={item.id ?? i}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={() => handleDragOver(i)}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${overIndex === i ? 'ring-2 ring-primary-500' : ''}`}
                  >
                    <td className="px-4 py-3 cursor-grab active:cursor-grabbing text-gray-400">
                      <HiMenu className="w-4 h-4" />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <FaTelegramPlane className="w-4 h-4 text-blue-500" />
                        {item.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{item.link}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.teacherName || '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => item.id && handleToggleEnabled(item.id)}
                        className={`${(item.enabled ?? true) ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
                      >
                        <span className={`${(item.enabled ?? true) ? 'translate-x-[18px]' : 'translate-x-[2px]'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(item, i)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-primary-600 transition-colors">
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(item.id ?? i)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600 transition-colors">
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId !== null ? 'Edit Telegram Channel' : 'Add Telegram Channel'}
        size="md"
      >
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Channel Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telegram Link</label>
            <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input-field" placeholder="https://t.me/..." required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teacher Name</label>
            <input value={form.teacherName} onChange={(e) => setForm({ ...form, teacherName: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Enabled</label>
            <button
              type="button"
              onClick={() => setForm({ ...form, enabled: !form.enabled })}
              className={`${form.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
            >
              <span className={`${form.enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
              {editId !== null ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDeleteModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Channel"
        entityName="Channel"
        loading={deleteLoading}
      />
    </div>
  );
}
