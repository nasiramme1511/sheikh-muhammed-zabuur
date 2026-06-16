import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Video, FileText, ArrowLeft, Play, Download, BookOpen, Send, Lock, LogIn } from 'lucide-react';
import { FaTelegramPlane } from 'react-icons/fa';
import { collections as collectionsApi, resources as resourcesApi, telegram, telegramAccess } from '../lib/api';
import { COLLECTIONS, getCollectionBySlug, COLLECTION_COLORS } from '../config/collections';
import type { Resource } from '../types';
import { useSEO } from '../seo/metadata';
import { useAuth } from '../context/AuthContext';

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const collection = getCollectionBySlug(slug || '');
  const { user } = useAuth();
  const navigate = useNavigate();

  useSEO({
    title: collection ? collection.name : 'Collection',
    description: `Browse ${collection?.name || 'collection'} resources - audio, video, and PDF materials`,
  });

  const [activeTab, setActiveTab] = useState<'all' | 'AUDIO' | 'VIDEO' | 'PDF'>('all');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ audio: 0, video: 0, pdf: 0 });
  const [telegramChannel, setTelegramChannel] = useState<{ name: string; link?: string; id: number } | null>(null);
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramModalType, setTelegramModalType] = useState<'login' | 'subscribe'>('login');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const params = activeTab === 'all' ? {} : { type: activeTab };
    Promise.all([
      collectionsApi.getBySlug(slug, params),
      telegram.getAll().catch(() => null),
    ]).then(([colRes, telRes]) => {
      const data = Array.isArray(colRes.data) ? colRes.data : [];
      setResources(data);
      setCounts({
        audio: data.filter((r: Resource) => r.resourceType === 'AUDIO').length,
        video: data.filter((r: Resource) => r.resourceType === 'VIDEO').length,
        pdf: data.filter((r: Resource) => r.resourceType === 'PDF').length,
      });
      if (telRes && Array.isArray(telRes.data) && telRes.data.length > 0) {
        const keyword = (slug || '').replace(/[-_]/g, ' ').toLowerCase();
        const match = telRes.data.find((ch: any) => ch.name.toLowerCase().includes(keyword));
        if (match) {
          setTelegramChannel({ name: match.name, id: match.id });
        }
      }
    })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, activeTab]);

  useEffect(() => {
    if (!telegramChannel) return;
    if (!user) {
      setTelegramLink(null);
      return;
    }
    telegram.checkAccess().then(accessRes => {
      if (accessRes.data.allowed) {
        telegramAccess.getAll().then(chRes => {
          const match = (chRes.data ?? []).find((ch: any) => ch.id === telegramChannel.id);
          if (match?.link) setTelegramLink(match.link);
        });
      } else {
        setTelegramLink(null);
      }
    }).catch(() => setTelegramLink(null));
  }, [user, telegramChannel]);

  if (!collection) {
    return (
      <div className="min-h-screen bg-dark-900 pt-24 pb-16 text-white px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Collection not found</h1>
          <Link to="/" className="text-emerald-400 hover:text-emerald-300">Back to Home</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'all' as const, label: 'All', count: resources.length },
    { key: 'AUDIO' as const, label: `Audio (${counts.audio})`, icon: Music },
    { key: 'VIDEO' as const, label: `Video (${counts.video})`, icon: Video },
    { key: 'PDF' as const, label: `PDF (${counts.pdf})`, icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16 text-white px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back + Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-emerald-400 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${COLLECTION_COLORS[collection.slug] || 'bg-white/5 text-white/50 border-white/10'}`}>
              {collection.icon}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{collection.name}</h1>
              <p className="text-white/50 text-sm mt-1">{resources.length} resources</p>
            </div>
          </motion.div>
        </div>

        {/* Telegram Channel */}
        {telegramChannel && (
          <div className="mb-6">
            <div
              onClick={() => {
                if (telegramLink) {
                  window.open(telegramLink, '_blank', 'noopener,noreferrer');
                } else if (!user) {
                  setTelegramModalType('login');
                  setShowTelegramModal(true);
                } else {
                  setTelegramModalType('subscribe');
                  setShowTelegramModal(true);
                }
              }}
              className="glass-card p-4 flex items-center gap-4 group hover:border-blue-500/30 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                <FaTelegramPlane className="w-6 h-6 text-[#0088cc]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/50">Official Telegram Channel</p>
                <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{telegramChannel.name}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium group-hover:bg-blue-500/20 transition-all">
                {!user ? <Lock className="w-4 h-4" /> : !telegramLink ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {!user ? 'Login Required' : !telegramLink ? 'Subscribe' : 'Join'}
              </div>
            </div>
          </div>
        )}

        {/* Telegram Access Modal */}
        {showTelegramModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowTelegramModal(false)}>
            <div className="bg-dark-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10" onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                {telegramModalType === 'login' ? <LogIn className="w-7 h-7 text-blue-400" /> : <Lock className="w-7 h-7 text-blue-400" />}
              </div>
              <h3 className="text-xl font-bold text-center mb-2">
                {telegramModalType === 'login' ? 'Login Required' : 'Subscription Required'}
              </h3>
              <p className="text-white/50 text-center text-sm mb-6">
                {telegramModalType === 'login' ? 'Please login to access Telegram channels.' : 'Subscribe to our newsletter to access Telegram channels.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowTelegramModal(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors text-sm font-medium">
                  Cancel
                </button>
                <button onClick={() => navigate(telegramModalType === 'login' ? '/login' : '/dashboard/profile')} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium">
                  {telegramModalType === 'login' ? 'Login' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/5 pb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-emerald-500 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="animate-pulse bg-white/5 rounded-2xl h-32" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No resources in this collection yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((r, idx) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="glass-card p-5 flex flex-col gap-3 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    r.resourceType === 'PDF' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    r.resourceType === 'AUDIO' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {r.resourceType === 'PDF' ? <FileText className="w-5 h-5" /> :
                     r.resourceType === 'AUDIO' ? <Music className="w-5 h-5" /> :
                     <Video className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block mb-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 text-white/50 border border-white/10">
                      {r.category}
                    </span>
                    <h3 className="text-sm font-bold text-white line-clamp-2">{r.title}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-white/40">
                  <span>{r.views} views</span>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold">
                    {r.resourceType === 'PDF' ? <Download className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {r.resourceType === 'PDF' ? 'Download' : 'Play'}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
