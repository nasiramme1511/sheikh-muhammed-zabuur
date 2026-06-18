import { useState, useEffect } from 'react';
import {
  Save, RefreshCw, AlertCircle, CheckCircle, Plus, Trash2, Edit3,
  ChevronUp, ChevronDown, Eye, EyeOff, ExternalLink, Home, Music,
  Video, FileText, Radio, Info, Phone, Globe, BookOpen, BookMarked,
  MessageSquare, Users, Settings, HelpCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { appearance } from '../../lib/api';
import { useTranslation } from '../../i18n';

interface NavItem {
  id: string;
  label: string;
  labelAr?: string;
  url: string;
  icon: string;
  target: '_self' | '_blank';
  visible: boolean;
}

const ICON_MAP: Record<string, any> = {
  home: Home, music: Music, video: Video, filetext: FileText,
  radio: Radio, info: Info, phone: Phone, globe: Globe,
  bookopen: BookOpen, bookmark: BookMarked, message: MessageSquare,
  users: Users, settings: Settings, help: HelpCircle,
};

const ICON_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'music', label: 'Music' },
  { value: 'video', label: 'Video' },
  { value: 'filetext', label: 'File Text' },
  { value: 'radio', label: 'Radio' },
  { value: 'bookopen', label: 'Book Open' },
  { value: 'bookmark', label: 'Bookmark' },
  { value: 'globe', label: 'Globe' },
  { value: 'message', label: 'Message' },
  { value: 'users', label: 'Users' },
  { value: 'info', label: 'Info' },
  { value: 'phone', label: 'Phone' },
  { value: 'settings', label: 'Settings' },
  { value: 'help', label: 'Help' },
];

const DEFAULT_ITEMS: NavItem[] = [
  { id: '1', label: 'Home', url: '/', icon: 'home', target: '_self', visible: true },
  { id: '2', label: 'Audio', url: '/audio', icon: 'music', target: '_self', visible: true },
  { id: '3', label: 'Video', url: '/video', icon: 'video', target: '_self', visible: true },
  { id: '4', label: 'PDFs', url: '/pdfs', icon: 'filetext', target: '_self', visible: true },
  { id: '5', label: 'Live', url: '/live', icon: 'radio', target: '_self', visible: true },
  { id: '6', label: 'About', url: '/about', icon: 'info', target: '_self', visible: true },
  { id: '7', label: 'Contact', url: '/contact', icon: 'phone', target: '_self', visible: true },
];

export default function NavigationMenu() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<NavItem[]>(DEFAULT_ITEMS);
  const [editTarget, setEditTarget] = useState<NavItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NavItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<NavItem>({
    id: '', label: '', url: '/', icon: 'globe', target: '_self', visible: true,
  });

  useEffect(() => {
    appearance.get()
      .then(res => {
        const d = res.data;
        if (d?.navItems && d.navItems.length > 0) {
          setItems(d.navItems);
        }
      })
      .catch(() => setError('Failed to load navigation'))
      .finally(() => setLoading(false));
  }, []);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const list = [...items];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setItems(list);
  };

  const toggleVisibility = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, visible: !i.visible } : i));
  };

  const openEdit = (item: NavItem) => setEditTarget({ ...item });

  const handleEditSave = () => {
    if (!editTarget) return;
    setItems(prev => prev.map(i => i.id === editTarget.id ? { ...editTarget } : i));
    setEditTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const openAddModal = () => {
    setNewItem({ id: String(Date.now()), label: '', url: '/', icon: 'globe', target: '_self', visible: true });
    setShowAddModal(true);
  };

  const handleAdd = () => {
    if (!newItem.label.trim()) return;
    setItems(prev => [...prev, { ...newItem, id: String(Date.now()) }]);
    setShowAddModal(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await appearance.update({ navItems: items });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save navigation');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-icc-500 border-t-transparent" />
      </div>
    );
  }

  const renderIcon = (iconName: string, className = 'w-4 h-4') => {
    const Icon = ICON_MAP[iconName?.toLowerCase().replace(/\s/g, '')];
    return Icon ? <Icon className={className} /> : <Globe className={className} />;
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Globe className="w-6 h-6 text-icc-500" />
            Navigation Menu
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage the main navigation menu items, icons, and visibility
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 text-white text-sm font-semibold transition-all">
            <Plus className="w-4 h-4" /> Add Item
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-lg shadow-icc-500/20"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Menu'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-icc-500/10 border border-icc-500/20 text-icc-500 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" /> Navigation saved successfully!
        </div>
      )}

      {/* Items List */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Menu Items ({items.length})</h2>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No navigation items</p>
            <p className="text-xs mt-1">Click "Add Item" to create your first menu item</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-0.5 rounded text-gray-400 hover:text-icc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1} className="p-0.5 rounded text-gray-400 hover:text-icc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shrink-0">
                  {renderIcon(item.icon, 'w-4 h-4')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${item.visible ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 line-through'}`}>
                      {item.label}
                    </span>
                    {item.labelAr && <span className="text-xs text-gray-400" dir="rtl">{item.labelAr}</span>}
                    {item.target === '_blank' && <ExternalLink className="w-3 h-3 text-gray-400" />}
                  </div>
                  <p className="text-xs text-gray-400 font-mono">{item.url}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleVisibility(item.id)} className={`p-1.5 rounded-lg transition-colors ${item.visible ? 'text-gray-400 hover:text-icc-500 hover:bg-icc-50 dark:hover:bg-icc-500/10' : 'text-red-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`} title={item.visible ? 'Hide' : 'Show'}>
                    {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors" title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Add Navigation Item</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Label</label>
                  <input type="text" value={newItem.label} onChange={(e) => setNewItem({ ...newItem, label: e.target.value })} placeholder="e.g. Courses" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Arabic Label (optional)</label>
                  <input type="text" value={newItem.labelAr || ''} onChange={(e) => setNewItem({ ...newItem, labelAr: e.target.value })} placeholder="الدورات" dir="rtl" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">URL</label>
                  <input type="text" value={newItem.url} onChange={(e) => setNewItem({ ...newItem, url: e.target.value })} placeholder="/courses" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Icon</label>
                  <select value={newItem.icon} onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all">
                    {ICON_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target</label>
                  <select value={newItem.target} onChange={(e) => setNewItem({ ...newItem, target: e.target.value as '_self' | '_blank' })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all">
                    <option value="_self">Same Tab (_self)</option>
                    <option value="_blank">New Tab (_blank)</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <button type="button" onClick={() => setNewItem({ ...newItem, visible: !newItem.visible })} className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${newItem.visible ? 'bg-icc-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${newItem.visible ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                  </button>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visible</label>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
                <button onClick={handleAdd} disabled={!newItem.label.trim()} className="px-4 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 disabled:opacity-40 text-white text-sm font-semibold transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditTarget(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Edit Navigation Item</h3>
                <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Label</label>
                  <input type="text" value={editTarget.label} onChange={(e) => setEditTarget({ ...editTarget, label: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Arabic Label</label>
                  <input type="text" value={editTarget.labelAr || ''} onChange={(e) => setEditTarget({ ...editTarget, labelAr: e.target.value })} dir="rtl" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">URL</label>
                  <input type="text" value={editTarget.url} onChange={(e) => setEditTarget({ ...editTarget, url: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Icon</label>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">{renderIcon(editTarget.icon, 'w-4 h-4')}</div>
                    <select value={editTarget.icon} onChange={(e) => setEditTarget({ ...editTarget, icon: e.target.value })} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all">
                      {ICON_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target</label>
                  <select value={editTarget.target} onChange={(e) => setEditTarget({ ...editTarget, target: e.target.value as '_self' | '_blank' })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-icc-500/30 focus:border-icc-500 transition-all">
                    <option value="_self">Same Tab (_self)</option>
                    <option value="_blank">New Tab (_blank)</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <button type="button" onClick={() => setEditTarget({ ...editTarget, visible: !editTarget.visible })} className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${editTarget.visible ? 'bg-icc-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${editTarget.visible ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                  </button>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visible</label>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setEditTarget(null)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
                <button onClick={handleEditSave} className="px-4 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 text-white text-sm font-semibold transition-all flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/10">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Delete Navigation Item</h3>
              </div>
              <p className="text-sm text-gray-500 mb-2">Are you sure you want to delete:</p>
              <p className="text-sm font-semibold bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg text-gray-900 dark:text-white mb-6">{deleteTarget.label}</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
