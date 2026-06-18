import { useState, useEffect } from 'react';
import { HiMail, HiUsers, HiPaperAirplane, HiTrash, HiSearch, HiTemplate, HiCheck, HiX } from 'react-icons/hi';
import { admin } from '../../lib/api';
import api from '../../lib/api';
import { AdminTable, ConfirmDeleteModal } from '../../components/admin';
import toast from 'react-hot-toast';
import { useTranslation } from '../../i18n';

interface Subscriber {
  id: number;
  email: string;
  language: string;
  createdAt: string;
  active: boolean;
}

interface NewsletterItem {
  id: number;
  subject: string;
  body: string;
  sentAt: string;
  recipients: number;
  status: string;
}

interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  campaignsSent: number;
}

type Tab = 'subscribers' | 'send';

export default function AdminNewsletter() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('subscribers');

  const [stats, setStats] = useState<NewsletterStats>({ totalSubscribers: 0, activeSubscribers: 0, campaignsSent: 0 });
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subsPage, setSubsPage] = useState(1);
  const [subsTotalPages, setSubsTotalPages] = useState(1);
  const [subsSearch, setSubsSearch] = useState('');

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [sending, setSending] = useState(false);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadStats = () => {
    api.get('/admin/newsletter/stats')
      .then((res) => setStats(res.data))
      .catch(() => {});
  };

  const loadSubscribers = () => {
    setSubsLoading(true);
    admin.newsletter.getAll({ search: subsSearch, page: subsPage, limit: 10 })
      .then((res) => {
        const data = Array.isArray(res.data) ? { items: res.data } : res.data;
        setSubscribers(data.items ?? []);
        setSubsTotalPages(data.totalPages ?? 1);
      })
      .catch(() => toast.error('Failed to load subscribers'))
      .finally(() => setSubsLoading(false));
  };

  useEffect(() => {
    loadStats();
    if (tab === 'subscribers') loadSubscribers();
  }, [tab, subsPage, subsSearch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await admin.newsletter.delete(deleteId);
      toast.success('Subscriber removed');
      setDeleteId(null);
      loadSubscribers();
      loadStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove subscriber');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Please fill in subject and body');
      return;
    }
    setSending(true);
    try {
      await admin.newsletter.send({
        subject: subject.trim(),
        body: body.trim(),
        language: languageFilter || undefined,
      });
      toast.success('Newsletter sent successfully');
      setSubject('');
      setBody('');
      setLanguageFilter('');
      setSendConfirmOpen(false);
      loadStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send newsletter');
    } finally {
      setSending(false);
    }
  };

  const subscriberColumns = [
    {
      key: 'email', header: 'Email',
      render: (item: Subscriber) => <span className="font-medium text-gray-800 dark:text-gray-200">{item.email}</span>,
    },
    {
      key: 'language', header: 'Language',
      render: (item: Subscriber) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {item.language?.toUpperCase() || 'ALL'}
        </span>
      ),
    },
    { key: 'createdAt', header: 'Subscribed', render: (item: Subscriber) => <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span> },
    {
      key: 'active', header: 'Status',
      render: (item: Subscriber) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${item.active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
          {item.active ? <HiCheck className="w-3 h-3" /> : <HiX className="w-3 h-3" />}
          {item.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions', header: '', className: 'text-right',
      render: (item: Subscriber) => (
        <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600 transition-colors">
          <HiTrash className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Newsletter Management</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-icc-500/10 to-icc-600/5 border border-icc-500/20 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-icc-500/20 flex items-center justify-center">
              <HiUsers className="w-5 h-5 text-icc-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalSubscribers}</p>
              <p className="text-xs text-white/50">Total Subscribers</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <HiCheck className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.activeSubscribers}</p>
              <p className="text-xs text-white/50">Active Subscribers</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <HiPaperAirplane className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.campaignsSent}</p>
              <p className="text-xs text-white/50">Campaigns Sent</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => { setTab('subscribers'); setSubsPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === 'subscribers' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <HiUsers className="w-4 h-4 inline mr-1.5" /> Subscribers
        </button>
        <button
          onClick={() => setTab('send')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === 'send' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <HiPaperAirplane className="w-4 h-4 inline mr-1.5" /> Send Newsletter
        </button>
      </div>

      {tab === 'subscribers' ? (
        <AdminTable
          columns={subscriberColumns}
          data={subscribers}
          loading={subsLoading}
          searchPlaceholder="Search by email..."
          searchValue={subsSearch}
          onSearchChange={(v) => { setSubsSearch(v); setSubsPage(1); }}
          page={subsPage}
          totalPages={subsTotalPages}
          onPageChange={setSubsPage}
          emptyMessage={t('admin.no_subscribers')}
        />
      ) : (
        <div className="max-w-2xl bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject <span className="text-red-500">*</span></label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" placeholder="Newsletter subject" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Body <span className="text-red-500">*</span></label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} className="input-field" rows={8} placeholder="Write your newsletter content..." required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Language Filter</label>
              <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} className="input-field">
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="am">Amharic</option>
                <option value="om">Afaan Oromo</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Send only to subscribers of a specific language</p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  if (!subject.trim() || !body.trim()) {
                    toast.error('Please fill in subject and body');
                    return;
                  }
                  setSendConfirmOpen(true);
                }}
                className="btn-primary inline-flex items-center gap-2"
              >
                <HiPaperAirplane className="w-4 h-4" /> Send Newsletter
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Remove Subscriber" entityName="Subscriber" loading={deleteLoading} />

      {sendConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSendConfirmOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-icc-100 dark:bg-icc-900/30 flex items-center justify-center">
                <HiPaperAirplane className="w-6 h-6 text-icc-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Send Newsletter</h3>
              <p className="text-sm text-gray-500">This will send "{subject}" to {languageFilter ? `${languageFilter.toUpperCase()} ` : ''}subscribers. Continue?</p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 pb-6">
              <button onClick={() => setSendConfirmOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSend} disabled={sending} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-icc-600 hover:bg-icc-700 text-white font-medium text-sm transition-all duration-200 disabled:opacity-50">
                {sending && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                {sending ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
