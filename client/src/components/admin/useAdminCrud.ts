import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface CrudApi<T> {
  getAll: (params?: any) => Promise<{ data: { items?: T[]; totalPages?: number } & T[] }>;
  create: (data: any) => Promise<any>;
  update: (id: number, data: any) => Promise<any>;
  delete: (id: number) => Promise<any>;
}

interface UseAdminCrudOptions {
  fetchOnMount?: boolean;
  defaultLimit?: number;
}

export function useAdminCrud<T extends { id: number }>(
  api: CrudApi<T>,
  entityName: string,
  emptyForm: any,
  options: UseAdminCrudOptions = {}
) {
  const { fetchOnMount = true, defaultLimit = 10 } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(fetchOnMount);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.getAll({ search, page, limit: defaultLimit })
      .then((res) => {
        setItems(res.data.items ?? res.data);
        setTotalPages(res.data.totalPages ?? 1);
      })
      .catch(() => toast.error('Failed to load ' + entityName))
      .finally(() => setLoading(false));
  }, [api, search, page, defaultLimit, entityName]);

  useEffect(() => {
    if (fetchOnMount) load();
  }, [load, fetchOnMount]);

  // Reset page when search changes
  const prevSearch = useState(search);
  useEffect(() => {
    if (search !== prevSearch[0]) {
      setPage(1);
      prevSearch[0] = search;
    }
  }, [search]);

  const openCreate = useCallback(() => {
    setEditId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  }, [emptyForm]);

  const openEdit = useCallback((item: T, mapper: (item: T) => any) => {
    setEditId(item.id);
    setForm(mapper(item));
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(async (e: React.FormEvent, preProcess?: (form: any) => any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = preProcess ? preProcess(form) : form;
      if (editId) {
        await api.update(editId, payload);
        toast.success(entityName + ' updated');
      } else {
        await api.create(payload);
        toast.success(entityName + ' created');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [api, editId, form, load, entityName]);

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    setDeleteLoading(true);
    try {
      await api.delete(deleteId);
      toast.success(entityName + ' deleted');
      setDeleteId(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  }, [api, deleteId, load, entityName]);

  return {
    items, setItems,
    loading, setLoading,
    search, setSearch,
    page, setPage,
    totalPages, setTotalPages,
    modalOpen, setModalOpen,
    editId, setEditId,
    form, setForm,
    saving, setSaving,
    deleteId, setDeleteId,
    deleteLoading, setDeleteLoading,
    load,
    openCreate,
    openEdit,
    handleSave,
    handleDelete,
  };
}
