import { useState, useEffect } from 'react';
import { HiBell, HiMail, HiGlobe, HiTrash, HiUsers, HiUser, HiPaperAirplane, HiCheck, HiClock } from 'react-icons/hi';
import { admin } from '../../lib/api';
import { AdminTable, ConfirmDeleteModal } from '../../components/admin';
import toast from 'react-hot-toast';

interface NotificationItem {
  id: number;
  title: string;
  body: string;
  type: 'SITE' | 'EMAIL';
  audience: 'ALL' | 'SPECIFIC';
  targetUserId?: number;
  targetUserName?: string;
  readCount: number;
  status: 'SENT' | 'PENDING' | 'FAILED';
  createdAt: string;
}

type Tab = 'send' | 'history';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  SENT: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  FAILED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

export default function AdminNotifications() {
  const [tab, setTab] = useState<Tab>('send');
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [targetUserId, setTargetUserId] = useState('');
  const [type, setType] = useState<'SITE' | 'EMAIL'>('SITE');
  const [sending, setSending] = useState(false);

  const loadHistory = () => {
    setLoading(true);
    admin.notifications.getAll({ page, limit: 10 })
      .then((res) => {
        const data = Array.isArray(res.data) ? { items: res.data } : res.data;
        setItems(data.items ?? []);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => toast.error('Failed to load notification history'))
      .finally(() => setLoading(false));
  };

  const loadUnreadCount = () => {
    admin.notifications.getAll({ page: 1, limit: 1, unread: true })
      .then((res) => {
        setUnreadCount(res.data.total ?? 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (tab === 'history') loadHistory();
    loadUnreadCount();
  }, [tab, page]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in title and body');
      return;
    }
    setSending(true);
    try {
      await admin.notifications.create({
        title: title.trim(),
        body: body.trim(),
        type,
        audience,
        targetUserId: audience === 'SPECIFIC' && targetUserId ? parseInt(targetUserId) : undefined,
      });
      toast.success('Notification sent successfully');
      setTitle('');
      setBody('');
      setTargetUserId('');
      setAudience('ALL');
      setType('SITE');
      loadUnreadCount();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await admin.notifications.delete(deleteId);
      toast.success('Notification deleted');
      setDeleteId(null);
      loadHistory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'title', header: 'Title',
      render: (item: NotificationItem) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-200">{item.title}</p>
          <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.body}</p>
        </div>
      ),
    },
    {
      key: 'audience', header: 'Audience',
      render: (item: NotificationItem) => (
        <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
          {item.audience === 'ALL' ? <HiGlobe className="w-3.5 h-3.5" /> : <HiUser className="w-3.5 h-3.5" />}
          {item.audience === 'ALL' ? 'All Users' : item.targetUserName || 'Specific User'}
        </span>
      ),
    },
    {
      key: 'type', header: 'Type',
      render: (item: NotificationItem) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {item.type === 'EMAIL' ? <HiMail className="w-3 h-3" /> : <HiBell className="w-3 h-3" />}
          {item.type}
        </span>
      ),
    },
    {
      key: 'createdAt', header: 'Sent Date',
      render: (item: NotificationItem) => (
        <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      ),
    },
    {
      key: 'readCount', header: 'Read',
      className: 'text-center',
      render: (item: NotificationItem) => (
        <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <HiCheck className="w-3.5 h-3.5" />
          {item.readCount ?? 0}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (item: NotificationItem) => {
        const s = STATUS_STYLES[item.status] || STATUS_STYLES.PENDING;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
            {item.status}
          </span>
        );
      },
    },
    {
      key: 'actions', header: '', className: 'text-right',
      render: (item: NotificationItem) => (
        <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600 transition-colors">
          <HiTrash className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notification Center</h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => { setTab('send'); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            tab === 'send' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <HiPaperAirplane className="w-4 h-4 inline mr-1.5" />
          Send Notification
        </button>
        <button
          onClick={() => { setTab('history'); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            tab === 'history' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <HiClock className="w-4 h-4 inline mr-1.5" />
          History
        </button>
      </div>

      {tab === 'send' ? (
        <div className="max-w-2xl bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Notification title" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Body <span className="text-red-500">*</span></label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} className="input-field" rows={4} placeholder="Write your notification message..." required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target Audience</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAudience('ALL')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      audience === 'ALL'
                        ? 'border-icc-500 bg-icc-50 dark:bg-icc-900/20 text-icc-700 dark:text-icc-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <HiUsers className="w-4 h-4" /> All Users
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudience('SPECIFIC')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      audience === 'SPECIFIC'
                        ? 'border-icc-500 bg-icc-50 dark:bg-icc-900/20 text-icc-700 dark:text-icc-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <HiUser className="w-4 h-4" /> Specific User
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notification Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType('SITE')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      type === 'SITE'
                        ? 'border-icc-500 bg-icc-50 dark:bg-icc-900/20 text-icc-700 dark:text-icc-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <HiBell className="w-4 h-4" /> Site
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('EMAIL')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      type === 'EMAIL'
                        ? 'border-icc-500 bg-icc-50 dark:bg-icc-900/20 text-icc-700 dark:text-icc-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <HiMail className="w-4 h-4" /> Email
                  </button>
                </div>
              </div>
            </div>
            {audience === 'SPECIFIC' && (
              <div>
                <label className="block text-sm font-medium mb-1">Target User ID</label>
                <input
                  type="number"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="input-field"
                  placeholder="Enter user ID"
                />
              </div>
            )}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button type="submit" disabled={sending} className="btn-primary inline-flex items-center gap-2">
                {sending && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                <HiPaperAirplane className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <AdminTable
          columns={columns}
          data={items}
          loading={loading}
          searchable={false}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage="No notifications sent yet"
        />
      )}

      <ConfirmDeleteModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Notification"
        entityName="Notification"
        loading={deleteLoading}
      />
    </div>
  );
}
