import { useState, useEffect } from 'react';
import { HiEye, HiTrash, HiCalendar, HiBookmark, HiPlay, HiShieldCheck } from 'react-icons/hi';
import { admin } from '../../lib/api';
import { AdminTable, AdminModal, ConfirmDeleteModal } from '../../components/admin';
import { renderActions } from '../../components/admin/helpers';
import toast from 'react-hot-toast';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  image?: string;
  createdAt: string;
  _count?: { bookmarks: number; progress: number };
  bookmarks?: { id: number; lesson: { title: string } }[];
  progress?: { id: number; lesson: { title: string }; completed: boolean }[];
}

const emptyForm = {};

export default function AdminUsers() {
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewUser, setViewUser] = useState<UserItem | null>(null);

  const load = () => {
    setLoading(true);
    admin.users.getAll({ search, page, limit: 10 })
      .then((res) => {
        setItems(res.data.items ?? res.data);
        setTotalPages(res.data.totalPages ?? 1);
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load() }, [search, page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await admin.users.delete(deleteId);
      toast.success('User deleted');
      setDeleteId(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  };

  const viewDetails = async (id: number) => {
    try {
      const res = await admin.users.getById(id);
      setViewUser(res.data);
    } catch {
      toast.error('Failed to load user details');
    }
  };

  const columns = [
    {
      key: 'user', header: 'User',
      render: (item: UserItem) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600">
            {item.name.charAt(0)}
          </div>
          <span className="font-medium">{item.name}</span>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (item: UserItem) => <span className="text-gray-500">{item.email}</span> },
    {
      key: 'role', header: 'Role',
      render: (item: UserItem) => item.role === 'ADMIN' ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
          <HiShieldCheck className="w-3 h-3" /> ADMIN
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">USER</span>
      ),
    },
    { key: 'joined', header: 'Joined', render: (item: UserItem) => <span className="text-gray-500 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span> },
    { key: 'bookmarks', header: 'Bookmarks', className: 'text-center', render: (item: UserItem) => item._count?.bookmarks ?? 0 },
    { key: 'progress', header: 'Progress', className: 'text-center', render: (item: UserItem) => item._count?.progress ?? 0 },
    {
      key: 'actions', header: '', className: 'text-right',
      render: (item: UserItem) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => viewDetails(item.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-primary-600 transition-colors">
            <HiEye className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600 transition-colors">
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      <AdminTable
        columns={columns}
        data={items}
        loading={loading}
        searchPlaceholder="Search by name or email..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="No users found"
      />

      {viewUser && (
        <AdminModal
          open={true}
          onClose={() => setViewUser(null)}
          title="User Details"
          size="md"
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl font-bold text-primary-600">
                {viewUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold">{viewUser.name}</h3>
                <p className="text-sm text-gray-500">{viewUser.email}</p>
                <span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ' + (viewUser.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>
                  {viewUser.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                <HiCalendar className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                <p className="text-lg font-bold">{new Date(viewUser.createdAt).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">Joined</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                <HiBookmark className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                <p className="text-lg font-bold">{viewUser._count?.bookmarks ?? 0}</p>
                <p className="text-xs text-gray-500">Bookmarks</p>
              </div>
            </div>

            {viewUser.bookmarks && viewUser.bookmarks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><HiBookmark className="w-4 h-4" /> Recent Bookmarks</h4>
                <div className="space-y-1">
                  {viewUser.bookmarks.slice(0, 5).map((b) => (
                    <div key={b.id} className="text-sm text-gray-600 dark:text-gray-400">{b.lesson?.title || 'Unknown lesson'}</div>
                  ))}
                </div>
              </div>
            )}

            {viewUser.progress && viewUser.progress.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><HiPlay className="w-4 h-4" /> Recent Progress</h4>
                <div className="space-y-1">
                  {viewUser.progress.slice(0, 5).map((p) => (
                    <div key={p.id} className="text-sm flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{p.lesson?.title || 'Unknown lesson'}</span>
                      {p.completed ? (
                        <span className="text-xs text-green-600">Completed</span>
                      ) : (
                        <span className="text-xs text-blue-600">In progress</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AdminModal>
      )}

      <ConfirmDeleteModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        entityName="User"
        loading={deleteLoading}
      />
    </div>
  );
}
