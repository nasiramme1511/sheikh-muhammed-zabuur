import { useState, useEffect } from 'react';
import { HiPlus, HiTrash, HiKey, HiSearch } from 'react-icons/hi';
import { admin } from '../../lib/api';
import api from '../../lib/api';
import { AdminTable, AdminModal, ConfirmDeleteModal } from '../../components/admin';
import toast from 'react-hot-toast';

interface PermissionItem {
  id: number;
  action: string;
  description: string;
  module: string;
  _count?: { rolePermissions: number };
  assignedRoles?: number;
}

interface FormData {
  action: string;
  description: string;
  module: string;
}

const emptyForm: FormData = { action: '', description: '', module: 'Content' };

const MODULES = ['Content', 'Users', 'System', 'Communication', 'Analytics', 'Appearance', 'Roles'];

export default function AdminPermissions() {
  const [items, setItems] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/permissions', { params: { search, page, limit: 10 } })
      .then((res) => {
        const data = res.data;
        setItems(data.items ?? data);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => toast.error('Failed to load permissions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load() }, [search, page]);

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.action.trim() || !form.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await api.post('/admin/permissions', form);
      toast.success('Permission created');
      setModalOpen(false);
      setPage(1);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create permission');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/permissions/${deleteId}`);
      toast.success('Permission deleted');
      setDeleteId(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', render: (item: PermissionItem) => <span className="text-gray-500 text-xs font-mono">#{item.id}</span> },
    {
      key: 'action', header: 'Action',
      render: (item: PermissionItem) => <span className="font-medium text-gray-800 dark:text-gray-200">{item.action}</span>,
    },
    { key: 'description', header: 'Description', render: (item: PermissionItem) => <span className="text-gray-500 max-w-[300px] truncate block">{item.description}</span> },
    {
      key: 'module', header: 'Module',
      render: (item: PermissionItem) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {item.module}
        </span>
      ),
    },
    {
      key: 'roles', header: 'Assigned Roles',
      className: 'text-center',
      render: (item: PermissionItem) => (
        <span className="inline-flex items-center gap-1 text-sm">
          <HiKey className="w-3.5 h-3.5 text-gray-400" />
          {item._count?.rolePermissions ?? item.assignedRoles ?? 0}
        </span>
      ),
    },
    {
      key: 'actions', header: '', className: 'text-right',
      render: (item: PermissionItem) => (
        <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600 transition-colors">
          <HiTrash className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Permission Management</h1>
        <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2 self-start">
          <HiPlus className="w-5 h-5" /> Create Permission
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={items}
        loading={loading}
        searchPlaceholder="Search permissions by action or description..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="No permissions found"
      />

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Permission"
        size="md"
      >
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Action <span className="text-red-500">*</span></label>
            <input
              value={form.action}
              onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
              className="input-field"
              placeholder="e.g. users.create"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Dot-notation format: module.verb</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input-field"
              rows={3}
              placeholder="Describe what this permission allows"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Module</label>
            <select
              value={form.module}
              onChange={(e) => setForm((f) => ({ ...f, module: e.target.value }))}
              className="input-field"
            >
              {MODULES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
              Create Permission
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDeleteModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Permission"
        entityName="Permission"
        loading={deleteLoading}
      />
    </div>
  );
}
